<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { socketService } from "$lib/services/socket.svelte";
	import ChatList from "$lib/components/chat/ChatList.svelte";
	import ChatWindow from "$lib/components/chat/ChatWindow.svelte";
	import ChatDetails from "$lib/components/chat/ChatDetail.svelte";
	import Button from "$lib/components/ui/Button.svelte";
	import Icon from "$lib/components/ui/Icon.svelte";
	import Avatar from "$lib/components/ui/Avatar.svelte";
	import { chatService } from "$lib/services/chat.service";
	import type {
		ChatAttachment,
		ChatConversation,
		ConversationApiItem,
		ChatMessage,
	} from "$lib/types/chat.type";

	let conversations = $state<ChatConversation[]>([]);
	let isLoadingConversations = $state(true);
	let activeChat = $state<ChatConversation | null>(null);
	let currentView = $state<"list" | "chat" | "detail">("list");
	let sharedAttachments = $state<ChatAttachment[]>([]);
	let routeConversationId = $derived(
		page.url.searchParams.get("conversationId") || "",
	);
	let routeUserId = $derived(page.url.searchParams.get("userId") || "");

	function handleMessagesChange(messages: ChatMessage[]) {
		sharedAttachments = messages.flatMap(
			(message) => message.attachments || [],
		);
	}

	function buildLastMessage(c: ConversationApiItem) {
		const latest = c.latestMsg;

		if (!latest) return "";

		if (latest.content && latest.content.trim() !== "") {
			return latest.content;
		}

		const attachments = latest.Attachment || [];

		if (attachments.some((item) => item.file_type === "IMAGE")) {
			return "Đã gửi một ảnh";
		}

		if (attachments.some((item) => item.file_type === "VIDEO")) {
			return "Đã gửi một video";
		}

		if (attachments.some((item) => item.file_type === "DOCUMENT")) {
			return "Đã gửi một tài liệu";
		}

		if (attachments.length > 0) {
			return "Đã gửi một tệp đính kèm";
		}

		return "";
	}

	function normalizeConversation(c: ConversationApiItem): ChatConversation {
		const id = c.conversationId || c.id || "";

		return {
			id,
			type: c.type || "CHAT",
			scope: c.scope || "GENERAL",
			name: c.name || c.peer?.fullname || c.peer?.username || "Unknown",
			avatar: c.avatar || c.peer?.avatar || null,
			peerId: c.peer?.id,
			topic_id: c.topic_id || null,
			challenge_id: c.challenge_id || null,
			unreadCount: c.unreadCount || 0,
			lastMsg: buildLastMessage(c),
			online: c.peer?.online || false,
		};
	}

	function getActiveOnlineStatus(chat: ChatConversation | null) {
		if (!chat) return false;
		if (!chat.peerId) return chat.online;

		const socketOnline = socketService.onlineUsers[chat.peerId];

		if (socketOnline !== undefined) {
			return socketOnline;
		}

		return chat.online;
	}

	let activeChatOnline = $derived(getActiveOnlineStatus(activeChat));

	$effect(() => {
		if (activeChat && currentView === "list") {
			currentView = "chat";
		}
	});

	$effect(() => {
		if (!activeChat) {
			sharedAttachments = [];
			return;
		}

		activeChat.id;
		sharedAttachments = [];
	});

	$effect(() => {
		if (!activeChat?.peerId) return;

		const socketOnline = socketService.onlineUsers[activeChat.peerId];

		if (socketOnline === undefined) return;
		if (activeChat.online === socketOnline) return;

		const activeChatId = activeChat.id;

		activeChat = {
			...activeChat,
			online: socketOnline,
		};

		conversations = conversations.map((conv) =>
			conv.id === activeChatId
				? {
						...conv,
						online: socketOnline,
					}
				: conv,
		);
	});

	function backToList() {
		activeChat = null;
		currentView = "list";

		goto("/chat", {
			noScroll: true,
			keepFocus: true,
		});
	}

	function backToChat() {
		currentView = "chat";
	}

	function handleConversationCreated(updatedChat: ChatConversation) {
		activeChat = updatedChat;
		currentView = "chat";

		const exists = conversations.some((conv) => conv.id === updatedChat.id);

		if (!exists) {
			conversations = [updatedChat, ...conversations];
		} else {
			conversations = conversations.map((conv) =>
				conv.id === updatedChat.id ? updatedChat : conv,
			);
		}

		if (!updatedChat.id.startsWith("temp_")) {
			goto(`/chat?conversationId=${updatedChat.id}`, {
				replaceState: true,
				noScroll: true,
				keepFocus: true,
			});
		}
	}

	async function loadConversations() {
		isLoadingConversations = true;

		try {
			const data = await chatService.listChats();
			conversations = data.map(normalizeConversation);
		} catch (error) {
			console.error("Lỗi khi tải danh sách chat:", error);
			conversations = [];
		} finally {
			isLoadingConversations = false;
		}
	}

	function syncActiveChatFromUrl() {
		if (isLoadingConversations) return;

		if (routeConversationId) {
			const matchedChat = conversations.find(
				(conv) => conv.id === routeConversationId,
			);

			if (matchedChat) {
				activeChat = matchedChat;
				currentView = "chat";
				return;
			}

			activeChat = null;
			currentView = "list";
			return;
		}

		if (routeUserId) {
			const matchedChat = conversations.find(
				(conv) => conv.peerId === routeUserId,
			);

			if (matchedChat) {
				activeChat = matchedChat;
				currentView = "chat";
				return;
			}

			activeChat = null;
			currentView = "list";
			return;
		}

		activeChat = null;
		currentView = "list";
	}

	onMount(() => {
		loadConversations();
	});

	$effect(() => {
		routeConversationId;
		routeUserId;
		conversations;
		isLoadingConversations;

		syncActiveChatFromUrl();
	});

	$effect(() => {
		const chat = activeChat;

		if (!chat || chat.id.startsWith("temp_")) {
			return;
		}

		socketService.joinRoom(chat.id);

		return () => {
			socketService.leaveRoom(chat.id);
		};
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
					<Button variant="secondary" size="sm" onclick={backToList}>
						<Icon name="arrow-left" size={20} />
					</Button>

					<div class="chat-mobile-user">
						<div class="mobile-avatar-wrap">
							<Avatar
								name={activeChat.name}
								src={activeChat.avatar ?? undefined}
								size="sm"
							/>

							{#if activeChat.type === "CHAT"}
								<span
									class:online={activeChatOnline}
									class="mobile-status-dot"
								></span>
							{/if}
						</div>

						<div class="mobile-user-text">
							<span class="mobile-name">{activeChat.name}</span>

							{#if activeChat.type === "CHAT"}
								<span class="mobile-status">
									{activeChatOnline ? "Online" : "Offline"}
								</span>
							{:else}
								<span class="mobile-status">
									{activeChat.scope
										.replaceAll("_", " ")
										.toLowerCase()}
								</span>
							{/if}
						</div>
					</div>

					<Button
						variant="secondary"
						size="sm"
						onclick={() => (currentView = "detail")}
					>
						<Icon name="user" size={20} />
					</Button>
				</div>

				<ChatWindow
					{activeChat}
					online={activeChatOnline}
					onConversationCreated={handleConversationCreated}
					onMessagesChange={handleMessagesChange}
				/>
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
				<Button variant="secondary" size="sm" onclick={backToChat}>
					<Icon name="arrow-left" size={20} />
				</Button>

				<span class="detail-title">Details</span>
				<div style="width: 36px;"></div>
			</div>

			<ChatDetails
				{activeChat}
				online={activeChatOnline}
				attachments={sharedAttachments}
			/>
		</div>
	</div>
</div>

<style>
	.chat-page {
		height: 90dvh;
		padding: 24px;
		background: #0f1115;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.chat-container {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr) 300px;
		width: 100%;
		max-width: 1600px;
		height: 100%;
		background: #171a21;
		border-radius: 18px;
		overflow: hidden;
		border: 1px solid #252a33;
		box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
		position: relative;
	}

	.column {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #171a21;
		min-height: 0;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.main-col {
		background: #10131a;
		border-left: 1px solid #252a33;
		border-right: 1px solid #252a33;
	}

	.mobile-header {
		display: none;
	}

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #8b949e;
	}

	.empty-state h3 {
		margin: 14px 0 6px;
		font-size: 18px;
		font-weight: 600;
		color: #f3f4f6;
		letter-spacing: -0.02em;
	}

	.empty-state p {
		margin: 0;
		font-size: 14px;
		color: #8b949e;
	}

	.icon-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: #1c2029;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
		color: #6366f1;
	}

	@media (max-width: 1024px) {
		.chat-page {
			padding: 0;
			height: 100vh;
		}

		.chat-container {
			grid-template-columns: 1fr;
			border-radius: 0;
			display: block;
		}

		.column {
			position: absolute;
			inset: 0;
			width: 100%;
			z-index: 5;
		}

		.mobile-hidden {
			transform: translateX(100%);
			pointer-events: none;
			visibility: hidden;
		}

		.list-col.mobile-hidden {
			transform: translateX(-20%);
		}

		.mobile-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10px 16px;
			background: #171a21;
			border-bottom: 1px solid #252a33;
			height: 44px;
			flex-shrink: 0;
		}

		.chat-mobile-user {
			display: flex;
			align-items: center;
			gap: 10px;
			min-width: 0;
			flex: 1;
			justify-content: center;
			padding: 0 12px;
		}

		.mobile-avatar-wrap {
			position: relative;
			flex-shrink: 0;
		}

		.mobile-status-dot {
			position: absolute;
			right: -1px;
			bottom: -1px;
			width: 10px;
			height: 10px;
			border-radius: 999px;
			background: #6b7280;
			border: 2px solid #171a21;
		}

		.mobile-status-dot.online {
			background: #22c55e;
		}

		.mobile-user-text {
			display: flex;
			flex-direction: column;
			min-width: 0;
			text-align: left;
		}

		.mobile-name {
			font-size: 13px;
			font-weight: 600;
			color: #f3f4f6;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			letter-spacing: -0.01em;
		}

		.mobile-status {
			font-size: 11px;
			color: #8b949e;
			text-transform: capitalize;
		}

		.detail-title {
			font-size: 13px;
			font-weight: 600;
			color: #f3f4f6;
		}
	}
</style>
