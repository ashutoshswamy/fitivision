import { NextRequest, NextResponse } from "next/server";
import {
  createWorkoutSession,
  endWorkoutSession,
  logExercise,
  logMultipleExercises,
  getUserSessions,
  getUserStats,
} from "@/app/lib/supabase/workouts";
import { auth } from "@clerk/nextjs/server";

// POST /api/workouts — Create session, log exercises, or complete session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_session": {
        const session = await createWorkoutSession({
          user_id: userId,
          started_at: body.started_at || new Date().toISOString(),
          ended_at: null,
          duration_sec: null,
          notes: body.notes || null,
          source: body.source || "manual",
          ai_plan_id: body.ai_plan_id || null,
        });
        return NextResponse.json({ session });
      }

      case "end_session": {
        if (!body.session_id || !body.duration_sec) {
          return NextResponse.json(
            { error: "session_id and duration_sec required" },
            { status: 400 },
          );
        }
        const session = await endWorkoutSession(
          body.session_id,
          body.duration_sec,
        );
        return NextResponse.json({ session });
      }

      case "log_exercise": {
        if (!body.session_id || !body.exercise_type) {
          return NextResponse.json(
            { error: "session_id and exercise_type required" },
            { status: 400 },
          );
        }
        const exercise = await logExercise({
          session_id: body.session_id,
          user_id: userId,
          exercise_type: body.exercise_type,
          sets_completed: body.sets_completed ?? 1,
          reps_completed: body.reps_completed ?? 0,
          target_reps: body.target_reps ?? null,
          precision_avg: body.precision_avg ?? null,
          duration_sec: body.duration_sec ?? null,
          notes: body.notes ?? null,
        });
        return NextResponse.json({ exercise });
      }

      case "log_multiple_exercises": {
        if (!body.session_id || !Array.isArray(body.exercises)) {
          return NextResponse.json(
            { error: "session_id and exercises array required" },
            { status: 400 },
          );
        }
        const exercises = await logMultipleExercises(
          body.exercises.map(
            (ex: {
              exercise_type: string;
              sets_completed?: number;
              reps_completed?: number;
              target_reps?: number;
              precision_avg?: number;
              duration_sec?: number;
              notes?: string;
            }) => ({
              session_id: body.session_id,
              user_id: userId,
              exercise_type: ex.exercise_type,
              sets_completed: ex.sets_completed ?? 1,
              reps_completed: ex.reps_completed ?? 0,
              target_reps: ex.target_reps ?? null,
              precision_avg: ex.precision_avg ?? null,
              duration_sec: ex.duration_sec ?? null,
              notes: ex.notes ?? null,
            }),
          ),
        );
        return NextResponse.json({ exercises });
      }

      // Quick save: create session + log exercise in one call
      case "quick_save": {
        if (!body.exercise_type) {
          return NextResponse.json(
            { error: "exercise_type required" },
            { status: 400 },
          );
        }
        const session = await createWorkoutSession({
          user_id: userId,
          started_at: body.started_at || new Date().toISOString(),
          ended_at: new Date().toISOString(),
          duration_sec: body.duration_sec ?? null,
          notes: body.notes || null,
          source: body.source || "manual",
          ai_plan_id: body.ai_plan_id || null,
        });
        const exercise = await logExercise({
          session_id: session.id,
          user_id: userId,
          exercise_type: body.exercise_type,
          sets_completed: body.sets_completed ?? 1,
          reps_completed: body.reps_completed ?? 0,
          target_reps: body.target_reps ?? null,
          precision_avg: body.precision_avg ?? null,
          duration_sec: body.duration_sec ?? null,
          notes: body.notes ?? null,
        });
        return NextResponse.json({ session, exercise });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Workout API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

// GET /api/workouts — Get user sessions and stats
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "sessions";
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (type === "stats") {
      const stats = await getUserStats(userId);
      return NextResponse.json({ stats });
    }

    const sessions = await getUserSessions(userId, limit, offset);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Workout API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
