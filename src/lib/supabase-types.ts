export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					operationName?: string;
					query?: string;
					variables?: Json;
					extensions?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			answers: {
				Row: {
					answer_text: string | null;
					id: string;
					is_correct: boolean | null;
					question_id: string | null;
				};
				Insert: {
					answer_text?: string | null;
					id?: string;
					is_correct?: boolean | null;
					question_id?: string | null;
				};
				Update: {
					answer_text?: string | null;
					id?: string;
					is_correct?: boolean | null;
					question_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'answers_question_id_fkey';
						columns: ['question_id'];
						isOneToOne: false;
						referencedRelation: 'questions';
						referencedColumns: ['id'];
					}
				];
			};
			game_progress: {
				Row: {
					created_at: string;
					current_question_id: string;
					game_room_id: number | null;
					game_status: Database['public']['Enums']['game_status'] | null;
					id: string;
					question_start_time: string | null;
				};
				Insert: {
					created_at?: string;
					current_question_id: string;
					game_room_id?: number | null;
					game_status?: Database['public']['Enums']['game_status'] | null;
					id?: string;
					question_start_time?: string | null;
				};
				Update: {
					created_at?: string;
					current_question_id?: string;
					game_room_id?: number | null;
					game_status?: Database['public']['Enums']['game_status'] | null;
					id?: string;
					question_start_time?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'game_progress_current_question_id_fkey';
						columns: ['current_question_id'];
						isOneToOne: false;
						referencedRelation: 'questions';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'game_progress_game_room_id_fkey';
						columns: ['game_room_id'];
						isOneToOne: false;
						referencedRelation: 'game_rooms';
						referencedColumns: ['id'];
					}
				];
			};
			game_rooms: {
				Row: {
					created_at: string;
					host_id: string | null;
					id: number;
					name: string | null;
					password: string | null;
					quiz_id: string | null;
					status: Database['public']['Enums']['game_status'];
				};
				Insert: {
					created_at?: string;
					host_id?: string | null;
					id?: number;
					name?: string | null;
					password?: string | null;
					quiz_id?: string | null;
					status?: Database['public']['Enums']['game_status'];
				};
				Update: {
					created_at?: string;
					host_id?: string | null;
					id?: number;
					name?: string | null;
					password?: string | null;
					quiz_id?: string | null;
					status?: Database['public']['Enums']['game_status'];
				};
				Relationships: [
					{
						foreignKeyName: 'game_rooms_quiz_id_fkey';
						columns: ['quiz_id'];
						isOneToOne: false;
						referencedRelation: 'quizzes';
						referencedColumns: ['id'];
					}
				];
			};
			players: {
				Row: {
					game_room_id: number | null;
					id: string;
					is_host: boolean;
					joined_at: string;
					nickname: string | null;
					score: number | null;
					user_id: string | null;
				};
				Insert: {
					game_room_id?: number | null;
					id?: string;
					is_host?: boolean;
					joined_at?: string;
					nickname?: string | null;
					score?: number | null;
					user_id?: string | null;
				};
				Update: {
					game_room_id?: number | null;
					id?: string;
					is_host?: boolean;
					joined_at?: string;
					nickname?: string | null;
					score?: number | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'players_game_room_id_fkey';
						columns: ['game_room_id'];
						isOneToOne: false;
						referencedRelation: 'game_rooms';
						referencedColumns: ['id'];
					}
				];
			};
			questions: {
				Row: {
					created_at: string;
					id: string;
					order: number;
					question_text: string | null;
					quiz_id: string | null;
				};
				Insert: {
					created_at?: string;
					id?: string;
					order: number;
					question_text?: string | null;
					quiz_id?: string | null;
				};
				Update: {
					created_at?: string;
					id?: string;
					order?: number;
					question_text?: string | null;
					quiz_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'questions_quiz_id_fkey';
						columns: ['quiz_id'];
						isOneToOne: false;
						referencedRelation: 'quizzes';
						referencedColumns: ['id'];
					}
				];
			};
			quizzes: {
				Row: {
					created_at: string;
					created_by: string | null;
					id: string;
					title: string;
				};
				Insert: {
					created_at?: string;
					created_by?: string | null;
					id?: string;
					title: string;
				};
				Update: {
					created_at?: string;
					created_by?: string | null;
					id?: string;
					title?: string;
				};
				Relationships: [];
			};
			responses: {
				Row: {
					answer_id: string | null;
					answered_at: string;
					game_room_id: number;
					id: string;
					player_id: string;
					question_id: string;
				};
				Insert: {
					answer_id?: string | null;
					answered_at?: string;
					game_room_id: number;
					id?: string;
					player_id: string;
					question_id: string;
				};
				Update: {
					answer_id?: string | null;
					answered_at?: string;
					game_room_id?: number;
					id?: string;
					player_id?: string;
					question_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'responses_answer_id_fkey';
						columns: ['answer_id'];
						isOneToOne: false;
						referencedRelation: 'answers';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'responses_game_room_id_fkey';
						columns: ['game_room_id'];
						isOneToOne: false;
						referencedRelation: 'game_rooms';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'responses_player_id_fkey';
						columns: ['player_id'];
						isOneToOne: false;
						referencedRelation: 'players';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'responses_question_id_fkey';
						columns: ['question_id'];
						isOneToOne: false;
						referencedRelation: 'questions';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			game_status: 'waiting' | 'in_progress' | 'complete';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
