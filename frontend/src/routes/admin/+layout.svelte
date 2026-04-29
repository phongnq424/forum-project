<script lang="ts">
    import type { Snippet } from "svelte";
    import AdminLayout from "$lib/components/admin/AdminLayout.svelte";
    import ProtectedRoute from "$lib/components/admin/ProtectedRoute.svelte";

    let { children }: { children: Snippet } = $props();
</script>

<ProtectedRoute requiredRole="ADMIN">
    <AdminLayout>
        {@render children()}
    </AdminLayout>
</ProtectedRoute>
