<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';

	import '../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<ModeWatcher />
<!-- <main class="flex w-full justify-center">
	<div class="w-full max-w-screen-2xl">
		<div class="flex w-full justify-end py-2">
			<Button onclick={toggleMode} variant="outline" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>

		{@render children()}
	</div>
</main> -->

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		<Sidebar.Trigger />
		<div class="flex w-full justify-center">
			<div class="w-full max-w-screen-xl px-16">
				{@render children?.()}
			</div>
		</div>
	</main>
</Sidebar.Provider>
