"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Save,
  Check,
  Loader2,
  Dumbbell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  Plus,
  Minus,
  Star,
  Camera,
  CheckCircle2,
  History,
  SkipForward,
} from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { ExerciseType, EXERCISES } from "../lib/exercises";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  duration?: string;
  notes: string;
}

interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
  restPeriod: string;
}

interface PlanData {
  summary: string;
  weeklyPlan: DayPlan[];
  tips: string[];
  cautions: string[];
  availableInApp: string[];
}

interface SavedPlan {
  id: string;
  name: string;
  summary: string | null;
  is_active: boolean;
  created_at: string;
  plan_data: PlanData;
}

interface ExerciseLog {
  name: string;
  setsCompleted: number;
  repsCompleted: number;
  precisionAvg: number;
  durationSec: number;
  isTracked: boolean; // whether it was camera-tracked
  completed: boolean;
}

// Match an AI plan exercise name to an in-app ExerciseType
function matchExerciseType(name: string): ExerciseType | null {
  const lower = name.toLowerCase();
  for (const ex of EXERCISES) {
    if (lower.includes(ex.type.toLowerCase())) return ex.type;
  }
  // Additional fuzzy matches
  if (lower.includes("squat jump") || lower.includes("jump squat"))
    return "Squat Jumps";
  if (lower.includes("sumo squat") || lower.includes("wide squat"))
    return "Sumo Squats";
  if (lower.includes("bulgarian") || lower.includes("split squat"))
    return "Bulgarian Split Squats";
  if (lower.includes("box jump")) return "Box Jumps";
  if (lower.includes("squat")) return "Squats";
  if (lower.includes("wide push") || lower.includes("wide-push"))
    return "Wide Pushups";
  if (
    lower.includes("diamond push") ||
    lower.includes("close grip push") ||
    lower.includes("close-grip push")
  )
    return "Diamond Pushups";
  if (lower.includes("pike push")) return "Pike Pushups";
  if (lower.includes("wall push")) return "Wall Pushups";
  if (
    lower.includes("push-up") ||
    lower.includes("pushup") ||
    lower.includes("push up")
  )
    return "Pushups";
  if (lower.includes("hammer curl")) return "Hammer Curls";
  if (lower.includes("bicep") || lower.includes("curl")) return "Bicep Curls";
  if (lower.includes("arnold press")) return "Arnold Press";
  if (
    lower.includes("shoulder press") ||
    lower.includes("overhead press") ||
    lower.includes("military press")
  )
    return "Shoulder Press";
  if (lower.includes("side lunge") || lower.includes("lateral lunge"))
    return "Side Lunges";
  if (lower.includes("lunge")) return "Lunges";
  if (lower.includes("jumping jack") || lower.includes("star jump"))
    return "Jumping Jacks";
  if (lower.includes("deadlift") || lower.includes("dead lift"))
    return "Deadlifts";
  if (lower.includes("lateral raise") || lower.includes("side raise"))
    return "Lateral Raises";
  if (lower.includes("front raise")) return "Front Raises";
  if (
    lower.includes("high knee") ||
    lower.includes("high-knee") ||
    lower.includes("knee drive")
  )
    return "High Knees";
  if (
    lower.includes("tricep extension") ||
    lower.includes("overhead extension") ||
    lower.includes("skull crusher")
  )
    return "Overhead Tricep Extension";
  if (
    lower.includes("tricep kickback") ||
    lower.includes("kick back") ||
    lower.includes("kickback")
  )
    return "Tricep Kickbacks";
  if (
    lower.includes("tricep dip") ||
    lower.includes("bench dip") ||
    lower.includes("chair dip")
  )
    return "Tricep Dips";
  if (lower.includes("glute bridge") || lower.includes("hip bridge"))
    return "Glute Bridges";
  if (lower.includes("hip thrust")) return "Hip Thrusts";
  if (lower.includes("bicycle crunch") || lower.includes("bicycle"))
    return "Bicycle Crunches";
  if (lower.includes("crunch")) return "Crunches";
  if (
    lower.includes("sit-up") ||
    lower.includes("situp") ||
    lower.includes("sit up")
  )
    return "Sit Ups";
  if (lower.includes("upright row")) return "Upright Rows";
  if (
    lower.includes("bent over row") ||
    lower.includes("bent-over row") ||
    lower.includes("row")
  )
    return "Bent Over Rows";
  if (lower.includes("reverse fly") || lower.includes("rear delt fly"))
    return "Reverse Flys";
  if (lower.includes("chest fly") || lower.includes("pec fly"))
    return "Chest Flys";
  if (lower.includes("step up") || lower.includes("step-up")) return "Step Ups";
  if (lower.includes("calf raise") || lower.includes("calf"))
    return "Calf Raises";
  if (lower.includes("donkey kick")) return "Donkey Kicks";
  if (lower.includes("fire hydrant")) return "Fire Hydrants";
  if (lower.includes("good morning")) return "Good Mornings";
  if (lower.includes("wall sit") || lower.includes("wall squat"))
    return "Wall Sit";
  if (lower.includes("leg raise") || lower.includes("lying leg"))
    return "Leg Raises";
  if (lower.includes("mountain climber")) return "Mountain Climbers";
  if (lower.includes("flutter kick") || lower.includes("flutter"))
    return "Flutter Kicks";
  if (lower.includes("v-up") || lower.includes("v up") || lower.includes("vup"))
    return "V-Ups";
  if (lower.includes("dead bug")) return "Dead Bugs";
  if (lower.includes("side plank dip") || lower.includes("side plank"))
    return "Side Plank Dips";
  if (lower.includes("russian twist") || lower.includes("twist"))
    return "Russian Twists";
  if (lower.includes("burpee")) return "Burpees";
  if (lower.includes("butt kick") || lower.includes("butt-kick"))
    return "Butt Kicks";
  if (lower.includes("arm circle")) return "Arm Circles";
  if (lower.includes("toe touch") || lower.includes("toe-touch"))
    return "Toe Touches";
  if (
    lower.includes("superman") ||
    lower.includes("back extension") ||
    lower.includes("prone extension")
  )
    return "Superman";
  if (lower.includes("bridge")) return "Glute Bridges";
  return null;
}

