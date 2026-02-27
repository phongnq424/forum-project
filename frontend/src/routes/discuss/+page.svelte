<script lang="ts">
	import { onMount } from "svelte";
	import { postService } from "$lib/services/post.service";

	// Components
	import Card from "$lib/components/ui/Card.svelte";
	import Badge from "$lib/components/ui/Badge.svelte";
	import Button from "$lib/components/ui/Button.svelte";
	import Select from "$lib/components/ui/Select.svelte";
	import Input from "$lib/components/ui/Input.svelte";
	import PostCard from "$lib/components/ui/PostCard.svelte";

	// State (Svelte 5 Runes)
	let posts = $state<any[]>([]);
	let loading = $state(true);
	let activeCategory = $state("For You");
	let searchQuery = $state("");
	let sortBy = $state("Newest");

	// Dữ liệu cứng cho UI
	const sortOptions = [
		{ value: "Newest", label: "Newest" },
		{ value: "Most Favorite", label: "Most Favorite" },
	];
	const categories = [
		"For You",
		"Web",
		"Mobile",
		"DSA",
		"Data Science & AI/ML",
		"Career",
	];
	const trendingPosts = [
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
	const filterGroups = [
		{
			name: "Development",
			topics: ["Frontend", "Backend", "DevOps", "Cloud"],
		},
		{ name: "Design", topics: ["UI/UX", "Figma", "Prototyping"] },
		{ name: "Career", topics: ["Interview", "Salary", "Remote Work"] },
	];
	const suggestedAuthors = [
		{ name: "PN Nguyen", role: "Fullstack Developer" },
		{ name: "Sarah Connor", role: "AI Researcher" },
		{ name: "Tech Lead", role: "Ex-Google Engineer" },
	];

	onMount(async () => {
		try {
			const res = await postService.listPosts({ page: 1, limit: 10 });
			posts = res?.data || [];
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	function getInitial(name: string) {
		return name ? name.charAt(0).toUpperCase() : "U";
	}
</script>

<div class="discuss-container">
	<header class="discuss-header">
		<div class="search-bar-wrapper">
			<div class="search-input">
				<Input
					placeholder="Search posts, topics..."
					bind:value={searchQuery}
				>
					{#snippet icon()}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="11" cy="11" r="8" /><path
								d="m21 21-4.3-4.3"
							/>
						</svg>
					{/snippet}
				</Input>
			</div>
			<div class="sort-filter">
				<Select
					label="Sort By:"
					inline={true}
					options={sortOptions}
					bind:value={sortBy}
					style="width: 200px;"
				/>
			</div>
		</div>

		<div class="category-nav">
			<div class="chips-scroll">
				{#each categories as cat}
					<button
						class="chip {activeCategory === cat ? 'active' : ''}"
						onclick={() => (activeCategory = cat)}
					>
						{cat}
					</button>
				{/each}
			</div>
			<Button
				variant="primary"
				onclick={() => alert("Create post clicked")}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					style="margin-right: 6px;"
				>
					<path
						d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
					/>
				</svg>
				Create Post
			</Button>
		</div>
	</header>

	<main class="discuss-layout">
		<section class="feed-section">
			{#if loading}
				<div class="loading-state">Loading posts...</div>
			{:else}
				{#each posts as post}
					<PostCard {post} />
				{/each}
			{/if}
		</section>

		<aside class="discuss-sidebar">
			<Card variant="default" padding="20px">
				<h3 class="sidebar-heading">🔥 Trending posts</h3>
				<div class="trending-list">
					{#each trendingPosts as trend, i}
						<div class="trend-item">
							<span class="trend-number">0{i + 1}</span>
							<div class="trend-info">
								<p class="trend-title">{trend.title}</p>
								<p class="trend-author">@{trend.author}</p>
							</div>
						</div>
					{/each}
				</div>
			</Card>

			<Card variant="default" padding="20px">
				<h3 class="sidebar-heading">📁 Category filter</h3>
				<div class="category-filter-box">
					{#each filterGroups as group}
						<div class="filter-group">
							<span class="group-label">{group.name}</span>
							<div class="topic-chips">
								{#each group.topics as topic}
									<span class="topic-tag">#{topic}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</Card>

			<Card variant="default" padding="20px">
				<h3 class="sidebar-heading">👤 Suggested authors</h3>
				<div class="author-list">
					{#each suggestedAuthors as author}
						<div class="author-item">
							<div class="author-avatar-mini">
								{getInitial(author.name)}
							</div>
							<div class="author-meta">
								<p class="a-name">{author.name}</p>
								<p class="a-role">{author.role}</p>
							</div>
							<button class="follow-btn">Follow</button>
						</div>
					{/each}
				</div>
			</Card>
		</aside>
	</main>

	<button class="chat-fab" title="Chat with AI Assistant">
		<div class="fab-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M12 8V4H8" /><rect
					width="16"
					height="12"
					x="4"
					y="8"
					rx="2"
				/><path d="M2 14h2" /><path d="M20 14h2" /><path
					d="M15 13v2"
				/><path d="M9 13v2" /></svg
			>
		</div>
		<span class="online-indicator"></span>
	</button>
</div>

<style>
	.discuss-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		color: #e5e7eb;
	}
	.discuss-header {
		margin-bottom: 30px;
	}
	.search-bar-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		gap: 20px;
	}
	.search-input {
		flex: 1;
		position: relative;
	}

	.sort-filter {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: #9ca3af;
	}
	.category-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
	}
	.chips-scroll {
		display: flex;
		gap: 10px;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.chip {
		padding: 8px 18px;
		background: #1e222b;
		border: 1px solid #2a2e36;
		border-radius: 20px;
		font-size: 14px;
		white-space: nowrap;
		cursor: pointer;
		color: #9ca3af;
	}
	.chip.active {
		background: #6366f1;
		color: white;
		border-color: #6366f1;
	}

	.discuss-layout {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 30px;
	}
	.discuss-sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.sidebar-heading {
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: #6b7280;
		margin-bottom: 20px;
	}

	/* Trending & Authors */
	.trend-item {
		display: flex;
		gap: 15px;
		margin-bottom: 16px;
	}
	.trend-number {
		font-size: 24px;
		font-weight: 800;
		color: #2a2e36;
	}
	.trend-title {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
		line-height: 1.4;
	}
	.trend-author {
		font-size: 12px;
		color: #6366f1;
		margin-top: 4px;
	}
	.author-item {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}
	.author-avatar-mini {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #374151;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 12px;
	}
	.author-meta {
		flex: 1;
	}
	.a-name {
		font-size: 13px;
		font-weight: 600;
		margin: 0;
	}
	.a-role {
		font-size: 11px;
		color: #6b7280;
		margin: 0;
	}
	.follow-btn {
		font-size: 11px;
		font-weight: 700;
		background: #fff;
		color: #000;
		border: none;
		padding: 6px 14px;
		border-radius: 20px;
		cursor: pointer;
	}

	/* Category Filter */
	.filter-group {
		margin-bottom: 16px;
	}
	.group-label {
		font-size: 11px;
		font-weight: 800;
		color: #6366f1;
		text-transform: uppercase;
		display: block;
		margin-bottom: 8px;
	}
	.topic-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.topic-tag {
		font-size: 12px;
		color: #9ca3af;
		background: #14161c;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid #2a2e36;
		cursor: pointer;
	}

	/* FAB Bot */
	.chat-fab {
		position: fixed;
		bottom: 30px;
		right: 30px;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		border: none;
		color: white;
		box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: 0.3s;
		z-index: 100;
	}
	.online-indicator {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 14px;
		height: 14px;
		background: #10b981;
		border: 3px solid #14161c;
		border-radius: 50%;
	}

	@media (max-width: 900px) {
		.discuss-layout {
			grid-template-columns: 1fr;
		}
		.discuss-sidebar {
			display: none;
		}
	}
</style>
