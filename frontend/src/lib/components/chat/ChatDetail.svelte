<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { ChatConversation } from "$lib/types/chat.type";
    import { goto } from "$app/navigation";

    let { activeChat } = $props<{
        activeChat: ChatConversation | null;
    }>();

    function handleViewProfile() {
        if (!activeChat?.peerId) return;

        goto(`/profile/${activeChat.peerId}`);
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
                <p class="bio">Software Engineer & UI Designer</p>
            {/if}

            <div class="quick-actions">
                {#if activeChat.type === "CHAT"}
                    <Button
                        variant="secondary"
                        onclick={handleViewProfile}
                        disabled={!activeChat.peerId}
                    >
                        <Icon name="user" />
                        View Profile
                    </Button>

                    <Button
                        variant="danger"
                        style="width: 100%; margin-top: 10px;"
                    >
                        Block User
                    </Button>
                {:else}
                    <Button variant="secondary"
                        ><Icon name="folder" /> View Group Info</Button
                    >

                    <Button
                        variant="danger"
                        style="width: 100%; margin-top: 10px;"
                    >
                        Leave Group
                    </Button>
                {/if}
            </div>

            <div class="shared-media">
                <h4>Shared Media</h4>

                <div class="media-grid">
                    {#each Array(3) as _}
                        <div class="media-item"></div>
                    {/each}
                </div>
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
        border-left: 1px solid #2a2e36;
        padding: 30px 20px;
        background: #1e222b;
        color: white;
        height: 100%;
        box-sizing: border-box;
    }

    .profile-info {
        text-align: center;
    }

    .big-avatar {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .bio {
        color: #9ca3af;
        font-size: 13px;
        margin: 10px 0 20px;
        text-transform: capitalize;
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

    .media-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 10px;
    }

    .media-item {
        aspect-ratio: 1;
        background: #2a2e36;
        border-radius: 8px;
    }

    .placeholder-text {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
    }
</style>
