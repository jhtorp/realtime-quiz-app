import { createQuizSchema } from '$lib/schemas';
import { fail, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {
		createQuizForm: await superValidate(
			{
				title: 'Your quiz name',
				questions: [
					{
						question_text: '',
						answers: [{ answer_text: '', is_correct: false }]
					}
				]
			},
			zod(createQuizSchema)
		)
	};
};

export const actions: Actions = {
	createQuiz: async (event) => {
		const { session, user } = await event.locals.safeGetSession();

		if (!session || !user) {
			redirect(302, '/login');
		}

		const form = await superValidate(event, zod(createQuizSchema));

		console.log('Quiz form: ', form.data.questions);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { data: quizData, error: quizError } = await event.locals.supabase
			.from('quizzes')
			.insert({ title: form.data.title, created_by: user.id })
			.select('id')
			.single();

		if (quizError) {
			console.log('Error creating quiz: ', quizError);
			return;
		}

		const quizId = quizData.id;

		const questions = form.data.questions.map((q, i) => ({
			quiz_id: quizId,
			question_text: q.question_text,
			order: i + 1
		}));

		console.log('formattedQuestions: ', questions);

		const { data: questionIds, error: questionsError } = await event.locals.supabase
			.from('questions')
			.insert(questions)
			.select('id, order, question_text')
			.order('order', { ascending: true });

		if (questionsError) {
			console.log('Error creating questions: ', questionsError);
			return;
		}

		console.log('q db: ', questionIds);

		const answers = questionIds.flatMap((q, i) =>
			form.data.questions[i].answers.map((a) => ({
				question_id: q.id,
				answer_text: a.answer_text,
				is_correct: a.is_correct
			}))
		);

		console.log('formatted answers: ', answers);

		const { error: answersError } = await event.locals.supabase.from('answers').insert(answers);

		if (answersError) {
			console.log('Error creating answers: ', answersError);
			return;
		}

		return {
			form
		};
	}
};
