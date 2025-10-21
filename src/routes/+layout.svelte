<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation'

	export let data: PageData;
	let { supabase, session } = data;

	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
                // Wenn sich die Session ändert (Login/Logout), validieren wir die Daten neu
				invalidate('supabase:auth')
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<slot />

