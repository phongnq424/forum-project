<script lang="ts">
    import { onMount } from "svelte";
    import { adminUserService } from "$lib/services/admin-user.service";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    import type {
        AdminUser,
        AdminUserListResponse,
        UserStatus,
        UserRole,
    } from "$lib/types/admin-user.type";

    let users = $state<AdminUser[]>([]);
    let total = $state(0);

    let page = $state(1);
    let limit = $state(10);
    let search = $state("");
    let statusFilter = $state<UserStatus | "">("");

    let loading = $state(false);
    let error = $state("");

    let showEditModal = $state(false);
    let editingUser = $state<AdminUser | null>(null);
    let editError = $state("");
    let editLoading = $state(false);

    let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

    onMount(loadUsers);

    async function loadUsers() {
        loading = true;
        error = "";

        try {
            const result: AdminUserListResponse =
                await adminUserService.listUsers({
                    page,
                    limit,
                    q: search.trim() || undefined,
                    status: statusFilter || undefined,
                });

            users = result.data;
            total = result.pagination.total;
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
            users = [];
            total = 0;
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        page = 1;
        loadUsers();
    }

    function resetFilters() {
        search = "";
        statusFilter = "";
        page = 1;
        loadUsers();
    }

    function openEditModal(user: AdminUser) {
        editingUser = { ...user };
        editError = "";
        showEditModal = true;
    }

    async function saveUser() {
        if (!editingUser) return;

        if (!editingUser.email?.trim()) {
            editError = "Email is required";
            return;
        }

        editLoading = true;
        editError = "";

        try {
            await adminUserService.updateUser(editingUser.id, {
                email: editingUser.email.trim(),
                role: editingUser.role,
                status: editingUser.status,
            });

            showEditModal = false;
            await loadUsers();
        } catch (e) {
            editError = e instanceof Error ? e.message : String(e);
        } finally {
            editLoading = false;
        }
    }

    async function deleteUser(id: string, username: string) {
        if (!confirm(`Delete user "${username}"?`)) return;

        try {
            await adminUserService.deleteUser(id);
            await loadUsers();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        }
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString();
    }

    function roleClass(role: UserRole) {
        return role === "ADMIN" ? "role-admin" : "role-user";
    }

    function statusClass(status: UserStatus) {
        if (status === "ACTIVE") return "status-active";
        if (status === "BANNED") return "status-banned";
        return "status-inactive";
    }
</script>

<div class="user-page">
    <div class="page-header">
        <div>
            <p class="eyebrow">Admin Control</p>
            <h1>User Management</h1>
            <p>Manage user accounts, roles and account status.</p>
        </div>
    </div>

    <section class="panel filter-panel">
        <div class="filter-row">
            <Input
                bind:value={search}
                placeholder="Search username or email..."
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />

            <select bind:value={statusFilter} class="select">
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BANNED">Banned</option>
            </select>

            <Button onclick={handleSearch}>Search</Button>
            <Button variant="secondary" onclick={resetFilters}>Reset</Button>
        </div>
    </section>

    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <section class="panel table-panel">
        {#if loading}
            <div class="empty-state">Loading users...</div>
        {:else if users.length === 0}
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>No users found</p>
                <span>Try changing the search keyword or status filter.</span>
            </div>
        {:else}
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each users as user (user.id)}
                            <tr>
                                <td>
                                    <div class="user-name">{user.username}</div>
                                </td>

                                <td>
                                    <div class="user-email">{user.email}</div>
                                </td>

                                <td>
                                    <Badge
                                        color={user.role === "ADMIN"
                                            ? "info"
                                            : "default"}
                                    >
                                        {user.role}
                                    </Badge>
                                </td>

                                <td>
                                    <Badge
                                        color={user.status === "ACTIVE"
                                            ? "success"
                                            : user.status === "BANNED"
                                              ? "danger"
                                              : "warning"}
                                    >
                                        {user.status}
                                    </Badge>
                                </td>
                                <td>{formatDate(user.created_at)}</td>

                                <td>
                                    <div class="row-actions">
                                        <button
                                            type="button"
                                            class="icon-btn"
                                            onclick={() => openEditModal(user)}
                                        >
                                            <Icon name="pencil" size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            class="icon-btn danger"
                                            onclick={() =>
                                                deleteUser(
                                                    user.id,
                                                    user.username,
                                                )}
                                        >
                                            <Icon name="trash" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <p>
                    Showing {(page - 1) * limit + 1}–{Math.min(
                        page * limit,
                        total,
                    )} of {total} users
                </p>

                <div class="pagination-actions">
                    <Button
                        variant="secondary"
                        disabled={page === 1}
                        onclick={() => {
                            page = Math.max(1, page - 1);
                            loadUsers();
                        }}
                    >
                        Previous
                    </Button>

                    <span>Page {page} of {totalPages}</span>

                    <Button
                        variant="secondary"
                        disabled={page >= totalPages}
                        onclick={() => {
                            page = Math.min(totalPages, page + 1);
                            loadUsers();
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        {/if}
    </section>
</div>

<Modal
    bind:open={showEditModal}
    title={editingUser ? `Edit User: ${editingUser.username}` : "Edit User"}
    maxWidth="560px"
>
    {#if editingUser}
        <div class="modal-content">
            {#if editError}
                <div class="alert error">
                    {editError}
                </div>
            {/if}

            <div class="form-group">
                <label for="username">Username</label>
                <Input
                    id="username"
                    bind:value={editingUser.username}
                    disabled
                />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <Input id="email" bind:value={editingUser.email} type="email" />
            </div>

            <div class="form-group">
                <label for="role">Role</label>
                <select id="role" bind:value={editingUser.role} class="select">
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div class="form-group">
                <label for="status">Status</label>
                <select
                    id="status"
                    bind:value={editingUser.status}
                    class="select"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BANNED">Banned</option>
                </select>
            </div>

            <div class="modal-actions">
                <Button
                    variant="secondary"
                    disabled={editLoading}
                    onclick={() => (showEditModal = false)}
                >
                    Cancel
                </Button>

                <Button disabled={editLoading} onclick={saveUser}>
                    {editLoading ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    {/if}
</Modal>

<style>
    .user-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
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

    .page-header h1 {
        margin: 0;
        color: #ffffff;
        font-size: 30px;
        font-weight: 800;
    }

    .page-header p:not(.eyebrow) {
        margin: 8px 0 0;
        color: #9ca3af;
        font-size: 14px;
    }

    .panel {
        background: #181b22;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
    }

    .filter-panel {
        padding: 16px;
    }

    .filter-row {
        display: grid;
        grid-template-columns: minmax(240px, 1fr) 180px auto auto;
        gap: 10px;
        align-items: center;
    }

    .select {
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #111318;
        color: #f9fafb;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
    }

    .select:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }

    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 14px;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .table-panel {
        overflow: hidden;
    }

    .table-scroll {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 820px;
    }

    thead {
        background: #20232b;
    }

    th,
    td {
        padding: 15px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
        vertical-align: middle;
        font-size: 14px;
    }

    th {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    td {
        color: #d1d5db;
    }

    tbody tr {
        transition: background-color 0.2s ease;
    }

    tbody tr:hover {
        background: rgba(139, 92, 246, 0.06);
    }

    .text-right {
        text-align: right;
    }

    .user-name {
        color: #ffffff;
        font-weight: 700;
    }

    .user-email {
        color: #9ca3af;
    }

    .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #111318;
        color: #cbd5e1;
        cursor: pointer;
        transition: all 0.2s;
    }

    .icon-btn:hover {
        background: rgba(139, 92, 246, 0.15);
        color: #fff;
    }

    .icon-btn.danger:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px 18px;
        color: #9ca3af;
        font-size: 14px;
    }

    .pagination p {
        margin: 0;
    }

    .pagination-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .pagination-actions span {
        color: #cbd5e1;
    }

    .empty-state {
        padding: 48px 20px;
        text-align: center;
        color: #9ca3af;
    }

    .empty-state p {
        margin: 10px 0 4px;
        color: #ffffff;
        font-weight: 700;
    }

    .empty-state span {
        font-size: 14px;
    }

    .empty-icon {
        font-size: 36px;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        color: #d1d5db;
        font-size: 14px;
        font-weight: 700;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 6px;
    }

    @media (max-width: 900px) {
        .filter-row {
            grid-template-columns: 1fr;
        }

        .pagination {
            flex-direction: column;
            align-items: stretch;
        }

        .pagination-actions {
            justify-content: space-between;
        }
    }
</style>
