import { fail, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { submitAnswerSchema } from '$lib/schemas';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { user, session } = await event.locals.safeGetSession();

	if (!session || !user) {
		redirect(302, '/login');
	}

	const roomId = Number(event.params.roomId);

	// const currentQuestionOrder = Number(event.params.pageId);

	// async function getQuestionsCount(gameRoomId: number) {
	// 	const { data: gameRoomData, error: gameRoomError } = await event.locals.supabase
	// 		.from('game_rooms')
	// 		.select('*, quizzes(*, questions(*))')
	// 		.eq('id', gameRoomId)
	// 		.single();

	// 	if (gameRoomError) console.log('Game room error: ', gameRoomError);

	// 	return gameRoomData?.quizzes?.questions.length;
	// }

	// const roomData = await getQuestionData(Number(event.params.roomId));

	// const currentQuestion = roomData?.quizzes?.questions.find(
	// 	(q) => q.order === currentQuestionOrder
	// );

	// const nextQuestionId = roomData?.quizzes?.questions.find(
	// 	(q) => q.order === currentQuestionOrder + 1
	// )?.id;

	// if (!roomData?.id) {
	// 	return error(500);
	// }

	// const { data: playerIdData, error: playerIdError } = await event.locals.supabase
	// 	.from('players')
	// 	.select('id, is_host')
	// 	.eq('user_id', user?.id)
	// 	.eq('game_room_id', roomData?.id)
	// 	.single();

	// if (playerIdError) {
	// 	console.log('Player ID error: ', playerIdError);
	// }

	// if (!playerIdData?.id) {
	// 	return error(500);
	// }

	// const { data: responseData, error: responseError } = await event.locals.supabase
	// 	.from('responses')
	// 	.select('*')
	// 	.eq('game_room_id', roomData?.id)
	// 	.eq('player_id', playerIdData?.id)
	// 	.eq('question_id', currentQuestion?.id)
	// 	.single();

	// if (responseError) {
	// 	console.log('Response error: ', responseError);
	// }

	// console.log('RESPONSE LOAD: ', responseData);

	// const hasResponded = responseData ? true : false;

	return {
		submitForm: await superValidate({ game_room_id: roomId }, zod(submitAnswerSchema))
		// questionsCount: getQuestionsCount(roomId)
	};
};

export const actions: Actions = {
	submitAnswer: async (event) => {
		const form = await superValidate(event, zod(submitAnswerSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { error: responseError } = await event.locals.supabase
			.from('responses')
			.insert(form.data);

		if (responseError) {
			console.log('Error creating response: ', responseError);
		}

		return {
			form
		};
	}
};
