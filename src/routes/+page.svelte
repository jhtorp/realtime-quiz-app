<script lang="ts">
	import CreateQuiz from '$lib/components/createQuiz.svelte';

	let { data } = $props();

	let { createQuizForm } = data;
</script>

<h1>Realtime game</h1>
<CreateQuiz {createQuizForm} />
