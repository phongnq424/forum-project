<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Modal from "$lib/components/ui/Modal.svelte";
    import AdminGroupFilters from "$lib/components/admin/groups/AdminGroupFilters.svelte";
    import AdminGroupTable from "$lib/components/admin/groups/AdminGroupTable.svelte";
    import AdminGroupCreateModal from "$lib/components/admin/groups/AdminGroupCreateModal.svelte";
    import AdminGroupDetailModal from "$lib/components/admin/groups/AdminGroupDetailModal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { chatService } from "$lib/services/chat.service";
    import { adminTopicService } from "$lib/services/topic.service";
    import { challengeService } from "$lib/services/challenge.service";
    import type { ConversationScope } from "$lib/types/chat-common.type";
    import type {
        AdminCreateGroupPayload,
        AdminUpdateGroupPayload,
        AdminGroupApiItem,
    } from "$lib/types/group.type";

    type SelectOption = {
        value: string;
        label: string;
    };
    async function loadFilterData() {
        try {
            const [topicResult, challengeResult] = await Promise.all([
                adminTopicService.listTopics({
                    page: 1,
                    limit: 100,
                }),
                challengeService.listChallenges({
                    page: 1,
                    limit: 100,
                }),
            ]);

            const topics = Array.isArray(topicResult)
                ? topicResult
                : topicResult.data || [];

            const challenges = Array.isArray(challengeResult)
                ? challengeResult
                : challengeResult.data || [];

            topicOptions = topics.map((topic: any) => ({
                value: topic.id,
                label: topic.name,
            }));

            challengeOptions = challenges.map((challenge: any) => ({
                value: challenge.id,
                label: `${challenge.title}${challenge.type ? ` · ${challenge.type}` : ""}`,
            }));
        } catch (e) {
            console.error("Failed to load group filter data:", e);
            topicOptions = [];
            challengeOptions = [];
        }
    }

    let scopeFilter = $state<ConversationScope | "">("");
    let topicIdFilter = $state("");
    let challengeIdFilter = $state("");

    let topicOptions = $state<SelectOption[]>([]);
    let challengeOptions = $state<SelectOption[]>([]);
    let groups = $state<AdminGroupApiItem[]>([]);
    let selectedGroup = $state<AdminGroupApiItem | null>(null);

    let search = $state("");
    let loading = $state(false);
    let error = $state("");

    let showCreateModal = $state(false);
    let showDetailModal = $state(false);

    let createLoading = $state(false);
    let createError = $state("");
    let updateLoading = $state(false);
    let deleteLoading = $state(false);
    let detailError = $state("");

    onMount(() => {
        loadGroups();
        loadFilterData();
    });

    async function loadGroups() {
        loading = true;
        error = "";

        try {
            groups = await chatService.adminListGroups({
                q: search.trim() || undefined,
                scope: scopeFilter || undefined,
                topic_id: topicIdFilter || undefined,
                challenge_id: challengeIdFilter || undefined,
            });
        } catch (e) {
            error = e instanceof Error ? e.message : "Failed to load groups";
            groups = [];
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        loadGroups();
    }

    function resetFilters() {
        search = "";
        scopeFilter = "";
        topicIdFilter = "";
        challengeIdFilter = "";
        loadGroups();
    }

    function openCreateModal() {
        createError = "";
        showCreateModal = true;
    }

    function closeCreateModal() {
        showCreateModal = false;
        createError = "";
    }

    async function createGroup(payload: AdminCreateGroupPayload) {
        createLoading = true;
        createError = "";

        try {
            await chatService.adminCreateGroup(payload);
            showCreateModal = false;
            await loadGroups();
        } catch (e) {
            createError =
                e instanceof Error ? e.message : "Failed to create group";
        } finally {
            createLoading = false;
        }
    }

    async function updateGroup(payload: AdminUpdateGroupPayload) {
        if (!selectedGroup) return;

        const conversationId = selectedGroup.conversationId || selectedGroup.id;

        if (!conversationId) return;

        updateLoading = true;
        detailError = "";

        try {
            const updated = await chatService.adminUpdateGroup(
                conversationId,
                payload,
            );

            selectedGroup = updated;
            await loadGroups();
        } catch (e) {
            detailError =
                e instanceof Error ? e.message : "Failed to update group";
        } finally {
            updateLoading = false;
        }
    }

    async function deleteGroup(group: AdminGroupApiItem) {
        const conversationId = group.conversationId || group.id;

        if (!conversationId) return;

        const ok = confirm("Delete this group? This action cannot be undone.");

        if (!ok) return;

        deleteLoading = true;
        detailError = "";

        try {
            await chatService.adminDeleteGroup(conversationId);

            showDetailModal = false;
            selectedGroup = null;

            await loadGroups();
        } catch (e) {
            detailError =
                e instanceof Error ? e.message : "Failed to delete group";
        } finally {
            deleteLoading = false;
        }
    }

    function openDetail(group: AdminGroupApiItem) {
        selectedGroup = group;
        showDetailModal = true;
    }

    function closeDetail() {
        selectedGroup = null;
        showDetailModal = false;
    }

    function openChat(group: AdminGroupApiItem) {
        const conversationId = group.conversationId || group.id;

        if (!conversationId) return;

        goto(`/chat?conversationId=${conversationId}`);
    }
</script>

<div class="admin-groups-page">
    <header class="page-header">
        <div>
            <p class="eyebrow">Admin Community</p>
            <h2>Groups</h2>
            <p>
                Create and manage discussion groups by scope, topic, challenge
                or future learning contexts.
            </p>
        </div>

        <Button variant="primary" onclick={openCreateModal}>
            <Icon name="plus" size={16} />
            Create Group
        </Button>
    </header>

    <AdminGroupFilters
        bind:search
        bind:scopeFilter
        bind:topicIdFilter
        bind:challengeIdFilter
        {topicOptions}
        {challengeOptions}
        {loading}
        onSearch={handleSearch}
        onReset={resetFilters}
    />
    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <AdminGroupTable
        {groups}
        {loading}
        onView={openDetail}
        onOpenChat={openChat}
    />
</div>

<Modal bind:open={showCreateModal} title="Create Group" maxWidth="620px">
    <AdminGroupCreateModal
        loading={createLoading}
        error={createError}
        onCreate={createGroup}
        onClose={closeCreateModal}
    />
</Modal>

<Modal bind:open={showDetailModal} title="Group Detail" maxWidth="860px">
    {#if selectedGroup}
        <AdminGroupDetailModal
            group={selectedGroup}
            loading={updateLoading || deleteLoading}
            error={detailError}
            onUpdate={updateGroup}
            onDelete={deleteGroup}
            onOpenChat={openChat}
            onClose={closeDetail}
        />
    {:else}
        <div class="detail-loading">Loading group detail...</div>
    {/if}
</Modal>

<style>
    .admin-groups-page {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a78bfa;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .page-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.03em;
    }

    .page-header p:not(.eyebrow) {
        max-width: 720px;
        margin: 8px 0 0;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.55;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.22);
    }

    .detail-loading {
        padding: 32px;
        text-align: center;
        color: #94a3b8;
        font-size: 13px;
    }

    @media (max-width: 760px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
