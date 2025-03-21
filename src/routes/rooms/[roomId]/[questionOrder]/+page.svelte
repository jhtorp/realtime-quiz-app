<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	import { onMount, tick } from 'svelte';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import type { Tables } from '$lib/supabase-types';

	let { data }: { data: PageData } = $props();

	let { supabase, submitForm } = data;

	const form = superForm(submitForm);

	const { form: formData, enhance, submit } = form;

	const questionTimeLimit = 10;

	let players: Tables<'players'>[] = $state([]);

	let player: Tables<'players'> = $derived.by(() =>
		players.find((p) => p.user_id === data?.user?.id)
	);

	let allQuestions: {
		created_at: string;
		id: string;
		order: number;
		question_text: string | null;
		quiz_id: string | null;
		answers: {
			id: string;
			answer_text: string | null;
		}[];
	}[] = $state([]);

	let currentQuestion = $derived.by(
		() => allQuestions.find((q) => q.order === currentQuestionOrder) ?? null
	);

	function startCountdown() {
		if (gameProgress && gameProgress.question_start_time) {
			const startTime = new Date(gameProgress.question_start_time + 'Z').getTime();

			// Clear any existing countdown before starting a new one
			clearInterval(interval);

			interval = setInterval(() => {
				const now = Date.now();
				const elapsedSeconds = Math.floor((now - startTime) / 1000);
				countdown = Math.max(questionTimeLimit - elapsedSeconds, 0);

				// When countdown reaches 0, clear the interval and trigger next question
				if (countdown === 0) {
					clearInterval(interval);
					console.log('Countdown 0 detected');
					console.log(allQuestions[currentQuestionOrder]);

					if (allQuestions[currentQuestionOrder] === undefined) {
						handleNextQuestion(null, player?.is_host);
					} else {
						handleNextQuestion(allQuestions[currentQuestionOrder].id, player?.is_host);
					}
				}
			}, 1000);
		}
	}

	let submitted = $state(false);
	let roomId = $state(Number(page.params.roomId));
	let currentQuestionOrder = $state(Number(page.params.questionOrder));
	$effect(() => {
		currentQuestionOrder = Number(page.params.questionOrder);
	});
	// Initially, gameProgress is null; later it will be set to the single record from the DB.
	let gameProgress: Tables<'game_progress'> | null = $state(null);
	// Set initial countdown value to 30 seconds.
	let countdown = $state(questionTimeLimit);
	let interval: ReturnType<typeof setInterval>;
	// Helper function to return Tailwind classes based on index.
	function getColorClass(index: number): string {
		switch (index) {
			case 0:
				return 'bg-red-500 hover:bg-red-600';
			case 1:
				return 'bg-blue-500 hover:bg-blue-600';
			case 2:
				return 'bg-green-500 hover:bg-green-600';
			case 3:
				return 'bg-pink-500 hover:bg-pink-600';
			default:
				return '';
		}
	}

	async function fetchGameProgress() {
		const { data, error } = await supabase
			.from('game_progress')
			.select('*')
			.eq('game_room_id', roomId)
			.single();

		if (!error) {
			console.log('New game progress: ');

			gameProgress = data;
			return;
		}
		//Remove later
		console.log('Error fetcing game progress: ', error);
	}

	async function getAllPlayers() {
		const { data, error } = await supabase.from('players').select('*').eq('game_room_id', roomId);

		if (!error) {
			players = data;
			return;
		}
		//Remove later
		console.log('Error fetcing game progress: ', error);
	}

	async function getQuizQuestions() {
		const { data: gameRoomData, error: gameRoomError } = await supabase
			.from('game_rooms')
			.select('quiz_id')
			.eq('id', roomId)
			.single();

		if (gameRoomError || !gameRoomData.quiz_id) {
			console.error('Error fetching game room data: ', gameRoomError);
			return;
		}

		console.log('gameRoomData: ', gameRoomData);

		const { data: questionsData, error: questionsError } = await supabase
			.from('questions')
			.select('*, answers(id, answer_text)')
			.eq('quiz_id', gameRoomData?.quiz_id)
			.order('order', { ascending: true });

		if (questionsError) {
			console.error('Error fetching questions data: ', questionsError);
			return;
		}

		console.log(questionsData);

		allQuestions = questionsData;
	}

	async function handleNextQuestion(nextQuestionId: string | null, isHost: boolean) {
		console.log('is host? ', isHost);
		console.log('next q id: ', nextQuestionId);

		if (isHost) {
			if (gameProgress?.id) {
				if (!nextQuestionId) {
					console.log('No next question id found. Finishing game');

					const { error: updateProgressError } = await supabase
						.from('game_progress')
						.update({
							game_status: 'complete'
						})
						.eq('id', gameProgress?.id);

					if (updateProgressError) {
						console.error(updateProgressError);
					}
					return;
				}

				const { error: updateProgressError } = await supabase
					.from('game_progress')
					.update({
						current_question_id: nextQuestionId,
						question_start_time: new Date().toISOString()
					})
					.eq('id', gameProgress?.id);

				if (updateProgressError) {
					console.error(updateProgressError);
				}
			}
		}
	}

	onMount(async () => {
		await fetchGameProgress();
		await getQuizQuestions();
		await getAllPlayers();

		console.log('players', players);
		console.log('player', player);

		const subscription = supabase
			.channel('game_progress')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'game_progress',
					filter: `game_room_id=eq.${roomId}`
				},
				async (payload) => {
					console.log('Game progress updated:', payload);

					if (payload.new.game_status === 'complete') {
						await goto(`/rooms/${roomId}/results`);
						return;
					}

					if (payload.new.current_question_id !== payload.old.current_question_id) {
						console.log('Cur q pre: ', currentQuestionOrder);

						await goto(`/rooms/${roomId}/${currentQuestionOrder + 1}`);
						console.log('Cur q after: ', currentQuestionOrder);

						await fetchGameProgress();
						submitted = false;
						console.log('Cur q after 2: ', currentQuestionOrder);

						// ✅ Restart countdown when game progress updates
						startCountdown();
					}
				}
			)
			.subscribe();

		startCountdown();
	});

	async function submitAnswer(answerId: string) {
		$formData.answer_id = answerId;
		$formData.player_id = player.id;
		if (currentQuestion?.id) {
			$formData.question_id = currentQuestion?.id;
		}
		await tick();
		submitted = true;
		submit();
	}

	$effect(() => console.log('questions', allQuestions));
</script>

<section class="w-full px-12">
	<h2 class="mb-12 text-xl">Question number {page.params.questionOrder}</h2>
	<div>
		<p>{countdown}</p>
		<h3 class="mb-4 text-lg font-semibold">{currentQuestion?.question_text}</h3>

		{#if !submitted}
			<div class="flex gap-8">
				{#each currentQuestion?.answers ?? [] as answer, i}
					<div class="w-full">
						<form action="?/submitAnswer" method="POST" use:enhance>
							<Button
								onclick={() => submitAnswer(answer.id)}
								class={`answerButton w-full ${getColorClass(i)}`}
							>
								<span>{answer.answer_text}</span>
								<input type="hidden" name="answer_id" bind:value={$formData.answer_id} />
								<input type="hidden" name="question_id" value={$formData.question_id} />
								<input type="hidden" name="game_room_id" value={$formData.game_room_id} />
								<input type="hidden" name="player_id" value={$formData.player_id} />
							</Button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<span class="text-">Submitted</span>
		{/if}
	</div>
</section>
