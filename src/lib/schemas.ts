import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	passwordConfirm: z.string()
});

export type RegisterSchema = typeof registerSchema;

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

export type LoginSchema = typeof loginSchema;

export const createRoomSchema = z.object({
	name: z.string(),
	quiz_id: z.string(),
	password: z.string()
});

export type CreateRoomSchema = typeof createRoomSchema;

export const joinGameRoomSchema = z.object({
	password: z.string().min(2, 'Password must be at least 2 characters.'),
	game_room_id: z.number(),
	nickname: z
		.string()
		.min(2, 'Nickname must be atleast 2 characters.')
		.max(32, 'Nickname must be 32 or less characters.')
});

export type JoinGameRoomSchema = typeof joinGameRoomSchema;

export const startGameSchema = z.object({
	game_room_id: z.number(),
	quiz_id: z.string()
});

export type StartGameSchema = typeof startGameSchema;

export const submitAnswerSchema = z.object({
	game_room_id: z.number(),
	question_id: z.string(),
	answer_id: z.string(),
	player_id: z.string()
});

export type SubmitAnswerSchema = typeof submitAnswerSchema;

export const createQuizSchema = z.object({
	title: z.string(),
	questions: z
		.object({
			question_text: z.string(),
			answers: z
				.object({
					answer_text: z.string(),
					is_correct: z.boolean()
				})
				.array()
		})
		.array()
});

export type CreateQuizSchema = typeof createQuizSchema;
