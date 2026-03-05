// =============================================================
// FitVision — Database TypeScript Types
// =============================================================

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_level: "Beginner" | "Intermediate" | "Advanced" | null;
  goals: string[] | null;
  conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  notes: string | null;
  source: "manual" | "ai_plan";
  ai_plan_id: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  session_id: string;
  user_id: string;
  exercise_type: string;
  sets_completed: number;
  reps_completed: number;
  target_reps: number | null;
  precision_avg: number | null;
  duration_sec: number | null;
  notes: string | null;
  created_at: string;
}

export interface AIPlan {
  id: string;
  user_id: string;
  name: string;
  form_data: Record<string, unknown>;
  plan_data: Record<string, unknown>;
  summary: string | null;
  is_active: boolean;
  created_at: string;
}

// Insert types (omit auto-generated fields)
export type ProfileInsert = Omit<Profile, "id" | "created_at" | "updated_at">;
export type WorkoutSessionInsert = Omit<WorkoutSession, "id" | "created_at">;
export type WorkoutExerciseInsert = Omit<WorkoutExercise, "id" | "created_at">;
export type AIPlanInsert = Omit<AIPlan, "id" | "created_at">;

// Session with exercises (for history display)
export interface WorkoutSessionWithExercises extends WorkoutSession {
  workout_exercises: WorkoutExercise[];
}
