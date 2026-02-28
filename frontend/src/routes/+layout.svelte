<script lang="ts">
	import "../app.css";
	import Header from "$lib/components/ui/Header.svelte";
	import Footer from "$lib/components/ui/Footer.svelte";
	import { auth, user, initAuth } from "$lib/stores/auth.store";

	let { data, children }: { data: App.PageData; children: any } = $props();

	// Nếu server trả về user data, init store ngay (server data luôn chuẩn hơn localStorage)
	if (data?.user) {
		initAuth(data.user);
	}
</script>

<div class="app">
	<Header {data} />
	<main>
		<div class="page-container">
			{@render children?.()}
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
		margin-top: 30px;
	}

	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 48px 20px 30px;
		width: 100%;
	}
</style>
