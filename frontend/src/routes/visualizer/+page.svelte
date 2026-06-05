<script lang="ts">
	import type {
		VisualizerCategory,
		VisualizerDifficulty,
	} from "$lib/types/visualizer.type";
	import { visualizers } from "$lib/data/visualizers";

	import VisualizerHeader from "$lib/components/visualizer/VisualizerHeader.svelte";
	import VisualizerList from "$lib/components/visualizer/VisualizerList.svelte";
	import VisualizerSidebar from "$lib/components/visualizer/VisualizerSidebar.svelte";

	let activeCategory = $state<VisualizerCategory | "ALL">("ALL");
	let searchQuery = $state("");
	let sortBy = $state("featured");
	let completedSlugs = $state<string[]>([]);

	const categories: { id: VisualizerCategory | "ALL"; label: string }[] = [
		{ id: "ALL", label: "All Visualizers" },
		{ id: "SEARCH", label: "Search" },
		{ id: "SORTING", label: "Sorting" },
		{ id: "GRAPH", label: "Graph" },
		{ id: "DATA_STRUCTURE", label: "Data Structure" },
		{ id: "DYNAMIC_PROGRAMMING", label: "Dynamic Programming" },
	];

	const sortOptions = [
		{ value: "featured", label: "Featured" },
		{ value: "difficulty-asc", label: "Easy to Hard" },
		{ value: "time-asc", label: "Shortest First" },
		{ value: "name-asc", label: "Name A-Z" },
	];

	const difficultyRank: Record<VisualizerDifficulty, number> = {
		EASY: 1,
		MEDIUM: 2,
		HARD: 3,
	};

	let filteredVisualizers = $derived(
		(() => {
			const keyword = searchQuery.trim().toLowerCase();

			const result = visualizers.filter((item) => {
				const matchCategory =
					activeCategory === "ALL" ||
					item.category === activeCategory;

				const matchKeyword =
					!keyword ||
					item.title.toLowerCase().includes(keyword) ||
					item.description.toLowerCase().includes(keyword) ||
					item.tags.some((tag) =>
						tag.toLowerCase().includes(keyword),
					);

				return matchCategory && matchKeyword;
			});

			return [...result].sort((a, b) => {
				if (sortBy === "difficulty-asc") {
					return (
						difficultyRank[a.difficulty] -
						difficultyRank[b.difficulty]
					);
				}

				if (sortBy === "time-asc") {
					return a.estimatedTime - b.estimatedTime;
				}

				if (sortBy === "name-asc") {
					return a.title.localeCompare(b.title);
				}

				return (
					Number(Boolean(b.featured)) - Number(Boolean(a.featured))
				);
			});
		})(),
	);

	let featuredVisualizers = $derived(
		visualizers.filter((item) => item.featured).slice(0, 4),
	);

	let completedCount = $derived(
		visualizers.filter((item) => completedSlugs.includes(item.slug)).length,
	);
</script>

<svelte:head>
	<title>Visualizer | Algorithm Lab</title>
</svelte:head>

<div class="page-container">
	<VisualizerHeader
		bind:searchQuery
		bind:sortBy
		bind:activeCategory
		{categories}
		{sortOptions}
	/>

	<div class="main-layout">
		<div class="content-area">
			<VisualizerList
				visualizers={filteredVisualizers}
				{searchQuery}
				{activeCategory}
				{completedSlugs}
			/>
		</div>

		<VisualizerSidebar
			completed={completedCount}
			total={visualizers.length}
			{featuredVisualizers}
		/>
	</div>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
		background: #0f1115;
		min-height: 100vh;
		color: #e5e7eb;
	}

	.main-layout {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 32px;
	}

	.content-area {
		min-width: 0;
	}

	@media (max-width: 900px) {
		.page-container {
			padding: 12px;
		}

		.main-layout {
			grid-template-columns: 1fr;
			gap: 20px;
		}
	}
</style>
