<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { joinGameRoomSchema, type JoinGameRoomSchema } from '$lib/schemas';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import type { Tables } from '$lib/supabase-types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	type GameRoomWithPlayers = Tables<'game_rooms'> & {
		players: Tables<'players'>[];
	};

	let {
		roomData,
		joinRoomForm
	}: { roomData: GameRoomWithPlayers; joinRoomForm: SuperValidated<Infer<JoinGameRoomSchema>> } =
		$props();

	const form = superForm(joinRoomForm, {
		validators: zodClient(joinGameRoomSchema),
		id: `room_${roomData.id}`
	});

	const { form: formData, enhance, submit } = form;

	function joinRoom() {
		goto(`/rooms/${roomData.id}`);
	}

	let existingPlayer: boolean = $state(false);

	$effect(() => {
		existingPlayer = roomData.players.find((p) => p.user_id === page.data.session?.user.id)
			? true
			: false;
	});

	$inspect(existingPlayer);

	let open: boolean = $state(false);
</script>

{#if existingPlayer}
	<Button onclick={joinRoom}>Join room again</Button>
{:else}
	<Button onclick={() => (open = true)}>Join room</Button>
{/if}
<Dialog.Root bind:open>
	<!-- <Dialog.Trigger>
		{#if !existingPlayer}{/if}
	</Dialog.Trigger> -->
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Join room</Dialog.Title>
			<Dialog.Description>Fill in the correct password to join the room</Dialog.Description>
		</Dialog.Header>
		<form action="?/joinRoom" method="POST" use:enhance>
			<Form.Field {form} name="nickname">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Nickname</Form.Label>
						<Input type="text" {...props} bind:value={$formData.nickname} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Password</Form.Label>
						<Input type="text" {...props} bind:value={$formData.password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<input type="hidden" name="game_room_id" value={roomData.id} />

			<Form.Button class="w-full">Join room</Form.Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
