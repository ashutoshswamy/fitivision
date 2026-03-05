// =============================================================
// FitVision — Supabase Workout Helper Functions
// =============================================================

import { createClient } from "./server";
import type {
  WorkoutSession,
  WorkoutExercise,
  WorkoutSessionInsert,
  WorkoutExerciseInsert,
  WorkoutSessionWithExercises,
  AIPlanInsert,
  AIPlan,
} from "./database.types";

const supabase = createClient();

// ─── WORKOUT SESSIONS ───────────────────────────────────────

export async function createWorkoutSession(
  session: WorkoutSessionInsert,
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert(session)
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data;
}

export async function endWorkoutSession(
  sessionId: string,
  durationSec: number,
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .update({
      ended_at: new Date().toISOString(),
      duration_sec: durationSec,
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to end session: ${error.message}`);
  return data;
}

export async function getUserSessions(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<WorkoutSessionWithExercises[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*, workout_exercises(*)")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
  return data ?? [];
}

export async function getSessionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("workout_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to count sessions: ${error.message}`);
  return count ?? 0;
}

// ─── WORKOUT EXERCISES ──────────────────────────────────────

export async function logExercise(
  exercise: WorkoutExerciseInsert,
): Promise<WorkoutExercise> {
  const { data, error } = await supabase
    .from("workout_exercises")
    .insert(exercise)
    .select()
    .single();

  if (error) throw new Error(`Failed to log exercise: ${error.message}`);
  return data;
}

export async function logMultipleExercises(
  exercises: WorkoutExerciseInsert[],
): Promise<WorkoutExercise[]> {
  const { data, error } = await supabase
    .from("workout_exercises")
    .insert(exercises)
    .select();

  if (error) throw new Error(`Failed to log exercises: ${error.message}`);
  return data ?? [];
}

// ─── STATS ──────────────────────────────────────────────────

export async function getUserStats(userId: string) {
  // Total sessions
  const { count: totalSessions } = await supabase
    .from("workout_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total exercises logged
  const { count: totalExercises } = await supabase
    .from("workout_exercises")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total reps
  const { data: repData } = await supabase
    .from("workout_exercises")
    .select("reps_completed")
    .eq("user_id", userId);

  const totalReps =
    repData?.reduce((sum, r) => sum + (r.reps_completed || 0), 0) ?? 0;

  // Average precision
  const { data: precisionData } = await supabase
    .from("workout_exercises")
    .select("precision_avg")
    .eq("user_id", userId)
    .not("precision_avg", "is", null);

  const avgPrecision =
    precisionData && precisionData.length > 0
      ? precisionData.reduce(
          (sum, r) => sum + Number(r.precision_avg || 0),
          0,
        ) / precisionData.length
      : 0;

  return {
    totalSessions: totalSessions ?? 0,
    totalExercises: totalExercises ?? 0,
    totalReps,
    avgPrecision: Math.round(avgPrecision * 10) / 10,
  };
}

// ─── AI PLANS ───────────────────────────────────────────────

export async function saveAIPlan(plan: AIPlanInsert): Promise<AIPlan> {
  const { data, error } = await supabase
    .from("ai_plans")
    .insert(plan)
    .select()
    .single();

  if (error) throw new Error(`Failed to save AI plan: ${error.message}`);
  return data;
}

export async function deleteAIPlan(
  planId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("ai_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete AI plan: ${error.message}`);
}

export async function toggleActivePlan(
  planId: string,
  userId: string,
): Promise<AIPlan> {
  // Deactivate all plans for this user first
  await supabase
    .from("ai_plans")
    .update({ is_active: false })
    .eq("user_id", userId);

  // Activate the selected plan
  const { data, error } = await supabase
    .from("ai_plans")
    .update({ is_active: true })
    .eq("id", planId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to activate plan: ${error.message}`);
  return data;
}

export async function getActivePlan(userId: string): Promise<AIPlan | null> {
  const { data, error } = await supabase
    .from("ai_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch active plan: ${error.message}`);
  }
  return data ?? null;
}

export async function getUserAIPlans(
  userId: string,
  limit = 10,
): Promise<AIPlan[]> {
  const { data, error } = await supabase
    .from("ai_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch AI plans: ${error.message}`);
  return data ?? [];
}
