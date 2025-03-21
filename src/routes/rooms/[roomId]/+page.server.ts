import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { startGameSchema } from '$lib/schemas';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();

	if (!session || !user) {
		redirect(302, '/login');
	}

	const gameRoomId = Number(event.params.roomId);

	async function getPlayer(userId: string) {
		const { data: playerData, error: playerError } = await event.locals.supabase
			.from('players')
			.select('*')
			.eq('user_id', userId)
			.eq('game_room_id', gameRoomId)
			.single();

		if (playerError) {
			console.log('Error getting player: ', playerError);
			error(401);
		}
		return playerData;
	}

	async function getGameRoom() {
		const { data: gameRoomData, error: gameRoomError } = await event.locals.supabase
			.from('game_rooms')
			.select('*, players(*)')
			.eq('id', Number(event.params.roomId))
			.single();

		if (gameRoomError) {
			console.log('Error getting game room: ', gameRoomError);
			error(404, {
				message: 'Error getting game room.'
			});
		}
		return gameRoomData;
	}

	return {
		player: await getPlayer(user.id),
		gameRoom: await getGameRoom(),
		startGameForm: await superValidate(zod(startGameSchema))
	};
};

export const actions: Actions = {
	startGame: async (event) => {
		const form = await superValidate(event, zod(startGameSchema));

		console.log('Form: ', form);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { data: quizData, error: quizError } = await event.locals.supabase
			.from('quizzes')
			.select('*, questions(*)')
			.eq('id', form.data.quiz_id)
			.single();

		if (quizError) {
			console.log(quizError);
		}

		// console.log('Quiz data: ', quizData);

		const { error: gameProgressError } = await event.locals.supabase.from('game_progress').insert({
			game_room_id: form?.data?.game_room_id,
			game_status: 'in_progress',
			current_question_id: quizData?.questions[0].id,
			question_start_time: new Date().toISOString()
		});

		if (gameProgressError) {
			console.log('Error creating game progress: ', gameProgressError);
		}

		const { error: updateGameRoomError } = await event.locals.supabase
			.from('game_rooms')
			.update({ status: 'in_progress' })
			.eq('id', form.data.game_room_id);

		if (updateGameRoomError) {
			console.log('Error updating game room status: ', updateGameRoomError);
		}

		return { form };
	}
};
