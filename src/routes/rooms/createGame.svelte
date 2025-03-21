<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { createRoomSchema, type CreateRoomSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Tables } from '$lib/supabase-types';

	let {
		data
	}: {
		data: { createRoomForm: SuperValidated<Infer<CreateRoomSchema>>; quizzes: Tables<'quizzes'>[] };
	} = $props();

	const form = superForm(data.createRoomForm, {
		validators: zodClient(createRoomSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/createRoom" use:enhance class="max-w-xs rounded-md border p-8">
	<h2 class="mb-8 text-xl">Create a new game room</h2>
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>
		<Form.Description>This is the name of the game room.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="quiz_id">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Quiz</Form.Label>
				<Select.Root type="single" bind:value={$formData.quiz_id} name={props.name}>
					<Select.Trigger {...props}>
						{data.quizzes.find((quiz) => quiz.id === $formData.quiz_id)?.title ?? 'Select a quiz'}
					</Select.Trigger>
					<Select.Content>
						{#each data.quizzes ?? [] as quiz}
							<Select.Item value={quiz?.id} label={quiz.title} />
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>This is the quiz you want to play.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Password</Form.Label>
				<Input {...props} bind:value={$formData.password} />
			{/snippet}
		</Form.Control>
		<Form.Description>This is the password for the game room.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Create room</Form.Button>
</form>
