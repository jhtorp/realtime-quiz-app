import { fail, setError, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { createRoomSchema, joinGameRoomSchema } from '$lib/schemas';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	async function getGameRooms() {
		const { data: gameRoomsData, error: gameRoomsError } = await event.locals.supabase
			.from('game_rooms')
			.select('*, players(*)');

		if (gameRoomsError) {
			console.log(gameRoomsError);
			return;
		}

		return gameRoomsData;
	}

	async function getQuizzes() {
		const { data: quizData, error: quizError } = await event.locals.supabase
			.from('quizzes')
			.select('*');

		if (quizError) {
			console.log('Error getting quizzes: ', quizError);
			return null;
		}

		return quizData;
	}

	return {
		createRoomForm: await superValidate(zod(createRoomSchema)),
		joinRoomForm: await superValidate(zod(joinGameRoomSchema)),
		gameRooms: await getGameRooms(),
		quizzes: await getQuizzes()
	};
};

export const actions: Actions = {
	createRoom: async (event) => {
		const { session, user } = await event.locals.safeGetSession();

		if (!session || !user) {
			redirect(302, '/login');
		}

		const form = await superValidate(event, zod(createRoomSchema));

		console.log('create room form: ', form);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { data: roomData, error: roomError } = await event.locals.supabase
			.from('game_rooms')
			.insert({
				name: form.data.name,
				password: form.data.password,
				quiz_id: form.data.quiz_id,
				host_id: user.id
			})
			.select('*')
			.single();

		if (roomError) {
			console.log('Error creating room: ', roomError);
			return;
		}

		console.log(roomData);

		return {
			form
		};
	},
	joinRoom: async (event) => {
		const { session, user } = await event.locals.safeGetSession();

		if (!session || !user) {
			redirect(302, '/login');
		}

		const form = await superValidate(event, zod(joinGameRoomSchema));

		console.log('Form: ', form);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { data: gameRoomData, error: gameRoomError } = await event.locals.supabase
			.from('game_rooms')
			.select('id, password, host_id')
			.eq('id', form.data.game_room_id)
			.single();

		if (gameRoomError) {
			console.log('Error getting game room password: ', gameRoomError);

			return fail(400, {
				form
			});
		}

		if (gameRoomData.password !== form.data.password) {
			console.log('Password do not match');

			return setError(form, 'password', 'Wrong password.');
		}

		const isHost = gameRoomData.host_id === user.id;

		const { error: playerError } = await event.locals.supabase.from('players').insert({
			nickname: form.data.nickname,
			user_id: user.id,
			game_room_id: gameRoomData.id,
			is_host: isHost
		});

		if (playerError) {
			console.log('Error creating player: ', playerError);
			return setError(form, 'password', 'Something went wrong joining the rooms.');
		}

		redirect(302, `/rooms/${form.data.game_room_id}`);
	}
};
