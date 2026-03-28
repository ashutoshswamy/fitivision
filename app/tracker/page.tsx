"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { CameraTracker } from "../components/CameraTracker";
import { SidebarMetrics } from "../components/SidebarMetrics";
import { ExerciseType, EXERCISES } from "../lib/exercises";
import Link from "next/link";
import Image from "next/image";
import {
  LogIn,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  Plus,
  Minus,
  SkipForward,
  PartyPopper,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";

// ─── Plan-related types ─────────────────────────────────────
interface PlanExercise {
  name: string;
  sets: string;
  reps: string;
  duration?: string;
  notes: string;
}

interface DayPlan {
  day: string;
  focus: string;
  exercises: PlanExercise[];
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

interface PlanExerciseEntry {
  exerciseType: ExerciseType;
  name: string;
  targetSets: number;
  targetReps: string;
}

// Match exercise name to in-app ExerciseType
function matchExerciseType(name: string): ExerciseType | null {
  const lower = name.toLowerCase();
  for (const ex of EXERCISES) {
    if (lower.includes(ex.type.toLowerCase())) return ex.type;
  }
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
  if (lower.includes("diamond push") || lower.includes("close grip push"))
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
  if (lower.includes("deadlift")) return "Deadlifts";
  if (lower.includes("lateral raise") || lower.includes("side raise"))
    return "Lateral Raises";
  if (lower.includes("front raise")) return "Front Raises";
  if (lower.includes("high knee") || lower.includes("high-knee"))
    return "High Knees";
  if (
    lower.includes("tricep extension") ||
    lower.includes("overhead extension")
  )
    return "Overhead Tricep Extension";
  if (lower.includes("tricep kickback") || lower.includes("kickback"))
    return "Tricep Kickbacks";
  if (lower.includes("tricep dip") || lower.includes("bench dip"))
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
  if (lower.includes("bent over row") || lower.includes("row"))
    return "Bent Over Rows";
  if (lower.includes("reverse fly")) return "Reverse Flys";
  if (lower.includes("chest fly")) return "Chest Flys";
  if (lower.includes("step up") || lower.includes("step-up")) return "Step Ups";
  if (lower.includes("calf raise") || lower.includes("calf"))
    return "Calf Raises";
  if (lower.includes("donkey kick")) return "Donkey Kicks";
  if (lower.includes("fire hydrant")) return "Fire Hydrants";
  if (lower.includes("good morning")) return "Good Mornings";
  if (lower.includes("wall sit")) return "Wall Sit";
  if (lower.includes("leg raise")) return "Leg Raises";
  if (lower.includes("mountain climber")) return "Mountain Climbers";
  if (lower.includes("flutter kick") || lower.includes("flutter"))
    return "Flutter Kicks";
  if (lower.includes("v-up") || lower.includes("v up")) return "V-Ups";
  if (lower.includes("dead bug")) return "Dead Bugs";
  if (lower.includes("side plank")) return "Side Plank Dips";
  if (lower.includes("russian twist") || lower.includes("twist"))
    return "Russian Twists";
  if (lower.includes("burpee")) return "Burpees";
  if (lower.includes("butt kick")) return "Butt Kicks";
  if (lower.includes("arm circle")) return "Arm Circles";
  if (lower.includes("toe touch")) return "Toe Touches";
  if (lower.includes("superman") || lower.includes("back extension"))
    return "Superman";
  if (lower.includes("bridge")) return "Glute Bridges";
  return null;
}

function findTodayDayIndex(weeklyPlan: DayPlan[]): number {
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
  const index = weeklyPlan.findIndex(
    (d) =>
      d.day.toLowerCase().includes(today) ||
      today.includes(d.day.toLowerCase()),
  );
  if (index !== -1) return index;
  const nonRest = weeklyPlan.findIndex(
    (d) => !d.focus.toLowerCase().includes("rest"),
  );
  return nonRest !== -1 ? nonRest : 0;
}

function parseSetsCount(setsStr: string): number {
  const match = setsStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

export default function TrackerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}

function TrackerContent() {
  const searchParams = useSearchParams();
  const exerciseParam = searchParams.get("exercise");
  const planIdParam = searchParams.get("plan_id");
  const initialExercise =
    EXERCISES.find((e) => e.type === exerciseParam)?.type ?? "Squats";

  const [exercise, setExercise] = useState<ExerciseType>(initialExercise);
  const [trackerData, setTrackerData] = useState({
    reps: 0,
    feedback: "Initializing...",
    precision: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileMetrics, setShowMobileMetrics] = useState(false);
  const [sets, setSets] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sessionStartRef = useRef(new Date().toISOString());
  const { isSignedIn } = useUser();
  // ─── Plan mode state ───────────────────────────────────────
  const [planExercises, setPlanExercises] = useState<PlanExerciseEntry[]>([]);
  const [planExerciseIndex, setPlanExerciseIndex] = useState(0);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(
    null,
  );
  const [planCompleted, setPlanCompleted] = useState(false);
  const isPlanMode = !!planIdParam && planExercises.length > 0;

  // Fetch plan data & build trackable exercise list
  useEffect(() => {
    if (!planIdParam || !isSignedIn) return;
    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/plans?type=all`);
        if (!res.ok) return;
        const data = await res.json();
        const plan: SavedPlan | undefined = (data.plans ?? []).find(
          (p: SavedPlan) => p.id === planIdParam,
        );
        if (!plan) return;

        const dayIdx = findTodayDayIndex(plan.plan_data.weeklyPlan);
        const todayPlan = plan.plan_data.weeklyPlan[dayIdx];
        if (!todayPlan) return;

        const trackable: PlanExerciseEntry[] = [];
        for (const ex of todayPlan.exercises) {
          const matched = matchExerciseType(ex.name);
          if (matched) {
            trackable.push({
              exerciseType: matched,
              name: ex.name,
              targetSets: parseSetsCount(ex.sets),
              targetReps: ex.reps,
            });
          }
        }

        if (trackable.length > 0) {
          setPlanExercises(trackable);
          setPlanExerciseIndex(0);
          setExercise(trackable[0].exerciseType);
          setSets(1);
        }
      } catch {
        // fail silently
      }
    };
    fetchPlan();
  }, [planIdParam, isSignedIn]);

  // Handle set completion in plan mode — auto-switch when target sets reached
  useEffect(() => {
    if (!isPlanMode) return;
    const current = planExercises[planExerciseIndex];
    if (!current || sets <= current.targetSets) return;

    // Sets exceeded target — exercise complete
    const nextIdx = planExerciseIndex + 1;
    if (nextIdx < planExercises.length) {
      const nextEx = planExercises[nextIdx];
      setTransitionMessage(`${current.name} complete! Next up: ${nextEx.name}`);
      setTimeout(() => {
        setPlanExerciseIndex(nextIdx);
        setExercise(nextEx.exerciseType);
        setSets(1);
        setTrackerData({ reps: 0, feedback: "Initializing...", precision: 0 });
        setTransitionMessage(null);
      }, 3000);
    } else {
      // All exercises done
      setTransitionMessage("All exercises complete! Great workout!");
      setPlanCompleted(true);
      setTimeout(() => setTransitionMessage(null), 5000);
    }
  }, [sets, isPlanMode, planExerciseIndex, planExercises]);

  const handleSaveWorkout = async () => {
    if (!isSignedIn || saving) return;
    setSaving(true);
    try {
      const now = new Date();
      const startTime = new Date(sessionStartRef.current);
      const durationSec = Math.round(
        (now.getTime() - startTime.getTime()) / 1000,
      );
      const currentExercise = EXERCISES.find((e) => e.type === exercise);

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_save",
          exercise_type: exercise,
          sets_completed: sets,
          reps_completed: trackerData.reps,
          target_reps: currentExercise?.targetReps ?? null,
          precision_avg: trackerData.precision,
          duration_sec: durationSec,
          source: planIdParam ? "ai_plan" : "manual",
          ai_plan_id: planIdParam || null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save workout:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (exerciseParam) {
      const match = EXERCISES.find((e) => e.type === exerciseParam);
      if (match) setExercise(match.type);
    }
  }, [exerciseParam]);

  const handleTrackerUpdate = useCallback(
    (reps: number, feedback: string, precision: number) => {
      setTrackerData({ reps, feedback, precision });
    },
    [],
  );

  return (
    <div className="min-h-screen bg-charcoal text-parchment font-sans selection:bg-sage selection:text-parchment">
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-5 bg-gradient-to-b from-charcoal to-transparent"
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-nobg.png"
            alt="FitVision"
            width={120}
            height={32}
            className="h-6 sm:h-8 w-auto"
          />
          <span className="font-serif text-lg sm:text-xl font-light tracking-wide">
            FitVision
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase font-medium">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="text-warm-sand hover:text-parchment transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/#philosophy"
            className="text-warm-sand hover:text-parchment transition-colors"
          >
            Philosophy
          </Link>
          <Link
            href="/#process"
            className="text-warm-sand hover:text-parchment transition-colors"
          >
            Method
          </Link>
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 text-warm-sand hover:text-parchment transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-parchment"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </motion.nav>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-md border-b border-driftwood/30 md:hidden"
          >
            <div className="flex flex-col gap-3 px-6 py-4 text-xs tracking-[0.2em] uppercase font-medium">
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-in"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-warm-sand hover:text-parchment transition-colors py-1"
              >
                Dashboard
              </Link>
              <Link
                href="/#philosophy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-warm-sand hover:text-parchment transition-colors py-1"
              >
                Philosophy
              </Link>
              <Link
                href="/#process"
                onClick={() => setMobileMenuOpen(false)}
                className="text-warm-sand hover:text-parchment transition-colors py-1"
              >
                Method
              </Link>
              {isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-warm-sand hover:text-parchment transition-colors py-1"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="pt-16 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-8 min-h-screen md:h-screen w-full flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Camera Feed - Takes up remaining space */}
        <section className="flex-1 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-driftwood/40 min-h-[50vh] md:min-h-0">
          <CameraTracker
            exerciseType={exercise}
            onTrackerUpdate={handleTrackerUpdate}
          />

          {/* Plan progress — top left (plan mode) or Precision (free mode) */}
          {isPlanMode ? (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-charcoal/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-parchment/10">
              <span className="text-[10px] tracking-widest uppercase text-warm-sand/70 font-semibold">
                Plan Progress
              </span>
              <p className="text-sm font-medium text-parchment leading-tight">
                {planExerciseIndex + 1}
                <span className="text-xs text-warm-sand/60">
                  /{planExercises.length}
                </span>
              </p>
              <p className="text-[10px] text-warm-sand/80 mt-0.5 leading-tight max-w-[120px] truncate">
                {planExercises[planExerciseIndex]?.name}
              </p>
            </div>
          ) : (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-charcoal/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-parchment/10">
              <span className="text-[10px] tracking-widest uppercase text-warm-sand/70 font-semibold">
                Precision
              </span>
              <p className="text-sm font-medium text-parchment leading-tight">
                {trackerData.precision}
                <span className="text-xs text-warm-sand/60">%</span>
              </p>
            </div>
          )}

          {/* Reps, Sets counter & Save — top right */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
            <div className="bg-charcoal/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-parchment/10 text-center">
              <span className="text-[10px] tracking-widest uppercase text-warm-sand/70 font-semibold">
                Reps
              </span>
              <p className="text-sm font-medium text-parchment leading-tight">
                {trackerData.reps}
              </p>
            </div>
            <div className="bg-charcoal/60 backdrop-blur-md rounded-lg px-2 py-1.5 border border-parchment/10 flex items-center gap-1.5">
              <span className="text-[10px] tracking-widest uppercase text-warm-sand/70 font-semibold">
                Sets
              </span>
              <button
                onClick={() => setSets(Math.max(1, sets - 1))}
                className="w-5 h-5 rounded bg-parchment/15 flex items-center justify-center text-warm-sand hover:bg-parchment/25 transition-colors"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-sm font-medium text-parchment w-4 text-center">
                {sets}
              </span>
              {isPlanMode && (
                <span className="text-[10px] text-warm-sand/50">
                  /{planExercises[planExerciseIndex]?.targetSets}
                </span>
              )}
              <button
                onClick={() => setSets(sets + 1)}
                className="w-5 h-5 rounded bg-parchment/15 flex items-center justify-center text-warm-sand hover:bg-parchment/25 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
            {isSignedIn && (
              <button
                onClick={handleSaveWorkout}
                disabled={saving || trackerData.reps === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase font-semibold backdrop-blur-md border border-parchment/10 transition-all duration-300 ${
                  saved
                    ? "bg-sage/80 text-parchment"
                    : saving
                      ? "bg-warm-sand/20 text-warm-sand cursor-wait"
                      : trackerData.reps === 0
                        ? "bg-charcoal/40 text-warm-sand/40 cursor-not-allowed"
                        : "bg-terracotta/80 text-parchment hover:bg-terracotta/90"
                }`}
              >
                {saved ? (
                  <Check className="w-3.5 h-3.5" />
                ) : saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-warm-sand border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {saved ? "Saved" : saving ? "..." : "Save"}
                </span>
              </button>
            )}
          </div>

          {/* Plan transition message overlay */}
          <AnimatePresence>
            {transitionMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm"
              >
                <div className="text-center px-6">
                  <div className="mb-4">
                    {planCompleted ? (
                      <PartyPopper className="w-12 h-12 text-sage mx-auto" />
                    ) : (
                      <SkipForward className="w-10 h-10 text-terracotta mx-auto" />
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-serif font-light text-parchment leading-snug max-w-sm mx-auto">
                    {transitionMessage}
                  </p>
                  {!planCompleted && (
                    <p className="text-[10px] tracking-widest uppercase text-warm-sand/60 mt-3">
                      Switching in a moment...
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Mobile metrics toggle */}
        <button
          onClick={() => setShowMobileMetrics(!showMobileMetrics)}
          className="md:hidden flex items-center justify-center gap-2 py-3 bg-charcoal/80 backdrop-blur-sm rounded-xl border border-driftwood/30 text-parchment text-xs tracking-widest uppercase font-medium"
        >
          {showMobileMetrics ? (
            <>
              <ChevronUp className="w-4 h-4" /> Hide Metrics
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Show Metrics & Controls
            </>
          )}
        </button>

        {/* Sidebar Metrics - Fixed width on Desktop, collapsible on mobile */}
        <aside
          className={`w-full md:w-80 md:h-full flex-shrink-0 ${showMobileMetrics ? "block" : "hidden md:block"}`}
        >
          <SidebarMetrics
            reps={trackerData.reps}
            feedback={trackerData.feedback}
            precision={trackerData.precision}
            exercise={exercise}
            onExerciseChange={setExercise}
            planMode={isPlanMode}
          />
        </aside>
      </main>
    </div>
  );
}
