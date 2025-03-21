<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { startGameSchema } from '$lib/schemas.js';

	import type { Tables } from '$lib/supabase-types.js';
	import { onDestroy, onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	let { supabase, gameRoom, player } = data;

	let roomId = $state(Number(page.params.roomId));
	let players: Tables<'players'>[] | [] | { [key: string]: any } = $state([]);
	let gameStatus: 'waiting' | 'in_progress' | 'complete' = $state(gameRoom.status);

	async function fetchPlayers() {
		const { data, error } = await supabase.from('players').select('*').eq('game_room_id', roomId);

		if (!error) {
			players = data;
			return;
		}
		//Remove later
		console.log('Error fetcing players: ', error);
	}

	onMount(async () => {
		await fetchPlayers();

		const playerSubscription = supabase
			.channel(`players-${roomId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'players',
					filter: `game_room_id=eq.${roomId}`
				},
				(payload) => {
					console.log('New player joined:', payload.new);
					players = [...players, payload.new]; // Update players array
				}
			)
			.subscribe();

		// Subscribe to real-time updates for game status
		const gameStatusSubscription = supabase
			.channel(`game_rooms-${roomId}`)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
				(payload) => {
					console.log('Game status updated:', payload.new.status);
					gameStatus = payload.new.status;
					if (payload.new.status === 'in_progress') {
						console.log(page.url.pathname);
						goto(`${page.url.pathname}/1`);
					}
				}
			)
			.subscribe();
	});

	const form = superForm(data.startGameForm, {
		validators: zodClient(startGameSchema)
	});

	const { enhance } = form;
</script>

<div class="mb-12 grid gap-y-2">
	<h1 class="text-3xl">{gameRoom.name}</h1>
	<p><span class="font-semibold">Game status: </span> {gameStatus}</p>
</div>

<div class="max-w-sm rounded-md border p-4">
	<h2 class="mb-4 text-xl">Players</h2>
	<div class="flex flex-col gap-2">
		{#each players as p}
			<div class="">
				<p>
					{p.nickname}
					{#if p.user_id === data.user?.id}
						(me)
					{/if}
				</p>
			</div>
		{/each}
	</div>
</div>

{#if player.is_host}
	<form action="?/startGame" method="post" class="mt-8" use:enhance>
		<input type="hidden" name="game_room_id" value={gameRoom.id} />
		<input type="hidden" name="quiz_id" value={gameRoom.quiz_id} />
		<Button type="submit">Start game</Button>
	</form>
{/if}
