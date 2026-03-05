<script lang="ts">
	import { onMount } from "svelte";
	import { socketService } from "$lib/services/socket.svelte";
	import ChatList from "$lib/components/chat/ChatList.svelte";
	import ChatWindow from "$lib/components/chat/ChatWindow.svelte";
	import ChatDetails from "$lib/components/chat/ChatDetail.svelte";
	import Icon from "$lib/components/ui/Icon.svelte";
	import { chatService } from "$lib/services/chat.service";

	let conversations = $state<any[]>([]); // Sẽ fetch từ API
	let activeChat = $state<any>(null);

	async function loadConversations() {
		try {
			const data = (await chatService.listChats()) as any;

			conversations = data.map((c: any) => ({
				id: c.conversationId,
				name: c.peer?.username || "Unknown",
				avatar: c.avatar,
				peerId: c.peer?.id,
				unreadCount: c.unreadCount,
				lastMsg: c.latestMsg?.content || "",
				online: false,
			}));
		} catch (error) {
			console.error("Lỗi khi tải danh sách chat:", error);
		}
	}
	onMount(() => {
		socketService.connect();
		loadConversations();
	});

	$effect(() => {
		if (activeChat) {
			socketService.joinRoom(activeChat.id);
			return () => socketService.leaveRoom(activeChat.id);
		}
	});
</script>

<div class="chat-page">
	<div class="chat-container">
		<ChatList {conversations} bind:activeChat />

		<main class="chat-main">
			{#if activeChat}
				<ChatWindow {activeChat} />
			{:else}
				<div class="empty-state">
					<div class="icon-circle">
						<Icon name="message-circle" size={40} />
					</div>
					<h3>Your Messages</h3>
					<p>Select a conversation to start chatting</p>
				</div>
			{/if}
		</main>

		<ChatDetails {activeChat} />
	</div>
</div>

<style>
	.chat-page {
		height: calc(
			100vh - 80px
		); /* 80px là chiều cao dự kiến của Navbar tổng */
		padding: 24px;
		background: #0f1115;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.chat-container {
		display: grid;
		grid-template-columns: 320px 1fr 300px;
		width: 100%;
		max-width: 1600px; /* Giới hạn độ rộng để không bị loãng trên màn siêu to */
		height: 100%;
		background: #1e222b;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #2a2e36;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
	}

	.chat-main {
		background: #16191f;
		display: flex;
		flex-direction: column;
		position: relative; /* Quan trọng cho layout con bên trong */
	}

	/* Giao diện khi chưa chọn ai */
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: #9ca3af;
	}
	.icon-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: #2a2e36;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
		color: #6366f1;
	}
	.empty-state h3 {
		color: white;
		font-size: 20px;
		margin: 0 0 10px 0;
	}
	.empty-state p {
		font-size: 14px;
		margin: 0;
	}
</style>
