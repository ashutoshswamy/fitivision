"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  LogOut,
  Menu,
  X,
  History,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Trash2,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface WorkoutExercise {
  id: string;
  exercise_type: string;
  sets_completed: number;
  reps_completed: number;
  target_reps: number | null;
  precision_avg: number | null;
  duration_sec: number | null;
  created_at: string;
}

interface WorkoutSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  notes: string | null;
  source: "manual" | "ai_plan";
  workout_exercises: WorkoutExercise[];
}

interface UserStats {
  totalSessions: number;
  totalExercises: number;
  totalReps: number;
  avgPrecision: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (sessionId: string) => {
    if (deletingId) return;
    setDeletingId(sessionId);
    try {
      const res = await fetch(`/api/workouts?session_id=${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (expandedSession === sessionId) setExpandedSession(null);
        // Refresh stats
        const statsRes = await fetch("/api/workouts?type=stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
      }
    } catch {
      // fail silently
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchData = async () => {
      try {
        const [sessionsRes, statsRes] = await Promise.all([
          fetch("/api/workouts?type=sessions&limit=50"),
          fetch("/api/workouts?type=stats"),
        ]);
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions ?? []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSignedIn]);

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
            <button
              onClick={async () => {
                await signOut();
              }}
              className="flex items-center gap-2 text-driftwood hover:text-terracotta transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
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
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-driftwood hover:text-terracotta transition-colors py-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Header */}
      <section className="pt-28 sm:pt-36 pb-6 sm:pb-10 px-4 sm:px-6">
        <div className="max-w-[75rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 text-[10px] text-sage tracking-[0.3em] font-semibold uppercase mb-4">
              <span className="w-8 h-px bg-sage"></span>
              <span>Training Log</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-charcoal leading-[1] mb-3 sm:mb-4">
              Workout{" "}
              <span className="font-medium text-muted-clay italic">
                history.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-driftwood font-light max-w-lg leading-relaxed">
              Every rep tracked, every session remembered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Summary */}
      {stats && stats.totalSessions > 0 && (
        <section className="pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-[75rem] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            >
              {[
                {
                  icon: <Activity className="w-4 h-4" />,
                  label: "Sessions",
                  value: stats.totalSessions,
                },
                {
                  icon: <Dumbbell className="w-4 h-4" />,
                  label: "Exercises",
                  value: stats.totalExercises,
                },
                {
                  icon: <Flame className="w-4 h-4" />,
                  label: "Total Reps",
                  value: stats.totalReps,
                },
                {
                  icon: <Target className="w-4 h-4" />,
                  label: "Avg Precision",
                  value: `${stats.avgPrecision}%`,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-linen rounded-2xl p-4 sm:p-5 border border-warm-sand/40"
                >
                  <div className="flex items-center gap-2 text-sage mb-2">
                    {stat.icon}
                    <span className="text-[10px] tracking-widest uppercase font-semibold">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-light tracking-tighter text-charcoal">
                    {stat.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Sessions List */}
      <section className="pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-[75rem] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="w-16 h-16 rounded-2xl bg-linen flex items-center justify-center mx-auto mb-6">
                <History className="w-8 h-8 text-warm-sand" />
              </div>
              <h3 className="text-xl sm:text-2xl font-light tracking-tight text-charcoal mb-3">
                No workouts yet
              </h3>
              <p className="text-driftwood font-light mb-8 max-w-sm mx-auto">
                Complete a workout in the Studio and it will appear here with
                all your stats.
              </p>
              <Link
                href="/tracker"
                className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-parchment rounded-full text-sm font-medium tracking-wide hover:bg-charcoal transition-colors shadow-lg"
              >
                Start a Workout <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, i) => {
                const isExpanded = expandedSession === session.id;
                const totalReps = session.workout_exercises.reduce(
                  (sum, ex) => sum + ex.reps_completed,
                  0,
                );
                const exerciseTypes = [
                  ...new Set(
                    session.workout_exercises.map((ex) => ex.exercise_type),
                  ),
                ];

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <button
                      onClick={() =>
                        setExpandedSession(isExpanded ? null : session.id)
                      }
                      className="w-full text-left bg-linen rounded-2xl p-5 sm:p-6 border border-warm-sand/40 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className="text-sm sm:text-base font-medium text-charcoal">
                              {formatDate(session.started_at)}
                            </span>
                            <span className="text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full bg-parchment text-driftwood border border-warm-sand/40">
                              {session.source === "ai_plan"
                                ? "AI Plan"
                                : "Manual"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-driftwood">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(session.started_at)}
                            </span>
                            {session.duration_sec && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDuration(session.duration_sec)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              {session.workout_exercises.length} exercise
                              {session.workout_exercises.length !== 1
                                ? "s"
                                : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {totalReps} reps
                            </span>
                          </div>
                          {exerciseTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {exerciseTypes.map((type) => (
                                <span
                                  key={type}
                                  className="px-2.5 py-0.5 rounded-full bg-parchment text-[10px] tracking-widest uppercase text-driftwood border border-warm-sand/30"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            disabled={deletingId === session.id}
                            className="p-1.5 rounded-lg text-warm-sand hover:text-terracotta hover:bg-terracotta/10 transition-colors duration-200 disabled:opacity-50"
                            aria-label="Delete workout"
                          >
                            {deletingId === session.id ? (
                              <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <span className="text-warm-sand">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Expanded exercises detail */}
                      <AnimatePresence>
                        {isExpanded && session.workout_exercises.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-5 pt-5 border-t border-warm-sand/40 space-y-3">
                              {session.workout_exercises.map((ex) => (
                                <div
                                  key={ex.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-parchment rounded-xl p-4 border border-warm-sand/30"
                                >
                                  <div>
                                    <h4 className="text-sm font-medium text-charcoal">
                                      {ex.exercise_type}
                                    </h4>
                                    <p className="text-xs text-driftwood mt-0.5">
                                      {ex.sets_completed} set
                                      {ex.sets_completed !== 1
                                        ? "s"
                                        : ""} × {ex.reps_completed} reps
                                      {ex.target_reps
                                        ? ` / ${ex.target_reps} target`
                                        : ""}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {ex.precision_avg != null && (
                                      <div className="flex items-center gap-1.5">
                                        <Target className="w-3 h-3 text-sage" />
                                        <span className="text-xs font-medium text-charcoal">
                                          {ex.precision_avg}%
                                        </span>
                                      </div>
                                    )}
                                    {ex.duration_sec != null && (
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-driftwood" />
                                        <span className="text-xs text-driftwood">
                                          {formatDuration(ex.duration_sec)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {session.notes && (
                                <p className="text-xs text-driftwood italic pl-1 pt-1">
                                  Note: {session.notes}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                );
              })}
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
    </div>
  );
}
