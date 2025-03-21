<script lang="ts">
	import CreateGame from './createGame.svelte';
	import RoomCard from './roomCard.svelte';
	let { data } = $props();

	let { gameRooms } = data;
</script>

<div class="">
	<h1 class="mb-12 text-3xl">Game rooms</h1>
	<section class="flex gap-12">
		<CreateGame {data} />
		<div class="w-full max-w-lg rounded-md border p-8">
			<h2 class="mb-8 text-xl">Game rooms</h2>
			<div>
				{#if gameRooms === undefined}
					<p>No game rooms found.</p>
				{:else}
					{#each gameRooms as room}
						<RoomCard roomData={room} joinRoomForm={data.joinRoomForm} />
					{/each}
				{/if}
			</div>
		</div>
	</section>
</div>
