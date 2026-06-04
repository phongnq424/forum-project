<script lang="ts">
	import { postService } from "$lib/services/post.service";
	import { recommendationService } from "$lib/services/recommendation.service";
	import { onMount, untrack } from "svelte";
	import type { PageData } from "./$types";

	import PostCard from "$lib/components/ui/PostCard.svelte";
	import Loading from "$lib/components/ui/Loading.svelte";
	import Icon from "$lib/components/ui/Icon.svelte";
	import DiscussHeader from "$lib/components/discuss/DiscussHeader.svelte";
	import DiscussSidebar from "$lib/components/discuss/DiscussSidebar.svelte";
	import CreatePostModal from "$lib/components/discuss/PostFormModal.svelte";
	import { discussState } from "$lib/states/discuss.svelte";

	type SortOption = { value: string; label: string };
	type TrendingPost = { id: number; title: string; author: string };
	type SuggestedAuthor = { name: string; role: string };

	let { data }: { data: PageData } = $props();

	let serverPosts = $derived(data.initialPosts.data ?? []);
	let clientPosts = $state<any[] | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let posts = $derived(clientPosts ?? serverPosts);

	let activeCategory = $state("All");
	let searchQuery = $state("");
	let sortBy = $state("Newest");
	let isCreateModalOpen = $state(false);

	// Abort controller để cancel request cũ
	let abortController: AbortController | null = null;
	let retryCount = $state(0);
	const MAX_RETRIES = 2;
	const RETRY_DELAY = 1000; // 1s

	// 2. DATA CỨNG CHO SIDEBAR (Giữ nguyên)
	const sortOptions: SortOption[] = [
		{ value: "Newest", label: "Newest" },
		{ value: "Most Favorite", label: "Most Favorite" },
	];
	const discussCategories = $derived([
		"All",
		"For You",
		...discussState.categoryNames.filter(
			(name) => name !== "For You" && name !== "All",
		),
	]);

	const trendingPosts: TrendingPost[] = [
		{
			id: 1,
			title: "How to scale SvelteKit apps to millions of users",
			author: "josh_dev",
		},
		{
			id: 2,
			title: "Why Rust is the future of Frontend Tooling",
			author: "ferris_fan",
		},
		{
			id: 3,
			title: "Mastering TypeScript Utility Types",
			author: "pro_coder",
		},
	];

	const suggestedAuthors: SuggestedAuthor[] = [
		{ name: "PN Nguyen", role: "Fullstack Developer" },
		{ name: "Sarah Connor", role: "AI Researcher" },
		{ name: "Tech Lead", role: "Ex-Google Engineer" },
	];

	function buildPostListPayload(
		query: string,
		sort: string,
		category: string,
	): Parameters<typeof postService.listPosts>[0] {
		const payload: Parameters<typeof postService.listPosts>[0] = {
			page: 1,
			limit: 10,
			sortBy: sort,
		};

		if (query.trim() !== "") {
			payload.q = query.trim();
		}

		if (category !== "All" && category !== "For You") {
			const found = discussState.categories.find(
				(c) => c.name === category,
			);

			if (found) {
				payload.category_id = found.id;
			}
		}

		return payload;
	}

	async function fetchPosts(
		query: string,
		sort: string,
		category: string,
		attempt = 0,
	) {
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();

		loading = true;
		error = null;

		try {
			type PostListResult = PageData["initialPosts"];

			const requestPromise: Promise<PostListResult> =
				category === "For You"
					? (recommendationService.getRecommendedPosts({
							page: 1,
							limit: 10,
						}) as Promise<PostListResult>)
					: postService.listPosts(
							buildPostListPayload(query, sort, category),
						);

			const res = await Promise.race<PostListResult>([
				requestPromise,
				new Promise<PostListResult>((_, reject) => {
					setTimeout(
						() => reject(new Error("Request timeout")),
						6000,
					);
				}),
			]);

			clientPosts = res.data ?? [];
			retryCount = 0;
		} catch (err: any) {
			if (err.name === "AbortError") {
				return;
			}

			console.error(
				`Error fetching posts (attempt ${attempt + 1}):`,
				err,
			);

			if (attempt < MAX_RETRIES) {
				const delayMs = RETRY_DELAY * Math.pow(2, attempt);
				console.log(`Retrying in ${delayMs}ms...`);

				await new Promise((resolve) => setTimeout(resolve, delayMs));
				return fetchPosts(query, sort, category, attempt + 1);
			}

			error = "Failed to load posts. Please try again.";
			clientPosts = [];
		} finally {
			loading = false;
		}
	}

	// 5. EFFECT THEO DÕI RIÊNG BIỆT (KHÔNG BỊ LOOP)
	let isFirstLoad = true; // Tránh fetch dư thừa lần đầu tiên

	$effect(() => {
		// Chỉ đăng ký theo dõi 3 biến này
		const q = searchQuery;
		const s = sortBy;
		const c = activeCategory;

		if (isFirstLoad) {
			isFirstLoad = false;
			return; // Bỏ qua lần đầu vì đã có SSR lo
		}

		const timeout = setTimeout(() => {
			// Dùng untrack để chặn Svelte theo dõi biến bên trong hàm này
			untrack(() => fetchPosts(q, s, c));
		}, 300); // Debounce 300ms

		return () => {
			clearTimeout(timeout);
			// Cleanup: cancel pending request khi component unmount
			if (abortController) {
				abortController.abort();
			}
		};
	});
	onMount(() => {
		fetchPosts(searchQuery, sortBy, activeCategory);
	});
</script>

<div class="discuss-container">
	<DiscussHeader
		bind:searchQuery
		bind:sortBy
		bind:activeCategory
		categories={discussCategories}
		{sortOptions}
		onCreatePost={() => (isCreateModalOpen = true)}
	/>

	<main class="discuss-layout">
		<section class="feed-section">
			{#if error}
				<div class="error-alert">
					<Icon name="help-circle" size={20} color="#ef4444" />
					<div class="error-content">
						<p class="error-text">{error}</p>
						<button
							class="retry-btn"
							onclick={() =>
								fetchPosts(searchQuery, sortBy, activeCategory)}
						>
							Retry
						</button>
					</div>
				</div>
			{:else if loading}
				<Loading message="Loading posts..." size="md" />
			{:else if posts.length > 0}
				{#each posts as post}
					<PostCard {post} />
				{/each}
			{:else}
				<div class="empty-state">No posts yet.</div>
			{/if}
		</section>

		<div class="sidebar-wrapper">
			<DiscussSidebar
				{trendingPosts}
				filterGroups={discussState.filterGroups}
				{suggestedAuthors}
			/>
		</div>
	</main>

	<CreatePostModal
		bind:open={isCreateModalOpen}
		topics={discussState.availableTopics}
		onSuccess={() => fetchPosts(searchQuery, sortBy, activeCategory)}
	/>
</div>

<style>
	.discuss-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		color: #e5e7eb;
	}
	.discuss-layout {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 30px;
	}
	.feed-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.error-alert {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 12px;
		color: #fca5a5;
	}
	.error-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.error-text {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
	}
	.retry-btn {
		padding: 8px 16px;
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.4);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}
	.retry-btn:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.6);
	}
	.empty-state {
		color: #6b7280;
		font-size: 14px;
		padding: 20px 0;
		text-align: center;
		background: #14161c;
		border-radius: 12px;
		border: 1px dashed #2a2e36;
	}

	@media (max-width: 900px) {
		.discuss-layout {
			grid-template-columns: 1fr;
		}
		.sidebar-wrapper {
			display: none;
		}
	}
</style>
