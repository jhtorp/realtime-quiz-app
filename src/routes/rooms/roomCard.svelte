<script lang="ts">
	import JoinRoomModal from './joinRoomModal.svelte';

	let { roomData, joinRoomForm } = $props();
</script>

<div class="flex items-center justify-between rounded-sm p-2">
	<h3>{roomData.name}</h3>
	<JoinRoomModal {joinRoomForm} {roomData} />
</div>
