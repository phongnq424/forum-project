<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    // Nhận activeChat từ component cha
    let { activeChat } = $props<{ activeChat: any }>();
</script>

<aside class="profile-sidebar">
    {#if activeChat}
        <div class="profile-info">
            <div class="big-avatar">
                <Avatar
                    name={activeChat.name}
                    src={activeChat.avatar}
                    size="lg"
                />
            </div>
            <h3>{activeChat.name}</h3>
            <p class="bio">Software Engineer & UI Designer</p>

            <div class="quick-actions">
                <Button variant="secondary" style="width: 100%">
                    View Profile
                </Button>

                <Button variant="danger" style="width: 100%; margin-top: 10px;">
                    Block User
                </Button>
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
    }
    .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 2px; /* Khoảng cách giữa các button */
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
