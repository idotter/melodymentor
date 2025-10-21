<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    onMount(() => {
        goto('/register');
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
    <p class="text-gray-600">Lade...</p>
</div>
