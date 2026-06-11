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
	import { authState } from "$lib/states/auth.svelte";
	import VideoCallModal from "$lib/components/chat/VideoCallModal.svelte";
	import { callSession } from "$lib/services/call-session.svelte";
	import type {
		ChatConversation,
		ConversationApiItem,
	} from "$lib/types/chat.type";
	import type {
		ChatAttachment,
		ChatMessage,
	} from "$lib/types/chat-common.type";
	import type { PublicGroupApiItem } from "$lib/types/group.type";

	type SidebarMode = "chats" | "discover";

	let conversations = $state<ChatConversation[]>([]);
	let publicGroups = $state<PublicGroupApiItem[]>([]);

	let sidebarMode = $state<SidebarMode>("chats");

	let isLoadingConversations = $state(true);
	let isLoadingPublicGroups = $state(false);
	let joiningGroupId = $state<string | null>(null);

	let activeChat = $state<ChatConversation | null>(null);
	let currentView = $state<"list" | "chat" | "detail">("list");
	let sharedAttachments = $state<ChatAttachment[]>([]);

	let publicGroupSearch = $state("");

	let routeConversationId = $derived(
		page.url.searchParams.get("conversationId") || "",
	);

	let routeUserId = $derived(page.url.searchParams.get("userId") || "");

	function handleMessagesChange(messages: ChatMessage[]) {
		sharedAttachments = messages.flatMap(
			(message) => message.attachments || [],
		);
	}

	function buildLastMessage(c: ConversationApiItem | PublicGroupApiItem) {
		const latest = c.latestMsg;

		if (!latest) return "";

		if (latest.content && latest.content.trim() !== "") {
			return latest.content;
		}

		const attachments = latest.Attachment || [];

		if (attachments.some((item) => item.file_type === "IMAGE")) {
			return "Sent a photo";
		}

		if (attachments.some((item) => item.file_type === "VIDEO")) {
			return "Sent a video";
		}

		if (attachments.some((item) => item.file_type === "DOCUMENT")) {
			return "Sent a document";
		}

		if (attachments.length > 0) {
			return "Sent an attachment";
		}

		return "";
	}

	function buildPreviewFromMessage(message: any) {
		const content = message?.content || message?.text || "";

		if (content && content.trim() !== "") {
			return content;
		}

		const attachments = message?.Attachment || message?.attachments || [];

		if (
			attachments.some(
				(item: ChatAttachment) => item.file_type === "IMAGE",
			)
		) {
			return "Sent a photo";
		}

		if (
			attachments.some(
				(item: ChatAttachment) => item.file_type === "VIDEO",
			)
		) {
			return "Sent a video";
		}

		if (
			attachments.some(
				(item: ChatAttachment) => item.file_type === "DOCUMENT",
			)
		) {
			return "Sent a document";
		}

		if (attachments.length > 0) {
			return "Sent an attachment";
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

	function normalizePublicGroup(c: PublicGroupApiItem): ChatConversation {
		const id = c.conversationId || c.id || "";

		return {
			id,
			type: "GROUP",
			scope: c.scope || "GENERAL",
			name: c.name || "Unnamed Group",
			avatar: c.avatar || null,
			peerId: undefined,
			topic_id: c.topic_id || null,
			challenge_id: c.challenge_id || null,
			unreadCount: 0,
			lastMsg: buildLastMessage(c),
			online: false,
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

	function moveConversationToTop(
		conversationId: string,
		patch: Partial<ChatConversation>,
	) {
		const current = conversations.find(
			(conv) => conv.id === conversationId,
		);

		if (!current) {
			loadConversations();
			return;
		}

		const updated: ChatConversation = {
			...current,
			...patch,
		};

		conversations = [
			updated,
			...conversations.filter((conv) => conv.id !== conversationId),
		];
	}

	function handleConversationPreviewUpdate(data: {
		conversationId: string;
		message: any;
		senderId?: string;
		incrementUnread?: boolean;
	}) {
		const conversationId = data.conversationId;

		if (!conversationId) return;

		const lastMsg = buildPreviewFromMessage(data.message);
		const isActive = activeChat?.id === conversationId;
		const isMine = data.senderId === authState.user?.id;

		const current = conversations.find(
			(conv) => conv.id === conversationId,
		);

		const currentUnread = current?.unreadCount || 0;

		moveConversationToTop(conversationId, {
			lastMsg,
			unreadCount:
				data.incrementUnread && !isActive && !isMine
					? currentUnread + 1
					: isActive
						? 0
						: currentUnread,
		});
	}

	function handleConversationSelected(chat: ChatConversation) {
		sidebarMode = "chats";

		activeChat = {
			...chat,
			unreadCount: 0,
		};

		conversations = conversations.map((conv) =>
			conv.id === chat.id
				? {
						...conv,
						unreadCount: 0,
					}
				: conv,
		);
	}

	async function loadConversations() {
		isLoadingConversations = true;

		try {
			const [chatData, groupData] = await Promise.all([
				chatService.listChats(),
				chatService.listGroups(),
			]);

			const normalizedChats = chatData.map(normalizeConversation);
			const normalizedGroups = groupData.map(normalizePublicGroup);

			const nextConversations = [...normalizedChats, ...normalizedGroups];

			conversations = nextConversations;

			return nextConversations;
		} catch (error) {
			console.error("Error loading conversation list:", error);
			conversations = [];
			return [];
		} finally {
			isLoadingConversations = false;
		}
	}

	async function loadPublicGroups() {
		isLoadingPublicGroups = true;

		try {
			const data = await chatService.listPublicGroups({
				q: publicGroupSearch.trim() || undefined,
			});

			publicGroups = data;
		} catch (error) {
			console.error("Error loading public groups:", error);
			publicGroups = [];
		} finally {
			isLoadingPublicGroups = false;
		}
	}

	async function handleJoinGroup(group: PublicGroupApiItem) {
		const conversationId = group.conversationId || group.id;

		if (!conversationId) return;
		if (joiningGroupId) return;

		joiningGroupId = conversationId;

		try {
			const result = await chatService.joinGroup(conversationId);
			const realConversationId = result.conversationId || conversationId;

			const nextConversations = await loadConversations();
			await loadPublicGroups();

			const matched = nextConversations.find(
				(conv) => conv.id === realConversationId,
			);

			const nextChat =
				matched ||
				normalizePublicGroup({
					...group,
					conversationId: realConversationId,
					joined: true,
				});

			sidebarMode = "chats";
			activeChat = nextChat;
			currentView = "chat";

			goto(`/chat?conversationId=${realConversationId}`, {
				replaceState: true,
				noScroll: true,
				keepFocus: true,
			});
		} catch (error) {
			console.error("Error joining group:", error);
		} finally {
			joiningGroupId = null;
		}
	}

	function handleOpenJoinedGroup(group: PublicGroupApiItem) {
		const conversationId = group.conversationId || group.id;

		if (!conversationId) return;

		const matched = conversations.find(
			(conv) => conv.id === conversationId,
		);

		if (matched) {
			handleConversationSelected(matched);
		} else {
			activeChat = normalizePublicGroup(group);
			currentView = "chat";
		}

		sidebarMode = "chats";

		goto(`/chat?conversationId=${conversationId}`, {
			noScroll: true,
			keepFocus: true,
		});
	}

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
		sidebarMode = "chats";

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

	function syncActiveChatFromUrl() {
		if (isLoadingConversations) return;

		if (routeConversationId) {
			if (activeChat?.id === routeConversationId) {
				currentView = "chat";
				return;
			}

			const matchedChat = conversations.find(
				(conv) => conv.id === routeConversationId,
			);

			if (matchedChat) {
				activeChat = matchedChat;
				currentView = "chat";
				sidebarMode = "chats";
				return;
			}

			activeChat = null;
			currentView = "list";
			return;
		}

		if (routeUserId) {
			if (activeChat?.peerId === routeUserId) {
				currentView = "chat";
				return;
			}

			const matchedChat = conversations.find(
				(conv) => conv.peerId === routeUserId,
			);

			if (matchedChat) {
				activeChat = matchedChat;
				currentView = "chat";
				sidebarMode = "chats";
				return;
			}

			activeChat = null;
			currentView = "list";
			return;
		}

		if (activeChat !== null) {
			activeChat = null;
		}

		currentView = "list";
	}

	onMount(() => {
		loadConversations();
		loadPublicGroups();
		callSession.init();

		const unsubscribeMessage = socketService.on(
			"chat:message:new",
			(data: any) => {
				const conversationId =
					data.conversationId || data.conversation_id;
				const message = data.message || data;
				const senderId =
					message?.Sender?.id || message?.sender_id || data.senderId;

				if (!conversationId) return;

				handleConversationPreviewUpdate({
					conversationId,
					message,
					senderId,
					incrementUnread: true,
				});
			},
		);

		return () => {
			unsubscribeMessage?.();
			callSession.dispose();
		};
	});

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

	$effect(() => {
		routeConversationId;
		routeUserId;
		conversations;
		isLoadingConversations;

		syncActiveChatFromUrl();
	});

	$effect(() => {
		const q = publicGroupSearch.trim();

		const timeout = setTimeout(
			() => {
				loadPublicGroups();
			},
			q ? 300 : 0,
		);

		return () => clearTimeout(timeout);
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
				{publicGroups}
				bind:activeChat
				bind:sidebarMode
				bind:publicGroupSearch
				isLoading={isLoadingConversations}
				{isLoadingPublicGroups}
				{joiningGroupId}
				onSelectConversation={handleConversationSelected}
				onJoinGroup={handleJoinGroup}
				onOpenJoinedGroup={handleOpenJoinedGroup}
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
					onConversationPreviewUpdate={handleConversationPreviewUpdate}
				/>
			{:else}
				<div class="empty-state">
					<div class="icon-circle">
						<Icon name="message-circle" size={40} />
					</div>
					<h3>Your Messages</h3>
					<p>Select a conversation or discover a public group</p>
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

<VideoCallModal />

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
