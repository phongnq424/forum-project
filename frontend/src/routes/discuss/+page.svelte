<script lang="ts">
	import { onMount } from "svelte";
	import { postService } from "$lib/services/post.service";
	import { untrack } from "svelte";

	// Import Components
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

	let { data } = $props();
	let serverPosts = $derived(data.initialPosts?.data || []);
	let clientPosts = $state<any[] | null>(null);
	let loading = $state(false);
	let posts = $derived(clientPosts ?? serverPosts);

	let activeCategory = $state("For You");
	let searchQuery = $state("");
	let sortBy = $state("Newest");
	let isCreateModalOpen = $state(false);

	// 2. DATA CỨNG CHO SIDEBAR (Giữ nguyên)
	const sortOptions: SortOption[] = [
		{ value: "Newest", label: "Newest" },
		{ value: "Most Favorite", label: "Most Favorite" },
	];

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

	async function fetchPosts(query: string, sort: string, category: string) {
		loading = true;
		try {
			let payload: Parameters<typeof postService.listPosts>[0] = {
				page: 1,
				limit: 10,
				sortBy: sort,
			};

			if (query.trim() !== "") payload.q = query.trim();

			if (category !== "For You") {
				const found = discussState.categories.find(
					(c) => c.name === category,
				);
				if (found) payload.category_id = found.id;
			}

			const res = await postService.listPosts(payload);
			clientPosts = res?.data || []; // Cập nhật state Client
		} catch (error) {
			console.error("Error fetching posts:", error);
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
		}, 300);

		return () => clearTimeout(timeout);
	});
</script>

<div class="discuss-container">
	<DiscussHeader
		bind:searchQuery
		bind:sortBy
		bind:activeCategory
		categories={discussState.categoryNames}
		{sortOptions}
		onCreatePost={() => (isCreateModalOpen = true)}
	/>

	<main class="discuss-layout">
		<section class="feed-section">
			{#if loading}
				<Loading message="Loading posts..." size="md" />
			{:else}
				{#each posts as post}
					<PostCard {post} />
				{:else}
					<div class="empty-state">No posts yet.</div>
				{/each}
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