// Try to match the current day of the week to a plan day
function findTodayPlan(weeklyPlan: DayPlan[]): number {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = dayNames[new Date().getDay()];

  // Try matching by day name
  const index = weeklyPlan.findIndex(
    (d) =>
      d.day.toLowerCase().includes(today) ||
      today.includes(d.day.toLowerCase()),
  );
  if (index !== -1) return index;

  // Try matching by day number (e.g., "Day 1" → index 0 mapped to current weekday)
  // Default to first non-rest day or just 0
  const nonRest = weeklyPlan.findIndex(
    (d) => !d.focus.toLowerCase().includes("rest"),
  );
  return nonRest !== -1 ? nonRest : 0;
}

export default function PlanWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-parchment flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlanWorkoutContent />
    </Suspense>
  );
}

function PlanWorkoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const planIdParam = searchParams.get("plan_id");
  const dayParam = searchParams.get("day"); // day index override

  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Workout state
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(
    null,
  );

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sessionStartRef = useRef<string>("");

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch plan
  useEffect(() => {
    if (!isSignedIn) return;
    const fetchPlan = async () => {
      setLoadingPlan(true);
      try {
        const url = planIdParam
          ? `/api/plans?type=all`
          : `/api/plans?type=active`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (planIdParam) {
            const found = (data.plans ?? []).find(
              (p: SavedPlan) => p.id === planIdParam,
            );
            setPlan(found || null);
          } else {
            setPlan(data.plan || null);
          }
        }
      } catch {
        // fail silently
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlan();
  }, [isSignedIn, planIdParam]);

  // Set today's day once plan loads
  useEffect(() => {
    if (!plan) return;
    if (dayParam) {
      setSelectedDayIndex(parseInt(dayParam) || 0);
    } else {
      setSelectedDayIndex(findTodayPlan(plan.plan_data.weeklyPlan));
    }
  }, [plan, dayParam]);

  const todayPlan = plan?.plan_data.weeklyPlan[selectedDayIndex];

  // Initialize exercise logs when workout starts
  const startWorkout = () => {
    if (!todayPlan) return;
    sessionStartRef.current = new Date().toISOString();
    const logs: ExerciseLog[] = todayPlan.exercises.map((ex) => ({
      name: ex.name,
      setsCompleted: 0,
      repsCompleted: 0,
      precisionAvg: 0,
      durationSec: 0,
      isTracked: false,
      completed: false,
    }));
    setExerciseLogs(logs);
    setWorkoutStarted(true);
    setActiveExerciseIdx(0);
    setSaved(false);
  };

  // Update a log field manually
  const updateLog = (
    idx: number,
    field: keyof ExerciseLog,
    value: number | boolean,
  ) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const markComplete = (idx: number) => {
    updateLog(idx, "completed", true);
    // Auto-advance to next incomplete exercise
    const next = exerciseLogs.findIndex((l, i) => i > idx && !l.completed);
    if (next !== -1) {
      setActiveExerciseIdx(next);
    } else {
      setActiveExerciseIdx(null);
    }
  };

  const completedCount = exerciseLogs.filter((l) => l.completed).length;
  const totalExercises = exerciseLogs.length;

  // Save workout session
  const handleSaveWorkout = async () => {
    if (!plan || saving || exerciseLogs.length === 0) return;
    setSaving(true);
    try {
      const now = new Date();
      const startTime = new Date(sessionStartRef.current);
      const durationSec = Math.round(
        (now.getTime() - startTime.getTime()) / 1000,
      );

      // Create session
      const sessionRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_session",
          started_at: sessionStartRef.current,
          source: "ai_plan",
          ai_plan_id: plan.id,
          notes: `${plan.name} — ${todayPlan?.day}: ${todayPlan?.focus}`,
        }),
      });

      if (!sessionRes.ok) throw new Error("Failed to create session");
      const { session } = await sessionRes.json();

      // Log all completed exercises
      const completedExercises = exerciseLogs
        .filter(
          (l) => l.completed || l.repsCompleted > 0 || l.setsCompleted > 0,
        )
        .map((l) => ({
          exercise_type: l.name,
          sets_completed: l.setsCompleted || 1,
          reps_completed: l.repsCompleted,
          precision_avg: l.precisionAvg || null,
          duration_sec: l.durationSec || null,
          notes: l.isTracked ? "Camera-tracked" : "Manual",
        }));

      if (completedExercises.length > 0) {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "log_multiple_exercises",
            session_id: session.id,
            exercises: completedExercises,
          }),
        });
      }

      // End session
      await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "end_session",
          session_id: session.id,
          duration_sec: durationSec,
        }),
      });

      setSaved(true);
    } catch (err) {
      console.error("Failed to save workout:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment text-charcoal font-sans selection:bg-terracotta selection:text-parchment">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-6 backdrop-blur-md bg-parchment/80 border-b border-warm-sand/50"
      >
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-nobg.png"
              alt="FitVision"
              width={120}
              height={32}
              className="h-7 sm:h-8 w-auto"
            />
            <span className="font-serif text-lg sm:text-xl font-light tracking-wide">
              FitVision
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 lg:gap-10 text-xs tracking-[0.2em] uppercase font-medium">
            <Link
              href="/dashboard"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Dashboard
            </Link>
            <Link
              href="/#philosophy"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Philosophy
            </Link>
            <Link
              href="/#process"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Method
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-6 pb-4 text-xs tracking-[0.2em] uppercase font-medium">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="/#philosophy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Philosophy
                </Link>
                <Link
                  href="/#process"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Method
                </Link>
                <div className="pt-2 border-t border-warm-sand/30">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Loading / No Plan states */}
      {loadingPlan ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sage animate-spin" />
        </div>
      ) : !plan ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-16 h-16 rounded-2xl bg-warm-sand/20 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-driftwood" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-light tracking-tight text-charcoal mb-2">
              No Active Plan
            </h2>
            <p className="text-driftwood text-sm font-light max-w-md">
              You need an active AI plan to start a plan workout. Generate a
              plan and set it as active first.
            </p>
          </div>
          <Link
            href="/suggestions"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-parchment rounded-full text-xs tracking-[0.15em] uppercase font-semibold hover:bg-charcoal transition-colors duration-300"
          >
            Get AI Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <section className="pt-28 sm:pt-36 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="max-w-[75rem] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-driftwood hover:text-charcoal transition-colors duration-300 font-medium mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-4 text-[10px] text-terracotta tracking-[0.3em] font-semibold uppercase mb-4">
                  <span className="w-8 h-px bg-terracotta" />
                  <Star className="w-3.5 h-3.5 fill-terracotta" />
                  <span>{plan.name}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-charcoal leading-[1] mb-3">
                  Plan{" "}
                  <span className="font-medium text-muted-clay italic">
                    Workout
                  </span>
                </h1>
              </motion.div>
            </div>
          </section>

          {/* Day Selector */}
          <section className="pb-4 px-4 sm:px-6">
            <div className="max-w-[75rem] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
              >
                {plan.plan_data.weeklyPlan.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!workoutStarted) setSelectedDayIndex(i);
                    }}
                    disabled={workoutStarted}
                    className={`flex-shrink-0 px-5 py-3 rounded-xl text-xs tracking-[0.12em] uppercase font-semibold border transition-all duration-300 ${
                      selectedDayIndex === i
                        ? "bg-charcoal text-parchment border-charcoal"
                        : workoutStarted
                          ? "bg-linen/40 text-warm-sand border-warm-sand/20 cursor-not-allowed"
                          : "bg-parchment text-driftwood border-warm-sand/40 hover:border-charcoal/30"
                    }`}
                  >
                    <span className="block text-[9px] opacity-60 mb-0.5">
                      {day.day}
                    </span>
                    {day.focus}
                  </button>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Workout Content */}
          <section className="pb-16 sm:pb-24 px-4 sm:px-6">
            <div className="max-w-[75rem] mx-auto">
              {todayPlan ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="space-y-6"
                >
                  {/* Day info card */}
                  <div className="bg-linen/60 rounded-2xl border border-warm-sand/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <Dumbbell className="w-5 h-5 text-muted-clay" />
                        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-charcoal">
                          {todayPlan.day} &mdash;{" "}
                          <span className="font-medium text-muted-clay italic">
                            {todayPlan.focus}
                          </span>
                        </h2>
                      </div>
                      <p className="text-driftwood text-xs tracking-[0.15em] uppercase font-light">
                        {todayPlan.exercises.length} exercises &middot; Rest:{" "}
                        {todayPlan.restPeriod}
                      </p>
                    </div>
                    {!workoutStarted ? (
                      <button
                        onClick={startWorkout}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta text-parchment rounded-full text-xs tracking-[0.15em] uppercase font-semibold hover:bg-charcoal transition-colors duration-300 shadow-lg flex-shrink-0"
                      >
                        <Play className="w-4 h-4" /> Start Workout
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-xs text-sage tracking-[0.12em] uppercase font-semibold">
                          {completedCount}/{totalExercises} done
                        </div>
                        <div className="w-24 h-2 bg-warm-sand/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-sage rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0}%`,
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exercise List */}
                  <div className="space-y-3">
                    {todayPlan.exercises.map((exercise, idx) => {
                      const log = exerciseLogs[idx];
                      const isActive =
                        activeExerciseIdx === idx && workoutStarted;
                      const isCompleted = log?.completed;
                      const matchedType = matchExerciseType(exercise.name);
                      const canTrack = !!matchedType;

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                          className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                            isCompleted
                              ? "bg-sage/5 border-sage/30"
                              : isActive
                                ? "bg-linen border-terracotta/40 shadow-md"
                                : "bg-linen/60 border-warm-sand/30"
                          }`}
                        >
                          {/* Exercise header */}
                          <div
                            className={`flex items-center justify-between p-5 sm:p-6 ${
                              workoutStarted && !isCompleted
                                ? "cursor-pointer hover:bg-warm-sand/10"
                                : ""
                            }`}
                            onClick={() => {
                              if (workoutStarted && !isCompleted) {
                                setActiveExerciseIdx(
                                  activeExerciseIdx === idx ? null : idx,
                                );
                              }
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-sage flex-shrink-0" />
                              ) : (
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                                    isActive
                                      ? "bg-terracotta text-parchment"
                                      : "bg-warm-sand/30 text-driftwood"
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              )}
                              <div className="min-w-0">
                                <p
                                  className={`font-medium tracking-wide ${
                                    isCompleted
                                      ? "text-sage line-through"
                                      : "text-charcoal"
                                  }`}
                                >
                                  {exercise.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-[10px] tracking-widest uppercase text-driftwood font-mono">
                                    {exercise.sets} sets
                                  </span>
                                  <span className="text-[10px] tracking-widest uppercase text-driftwood font-mono">
                                    {exercise.reps} reps
                                  </span>
                                  {exercise.duration && (
                                    <span className="text-[10px] tracking-widest uppercase text-driftwood font-mono">
                                      {exercise.duration}
                                    </span>
                                  )}
                                  {canTrack && (
                                    <span className="text-[10px] tracking-[0.1em] uppercase text-sage font-semibold flex items-center gap-1">
                                      <Camera className="w-3 h-3" /> Trackable
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {workoutStarted &&
                              (isActive ? (
                                <ChevronUp className="w-5 h-5 text-driftwood flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-driftwood flex-shrink-0" />
                              ))}
                          </div>

                          {/* Expanded exercise controls */}
                          <AnimatePresence>
                            {isActive && workoutStarted && !isCompleted && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 sm:px-6 pb-6 space-y-4 border-t border-warm-sand/20 pt-4">
                                  {exercise.notes && (
                                    <p className="text-driftwood text-xs font-light italic">
                                      {exercise.notes}
                                    </p>
                                  )}

                                  {/* Manual log controls */}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Sets */}
                                    <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20">
                                      <label className="block text-[10px] tracking-[0.15em] uppercase text-driftwood font-semibold mb-2">
                                        Sets Done
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateLog(
                                              idx,
                                              "setsCompleted",
                                              Math.max(
                                                0,
                                                (log?.setsCompleted ?? 0) - 1,
                                              ),
                                            );
                                          }}
                                          className="w-8 h-8 rounded-lg bg-linen flex items-center justify-center text-driftwood hover:bg-warm-sand/30 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xl font-light text-charcoal w-8 text-center">
                                          {log?.setsCompleted ?? 0}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateLog(
                                              idx,
                                              "setsCompleted",
                                              (log?.setsCompleted ?? 0) + 1,
                                            );
                                          }}
                                          className="w-8 h-8 rounded-lg bg-linen flex items-center justify-center text-driftwood hover:bg-warm-sand/30 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Reps */}
                                    <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20">
                                      <label className="block text-[10px] tracking-[0.15em] uppercase text-driftwood font-semibold mb-2">
                                        Rep Count
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateLog(
                                              idx,
                                              "repsCompleted",
                                              Math.max(
                                                0,
                                                (log?.repsCompleted ?? 0) - 1,
                                              ),
                                            );
                                          }}
                                          className="w-8 h-8 rounded-lg bg-linen flex items-center justify-center text-driftwood hover:bg-warm-sand/30 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xl font-light text-charcoal w-8 text-center">
                                          {log?.repsCompleted ?? 0}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateLog(
                                              idx,
                                              "repsCompleted",
                                              (log?.repsCompleted ?? 0) + 1,
                                            );
                                          }}
                                          className="w-8 h-8 rounded-lg bg-linen flex items-center justify-center text-driftwood hover:bg-warm-sand/30 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Precision (if tracked) */}
                                    {log?.isTracked && (
                                      <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20">
                                        <label className="block text-[10px] tracking-[0.15em] uppercase text-driftwood font-semibold mb-2">
                                          Precision
                                        </label>
                                        <p className="text-xl font-light text-sage">
                                          {Math.round(log.precisionAvg)}%
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex items-center gap-3 flex-wrap">
                                    {canTrack && (
                                      <Link
                                        href={`/tracker?exercise=${encodeURIComponent(matchedType!)}&plan_id=${plan!.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal text-parchment text-[10px] tracking-[0.12em] uppercase font-semibold hover:bg-charcoal/85 transition-colors"
                                      >
                                        <Camera className="w-4 h-4" /> Open in
                                        Studio
                                      </Link>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markComplete(idx);
                                      }}
                                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-parchment text-[10px] tracking-[0.12em] uppercase font-semibold hover:bg-sage/80 transition-colors"
                                    >
                                      <Check className="w-4 h-4" /> Mark Done
                                    </button>
                                    {idx < totalExercises - 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveExerciseIdx(idx + 1);
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] tracking-[0.12em] uppercase font-medium text-driftwood border border-warm-sand/40 hover:border-driftwood transition-colors"
                                      >
                                        <SkipForward className="w-3.5 h-3.5" />{" "}
                                        Skip
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Save Workout Bar */}
                  {workoutStarted && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-linen rounded-2xl border border-warm-sand/30 p-6 sm:p-8"
                    >
                      {saved ? (
                        <div className="text-center space-y-3">
                          <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7 text-sage" />
                          </div>
                          <h3 className="text-xl font-light tracking-tight text-charcoal">
                            Workout{" "}
                            <span className="font-medium text-sage italic">
                              saved!
                            </span>
                          </h3>
                          <p className="text-driftwood text-sm font-light">
                            {completedCount} exercises logged from your plan.
                          </p>
                          <div className="flex items-center justify-center gap-4 pt-2">
                            <Link
                              href="/history"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-[0.12em] uppercase font-semibold text-charcoal border border-warm-sand/40 hover:border-charcoal transition-colors"
                            >
                              <History className="w-4 h-4" /> View History
                            </Link>
                            <Link
                              href="/dashboard"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-[0.12em] uppercase font-semibold text-parchment bg-charcoal hover:bg-charcoal/85 transition-colors"
                            >
                              Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-medium text-charcoal tracking-wide mb-1">
                              Finish Workout
                            </h3>
                            <p className="text-driftwood text-xs font-light">
                              {completedCount > 0
                                ? `${completedCount} of ${totalExercises} exercises completed. Save your session to track progress.`
                                : "Complete at least one exercise to save your workout."}
                            </p>
                          </div>
                          <button
                            onClick={handleSaveWorkout}
                            disabled={
                              saving ||
                              (completedCount === 0 &&
                                exerciseLogs.every(
                                  (l) => l.repsCompleted === 0,
                                ))
                            }
                            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs tracking-[0.15em] uppercase font-semibold transition-all duration-300 flex-shrink-0 ${
                              saving
                                ? "bg-warm-sand/30 text-warm-sand cursor-wait"
                                : completedCount === 0 &&
                                    exerciseLogs.every(
                                      (l) => l.repsCompleted === 0,
                                    )
                                  ? "bg-warm-sand/20 text-warm-sand/50 cursor-not-allowed"
                                  : "bg-terracotta text-parchment hover:bg-charcoal shadow-lg"
                            }`}
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" /> Save Workout
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-driftwood text-sm font-light">
                    No exercises found for this day.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-parchment py-10 sm:py-16 px-4 sm:px-8 border-t border-warm-sand/50">
            <div className="max-w-[75rem] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-nobg.png"
                  alt="FitVision"
                  width={120}
                  height={32}
                  className="h-7 sm:h-8 w-auto"
                />
                <span className="font-serif text-lg sm:text-xl font-light tracking-wide">
                  FitVision
                </span>
              </Link>
              <p className="text-[10px] font-medium text-driftwood tracking-[0.2em] uppercase text-center">
                © {new Date().getFullYear()} FitVision. Cultivating mindful
                movement.
              </p>
              <Link
                href="/disclaimer"
                className="text-[10px] tracking-[0.2em] uppercase text-sage hover:text-terracotta transition-colors duration-300"
              >
                Disclaimer
              </Link>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
