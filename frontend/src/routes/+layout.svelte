<script>
	import "../app.css";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { onMount } from "svelte";
	import { api } from "$lib/services/api";
	import { setAuth, user } from "$lib/stores/auth.store";

	onMount(async () => {
		try {
			const res = await api.post("auth/refresh", {});
			setAuth(res.accessToken);
			console.log("Session khôi phục thành công");
		} catch (err) {
			console.log("Session hết hạn hoặc chưa đăng nhập");
		}
	});
</script>

<div class="app">
	<Header currentUser={$user} />

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
		margin-top: 50px;
	}

	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 48px 20px 40px;
		width: 100%;
	}
</style>
