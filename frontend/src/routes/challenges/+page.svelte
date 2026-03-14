<script lang="ts">
	import { untrack } from "svelte";
	import type { ChallengeType, Challenge } from "$lib/types/challenge.type";
	import { challengeService } from "$lib/services/challenge.service";
	import ChallengeHeader from "$lib/components/challenge/ChallengeHeader.svelte";
	import ChallengeList from "$lib/components/challenge/ChallengeList.svelte";
	import ChallengeSidebar from "$lib/components/challenge/ChallengeSidebar.svelte";

	// 1. State
	let activeTab = $state<ChallengeType>("DSA");
	let searchQuery = $state("");
	let sortBy = $state("newest");
	let isLoading = $state(false);
	let challenges = $state<Challenge[]>([]);
	let totalChallenges = $state(0);

	const categories: { id: ChallengeType; label: string }[] = [
		{ id: "DSA", label: "DSA / Algorithm" },
		{ id: "SQL", label: "SQL Database" },
		{ id: "BACKEND", label: "Backend System" },
	];

	const sortOptions = [
		{ value: "newest", label: "Newest" },
		{ value: "difficulty-asc", label: "Easy to Hard" },
		{ value: "difficulty-desc", label: "Hard to Easy" },
	];

	async function fetchChallenges() {
		isLoading = true;

		try {
			// Gọi qua service với các params từ state
			const response = await challengeService.listChallenges({
				type: activeTab,
				sortBy: sortBy,
				q: searchQuery,
				page: 1,
				limit: 20,
			});

			challenges = response.data;
			totalChallenges = response.pagination.total;
		} catch (error) {
			console.error("Lỗi khi tải danh sách thử thách:", error);
			challenges = [];
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		// Theo dõi sự thay đổi
		const _trigger = [activeTab, searchQuery, sortBy];

		const timeout = setTimeout(() => {
			untrack(() => fetchChallenges());
		}, 300);

		return () => clearTimeout(timeout);
	});
</script>

<div class="page-container">
	<ChallengeHeader
		bind:searchQuery
		bind:sortBy
		bind:activeTab
		{categories}
		{sortOptions}
	/>

	<div class="main-layout">
		<div class="content-area">
			<ChallengeList {challenges} {isLoading} {searchQuery} {activeTab} />
		</div>

		<ChallengeSidebar completed={0} total={totalChallenges} />
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

	@media (max-width: 900px) {
		.page-container {
			padding: 12px;
		}

		.main-layout {
			grid-template-columns: 1fr;
			gap: 20px; /* Giảm gap giữa list và sidebar khi xếp chồng */
		}
	}
</style>
