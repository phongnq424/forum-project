<script>
	import "../app.css";
	import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";

	let user = $state(null);
</script>

<div class="app">
	<Header currentUser={user} />

	<main>
		<div class="page-container">
			<slot />
		</div>
	</main>

	<Footer />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		isolation: isolate;

		/* Clean modern depth background */
		background: radial-gradient(
				circle at 50% -20%,
				#1a1a1a 0%,
				transparent 60%
			),
			#0f1115;
	}

	main {
		flex: 1;
		margin-top: 72px; /* match header height */
	}

	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 48px 20px 80px;
		width: 100%;
	}
</style>
