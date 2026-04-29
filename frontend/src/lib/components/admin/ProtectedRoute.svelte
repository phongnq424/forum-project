<script lang="ts">
    import { authState } from "$lib/states/auth.svelte";
    import { goto } from "$app/navigation";

    let { requiredRole = "ADMIN", children } = $props<{
        requiredRole?: string;
        children?: () => any;
    }>();

    let isAuthorized = $state(false);
    let isLoading = $state(true);

    $effect(() => {
        const user = authState.user;

        if (!user) {
            isAuthorized = false;
            isLoading = false;
            goto("/login");
            return;
        }

        if (user.role !== requiredRole) {
            isAuthorized = false;
            isLoading = false;
            goto("/");
            return;
        }

        isAuthorized = true;
        isLoading = false;
    });
</script>

{#if isLoading}
    <div class="flex items-center justify-center min-h-screen">
        <div class="animate-spin">⏳</div>
        <span class="ml-2">Loading...</span>
    </div>
{:else if isAuthorized}
    {@render children?.()}
{:else}
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 class="text-2xl font-bold">Access Denied</h1>
        <p class="text-gray-600">
            You don't have permission to access this page.
        </p>
        <a href="/" class="text-blue-600 hover:underline">Go back home</a>
    </div>
{/if}
