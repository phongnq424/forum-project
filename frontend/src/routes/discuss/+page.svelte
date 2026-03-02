<script lang="ts">
	import { onMount } from "svelte";
	import { postService } from "$lib/services/post.service";
	import { categoryService } from "$lib/services/category.service";
	import type { Post, PaginatedPostResponse } from "$lib/types/post.type";
	import type { Category } from "$lib/types/category.type";

	// Import Components
	import PostCard from "$lib/components/ui/PostCard.svelte";
	import Icon from "$lib/components/ui/Icon.svelte";
	import DiscussHeader from "$lib/components/discuss/DiscussHeader.svelte";
	import DiscussSidebar from "$lib/components/discuss/DiscussSidebar.svelte";
	import CreatePostModal from "$lib/components/discuss/CreatePostModal.svelte";

	type SortOption = { value: string; label: string };
	type TrendingPost = { id: number; title: string; author: string };
	type FilterGroup = { name: string; topics: string[] };
	type SuggestedAuthor = { name: string; role: string };

	// State cho dữ liệu động
	let posts = $state<any[]>([]);
	let categories = $state<string[]>(["For You"]);
	let rawCategories = $state<Category[]>([]);

	// State UI
	let loading = $state(true);
	let activeCategory = $state("For You");
	let searchQuery = $state("");
	let sortBy = $state("Newest");
	let filterGroups = $state<FilterGroup[]>([]);
	let isCreateModalOpen = $state(false);
	let availableTopics = $derived(
		rawCategories.flatMap((cat: any) => cat.Topic || []),
	);

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

	async function fetchPosts() {
		loading = true;
		try {
			// 1. Khởi tạo payload mặc định
			let payload: Parameters<typeof postService.listPosts>[0] = {
				page: 1,
				limit: 10,
				sortBy: sortBy, // Gửi trực tiếp "Newest" hoặc "Most Favorite"
			};

			// 2. Nếu đang Search, thêm q vào payload
			if (searchQuery.trim() !== "") {
				payload.q = searchQuery.trim();
			}

			// 3. Nếu đang chọn Category cụ thể (không phải "For You")
			if (activeCategory !== "For You") {
				const foundCat = rawCategories.find(
					(c) => c.name === activeCategory,
				);
				if (foundCat) payload.category_id = foundCat.id;
			}

			const res = await postService.listPosts(payload);

			// 5. Cập nhật danh sách bài viết
			posts = Array.isArray(res?.data) ? res.data : [];
		} catch (error) {
			console.error("Error fetching posts:", error);
			posts = [];
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		try {
			const res = await categoryService.listCategories({
				page: 1,
				limit: 20,
			});

			if (res.data && res.data.length > 0) {
				rawCategories = res.data;
				const categoryNames = res.data.map((c) => c.name);
				categories = ["For You", ...categoryNames];
			}
			filterGroups = res.data
				.map((c: any) => {
					return {
						name: c.name,
						topics: c.Topic
							? c.Topic.map((t: any) =>
									typeof t === "string" ? t : t.name,
								)
							: [],
					};
				})
				.filter((group) => group.topics.length > 0);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	});

	// $effect: Tự gọi lại fetchPosts mỗi khi các state filter bị thay đổi
	$effect(() => {
		searchQuery;
		sortBy;
		activeCategory;
		const timeout = setTimeout(() => {
			fetchPosts();
		}, 300);

		return () => clearTimeout(timeout);
	});
</script>

<div class="discuss-container">
	<DiscussHeader
		bind:searchQuery
		bind:sortBy
		bind:activeCategory
		{categories}
		{sortOptions}
		onCreatePost={() => (isCreateModalOpen = true)}
	/>

	<main class="discuss-layout">
		<section class="feed-section">
			{#if loading}
				<div class="loading-state">Loading posts...</div>
			{:else}
				{#each posts as post}
					<PostCard {post} />
				{:else}
					<div class="empty-state">No posts yet.</div>
				{/each}
			{/if}
		</section>

		<div class="sidebar-wrapper">
			<DiscussSidebar {trendingPosts} {filterGroups} {suggestedAuthors} />
		</div>
	</main>

	<CreatePostModal
		bind:open={isCreateModalOpen}
		topics={availableTopics}
		onSuccess={fetchPosts}
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
