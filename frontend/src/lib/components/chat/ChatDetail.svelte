<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { goto } from "$app/navigation";
    import { chatService } from "$lib/services/chat.service";
    import type {
        ChatAttachment,
        ChatConversation,
    } from "$lib/types/chat.type";

    let {
        activeChat,
        online = false,
        attachments = [],
    } = $props<{
        activeChat: ChatConversation | null;
        online?: boolean;
        attachments?: ChatAttachment[];
    }>();

    const sharedMedia = $derived(
        attachments.filter((attachment: ChatAttachment) => {
            if (attachment.file_type === "IMAGE" && attachment.url) {
                return true;
            }

            if (attachment.file_type === "DOCUMENT" && attachment.preview_url) {
                return true;
            }

            return false;
        }),
    );

    function handleViewProfile() {
        if (!activeChat?.peerId) return;

        goto(`/profile/${activeChat.peerId}`);
    }

    function getPreviewSrc(attachment: ChatAttachment) {
        if (attachment.file_type === "IMAGE") {
            return attachment.url || "";
        }

        return attachment.preview_url || "";
    }

    async function openAttachment(attachment: ChatAttachment) {
        try {
            if (attachment.file_type === "IMAGE" && attachment.url) {
                window.open(attachment.url, "_blank");
                return;
            }

            const result = await chatService.getAttachmentUrl(attachment.id);
            window.open(result.url, "_blank");
        } catch (error) {
            console.error("Lỗi mở attachment:", error);
        }
    }
</script>

<aside class="profile-sidebar">
    {#if activeChat}
        <div class="profile-info">
            <div class="big-avatar">
                <Avatar
                    name={activeChat.name}
                    src={activeChat.avatar}
                    size="md"
                />
            </div>

            <h3>{activeChat.name}</h3>

            {#if activeChat.type === "GROUP"}
                <p class="bio">
                    {activeChat.scope.replaceAll("_", " ").toLowerCase()}
                </p>
            {:else}
                <div class="profile-status">
                    <span class:online class="profile-status-dot"></span>
                    <span>{online ? "Online" : "Offline"}</span>
                </div>
            {/if}

            <div class="quick-actions">
                {#if activeChat.type === "CHAT"}
                    <Button
                        variant="secondary"
                        onclick={handleViewProfile}
                        disabled={!activeChat.peerId}
                        style="width: 100%;"
                    >
                        <Icon name="user" size={16} />
                        View Profile
                    </Button>

                    <Button
                        variant="danger"
                        style="width: 100%; margin-top: 10px;"
                    >
                        Block User
                    </Button>
                {:else}
                    <Button variant="secondary" style="width: 100%;">
                        <Icon name="folder" size={16} />
                        View Group Info
                    </Button>

                    <Button
                        variant="danger"
                        style="width: 100%; margin-top: 10px;"
                    >
                        Leave Group
                    </Button>
                {/if}
            </div>

            <div class="shared-media">
                <div class="shared-media-header">
                    <h4>Shared Media</h4>

                    {#if sharedMedia.length > 0}
                        <span>{sharedMedia.length}</span>
                    {/if}
                </div>

                {#if sharedMedia.length > 0}
                    <div class="media-grid">
                        {#each sharedMedia.slice(0, 9) as attachment (attachment.id)}
                            <button
                                type="button"
                                class="media-item"
                                title={attachment.original_name || "Attachment"}
                                onclick={() => openAttachment(attachment)}
                            >
                                <img
                                    src={getPreviewSrc(attachment)}
                                    alt={attachment.original_name || "media"}
                                />

                                {#if attachment.file_type === "DOCUMENT"}
                                    <span class="document-badge">
                                        <Icon name="folder" size={12} />
                                    </span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {:else}
                    <p class="empty-media">No shared media yet</p>
                {/if}
            </div>
        </div>
    {:else}
        <div class="placeholder-text">
            <p>No user selected</p>
        </div>
    {/if}
</aside>

<style>
    .profile-sidebar {
        border-left: 1px solid #252a33;
        padding: 28px 18px;
        background: #171a21;
        color: #f3f4f6;
        height: 100%;
        box-sizing: border-box;
    }

    .profile-info {
        text-align: center;
    }

    .big-avatar {
        display: flex;
        justify-content: center;
        margin-bottom: 14px;
    }

    .profile-info h3 {
        margin: 10px 0 4px;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.35;
        color: #f3f4f6;
        letter-spacing: -0.01em;
        word-break: break-word;
    }

    .bio {
        color: #8b949e;
        font-size: 12px;
        margin: 8px 0 18px;
        text-transform: capitalize;
    }

    .profile-status {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #8b949e;
        font-size: 12px;
        margin: 8px 0 18px;
    }

    .profile-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #6b7280;
    }

    .profile-status-dot.online {
        background: #22c55e;
    }

    .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .shared-media {
        margin-top: 30px;
        text-align: left;
    }

    .shared-media-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .shared-media-header h4 {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        color: #d1d5db;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .shared-media-header span {
        font-size: 11px;
        color: #8b949e;
    }

    .media-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 12px;
    }

    .media-item {
        position: relative;
        aspect-ratio: 1;
        background: #20242d;
        border-radius: 10px;
        overflow: hidden;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    .media-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .media-item:hover img {
        filter: brightness(1.12);
    }

    .document-badge {
        position: absolute;
        right: 5px;
        bottom: 5px;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 17, 21, 0.82);
        color: #f3f4f6;
    }

    .empty-media {
        margin: 12px 0 0;
        color: #6b7280;
        font-size: 12px;
    }

    .placeholder-text {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        font-size: 14px;
    }

    .placeholder-text p {
        margin: 0;
    }
</style>
