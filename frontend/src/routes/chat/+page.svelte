<script lang="ts">
	import { onMount } from "svelte";
	import { socketService } from "$lib/services/socket.svelte";
	import ChatList from "$lib/components/chat/ChatList.svelte";
	import ChatWindow from "$lib/components/chat/ChatWindow.svelte";
	import ChatDetails from "$lib/components/chat/ChatDetail.svelte";
	import Icon from "$lib/components/ui/Icon.svelte";
	import { chatService } from "$lib/services/chat.service";

	let conversations = $state<any[]>([]);
	let isLoadingConversations = $state(true);
	let activeChat = $state<any>(null);
	let currentView = $state<"list" | "chat" | "detail">("list");

	// Tự động chuyển view sang 'chat' khi activeChat thay đổi (cho Mobile)
	$effect(() => {
		if (activeChat && currentView === "list") {
			currentView = "chat";
		}
	});
	function backToList() {
		activeChat = null;
		currentView = "list";
	}

	function backToChat() {
		currentView = "chat";
	}

	async function loadConversations() {
		try {
			const data = (await chatService.listChats()) as any;
			conversations = data.map((c: any) => ({
				id: c.conversationId,
				name:
					c.name || c.peer?.fullname || c.peer?.username || "Unknown",
				avatar: c.avatar,
				peerId: c.peer?.id,
				unreadCount: c.unreadCount,
				lastMsg: c.latestMsg?.content || "",
				online: c.peer?.online || false,
			}));
		} catch (error) {
			console.error("Lỗi khi tải danh sách chat:", error);
		} finally {
			isLoadingConversations = false;
		}
	}

	onMount(() => {
		loadConversations();
	});

	$effect(() => {
		if (activeChat) {
			socketService.joinRoom(activeChat.id);
			return () => socketService.leaveRoom(activeChat.id);
		}
	});
	$effect(() => {
		conversations.forEach((conv) => {
			console.log(
				conv.peerId,
				socketService.onlineUsers[conv.peerId],
				conv.online,
			);
		});
	});
</script>

<div class="chat-page">
	<div class="chat-container">
		<div
			class="column list-col"
			class:mobile-hidden={currentView !== "list"}
		>
			<ChatList
				{conversations}
				bind:activeChat
				isLoading={isLoadingConversations}
			/>
		</div>

		<main
			class="column main-col"
			class:mobile-hidden={currentView !== "chat"}
		>
			{#if activeChat}
				<div class="mobile-header">
					<button class="icon-btn" onclick={backToList}>
						<Icon name="arrow-left" size={24} />
					</button>
					<div class="user-info">
						<span class="name">{activeChat.name}</span>
					</div>
					<button
						class="icon-btn"
						onclick={() => (currentView = "detail")}
					>
						<Icon name="share" size={24} />
					</button>
				</div>

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

		<div
			class="column detail-col"
			class:mobile-hidden={currentView !== "detail"}
		>
			<div class="mobile-header">
				<button class="icon-btn" onclick={backToChat}>
					<Icon name="arrow-left" size={24} />
				</button>
				<span>Details</span>
				<div style="width: 40px;"></div>
			</div>
			<ChatDetails {activeChat} />
		</div>
	</div>
</div>

<style>
	.chat-page {
		height: calc(100vh - 80px);
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
		max-width: 1600px;
		height: 100%;
		background: #1e222b;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #2a2e36;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
		position: relative;
	}

	.column {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #1e222b;
		min-height: 0;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.main-col {
		background: #16191f;
		border-left: 1px solid #2a2e36;
		border-right: 1px solid #2a2e36;
	}

	.mobile-header {
		display: none; /* Ẩn mặc định trên Desktop */
	}

	/* Giao diện trống */
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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

	/* MOBILE RESPONSIVE */
	@media (max-width: 1024px) {
		.chat-page {
			padding: 0;
			height: 100vh; /* Chiếm toàn màn hình trên mobile */
		}

		.chat-container {
			grid-template-columns: 1fr; /* Chỉ 1 cột */
			border-radius: 0;
			display: block;
		}

		.column {
			position: absolute;
			inset: 0;
			width: 100%;
			z-index: 5;
		}

		/* Logic trượt trang */
		.mobile-hidden {
			transform: translateX(100%);
			pointer-events: none;
			visibility: hidden;
		}

		/* Cột list nằm dưới cùng, không cần trượt */
		.list-col.mobile-hidden {
			transform: translateX(-20%); /* Hiệu ứng parallax nhẹ */
		}

		.mobile-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10px 16px;
			background: #1e222b;
			border-bottom: 1px solid #2a2e36;
			height: 60px;
			flex-shrink: 0;
		}

		.icon-btn {
			background: transparent;
			border: none;
			color: #9ca3af;
			cursor: pointer;
			padding: 8px;
			display: flex;
			align-items: center;
		}

		.user-info {
			font-weight: 600;
			color: white;
		}
	}
</style>
