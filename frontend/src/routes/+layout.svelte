<script lang="ts">
	import "../app.css";
	import Header from "$lib/components/layout/Header.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import ChatBotFab from "$lib/components/chat/ChatBotFab.svelte";
	import { authState } from "$lib/states/auth.svelte";
	import { socketService } from "$lib/services/socket.svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { api } from "$lib/services/api";
	import { untrack } from "svelte";

	let { data, children }: { data: App.PageData; children: any } = $props();

	// Nếu server trả về user data, init store ngay (server data luôn chuẩn hơn localStorage)
	if (data?.user) {
		authState.initAuth(data.user);
	}
	onMount(() => {
		const handleRefresh = () => {
			api.post("/auth/refresh").catch(() => {
				authState.clearAuth();
			});
		};
		handleRefresh();
		const interval = setInterval(handleRefresh, 29 * 60 * 1000);

		return () => clearInterval(interval);
	});
	$effect(() => {
		// Chúng ta chỉ muốn theo dõi biến này
		const user = authState.user;

		// Dùng untrack để bao bọc các logic bên trong
		untrack(() => {
			if (user) {
				// Chỉ kết nối nếu chưa có socket hoặc socket đã bị ngắt
				if (!socketService.socket?.connected) {
					console.log("Đang kết nối Socket...");
					socketService.connect();
				}
			} else {
				console.log("Đang ngắt kết nối Socket...");
			}
		});
	});
</script>

<div class="app">
	<Header {data} />
	<main>
		<div class="page-container">
			{@render children?.()}
			<ChatBotFab />
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
