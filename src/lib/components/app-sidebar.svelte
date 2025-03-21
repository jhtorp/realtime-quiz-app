<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import House from '@lucide/svelte/icons/house';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { DoorOpen, Moon, Sun } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { Button } from './ui/button';

	// Menu items.
	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Rooms',
			url: '/rooms',
			icon: DoorOpen
		}
		// {
		// 	title: 'Calendar',
		// 	url: '#',
		// 	icon: Calendar
		// },
		// {
		// 	title: 'Search',
		// 	url: '#',
		// 	icon: Search
		// },
		// {
		// 	title: 'Settings',
		// 	url: '#',
		// 	icon: Settings
		// }
	];
</script>

<Sidebar.Root>
	<Sidebar.Header>Realtime quiz app</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer
		><Button onclick={toggleMode} variant="outline" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button></Sidebar.Footer
	>
</Sidebar.Root>
