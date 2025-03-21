<script lang="ts">
	import { Button } from './ui/button';
	import { Input } from './ui/input';
	import { Plus, Trash2 } from '@lucide/svelte';
	import { Label } from './ui/label';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import type { CreateQuizSchema } from '$lib/schemas';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	let { createQuizForm }: { createQuizForm: SuperValidated<Infer<CreateQuizSchema>> } = $props();

	const form = superForm(createQuizForm, {
		dataType: 'json'
	});

	const { form: formData, enhance } = form;

	type Answer = {
		answerText: string;
		isCorrect: boolean;
	};

	type QuestionAnswer = {
		questionText: string;
		answers: Answer[];
	};

	let questions: QuestionAnswer[] = $state([
		{
			questionText: '',
			answers: [
				{
					answerText: '',
					isCorrect: false
				}
			]
		}
	]);

	function addQuestion() {
		formData.update(
			($formData) => {
				$formData.questions.push({
					question_text: '',
					answers: [
						{
							answer_text: '',
							is_correct: false
						}
					]
				});
				return $formData;
			},
			{ taint: false }
		);
	}

	function deleteQuestion(questionIndex: number) {
		formData.update(
			($formData) => {
				$formData.questions.splice(questionIndex, 1);
				return $formData;
			},
			{ taint: false }
		);
	}

	function addAnswerOption(questionIndex: number) {
		if ($formData.questions[questionIndex].answers.length >= 4) {
			alert('Maximum of 4 answer options');
			return;
		}

		formData.update(
			($formData) => {
				$formData.questions[questionIndex].answers.push({
					answer_text: '',
					is_correct: false
				});
				return $formData;
			},
			{ taint: false }
		);
	}

	function deleteAnswerOption(questionIndex: number, answerIndex: number) {
		formData.update(
			($formData) => {
				$formData.questions[questionIndex].answers.splice(answerIndex, 1);
				return $formData;
			},
			{ taint: false }
		);
	}
</script>

<!-- <SuperDebug data={$formData} /> -->
<section class="mt-8 max-w-lg rounded-lg border border-border bg-card p-8">
	<h3 class="mb-6 text-lg">Create quiz</h3>
	<div>
		<form action="?/createQuiz" method="post" class="grid gap-y-8" use:enhance>
			<div class="grid gap-y-2">
				<Label>Quiz name</Label>
				<Input type="text" name="title" bind:value={$formData.title}></Input>
			</div>
			{#each $formData.questions as _, i}
				<div class="grid gap-y-2">
					<Label>Question {i + 1}</Label>
					<div class="flex gap-2">
						<Input type="text" name="questions" bind:value={$formData.questions[i].question_text} />
						<Button
							onclick={() => deleteQuestion(i)}
							variant="ghost"
							class="h-auto p-1 text-destructive hover:text-destructive"
						>
							<Trash2 />
						</Button>
					</div>
				</div>
				<div class="grid gap-y-3 pl-4">
					<div class="flex items-center justify-between">
						<Label>Answer options</Label>
						<div class="flex gap-2">
							<Label for="is-correct">Correct</Label>
							<div class="w-6"></div>
						</div>
					</div>
					{#each $formData.questions[i].answers as _, j}
						<div class="grid gap-y-2">
							<Label>Option {j + 1}</Label>
							<div class="flex items-center justify-between gap-8">
								<Input
									type="text"
									name="answers"
									bind:value={$formData.questions[i].answers[j].answer_text}
									class="w-full"
								/>
								<div class="flex items-center gap-2">
									<Switch
										id="is-correct"
										bind:checked={$formData.questions[i].answers[j].is_correct}
									/>
									<input
										type="hidden"
										name="is_correct"
										bind:value={$formData.questions[i].answers[j].is_correct}
									/>
									<Button
										onclick={() => deleteAnswerOption(i, j)}
										variant="ghost"
										class="h-auto p-1 text-destructive hover:text-destructive"
									>
										<Trash2 />
									</Button>
								</div>
							</div>
						</div>
					{/each}
					{#if $formData.questions[i].answers.length >= 4}
						<div class=""></div>
					{:else}
						<Button
							class="h-full max-h-10 rounded-md border border-dashed border-border hover:bg-stone-900"
							variant="ghost"
							onclick={() => addAnswerOption(i)}
						>
							<Plus />
							Add answer option
						</Button>
					{/if}
				</div>
			{/each}

			<Button
				class="h-full max-h-10 rounded-md border border-dashed border-border hover:bg-stone-900"
				variant="ghost"
				onclick={addQuestion}
			>
				<Plus />
				Add questions
			</Button>
			<Button type="submit">Create quiz</Button>
		</form>
	</div>
</section>
