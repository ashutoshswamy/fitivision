"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Dumbbell,
  ArrowRight,
  Menu,
  X,
  Activity,
  Target,
  Flame,
  TrendingUp,
  Play,
  Calendar,
  Trash2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface UserStats {
  totalSessions: number;
  totalExercises: number;
  totalReps: number;
  avgPrecision: number;
}

interface SavedPlan {
  id: string;
  name: string;
  summary: string | null;
  created_at: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch user stats
  useEffect(() => {
    if (!isSignedIn) return;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/workouts?type=stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch {
        // Stats are optional; fail silently
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [isSignedIn]);

  // Fetch saved plans
  useEffect(() => {
    if (!isSignedIn) return;
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans?type=all");
        if (res.ok) {
          const data = await res.json();
          setSavedPlans(data.plans ?? []);
        }
      } catch {
        // fail silently
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [isSignedIn]);

  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", plan_id: planId }),
      });
      if (res.ok) {
        setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
      }
    } catch {
      // fail silently
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.firstName || "there";

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
              className="text-charcoal transition-colors duration-300"
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
                  className="text-charcoal py-1"
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
              <span>Your Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-charcoal leading-[1] mb-3 sm:mb-4">
              Welcome back,{" "}
              <span className="font-medium text-muted-clay italic">
                {firstName}.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-driftwood font-light max-w-lg leading-relaxed">
              Choose how you&apos;d like to train today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      {!loadingStats && stats && stats.totalSessions > 0 && (
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

      {/* Main Choice Cards */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-[75rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* AI-Generated Plan */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Link
                href="/suggestions"
                className="group block bg-gradient-to-br from-linen to-parchment rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 border border-warm-sand/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
              >
                {/* Decorative blob */}
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-terracotta/5 blur-3xl" />

                <div className="relative z-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-terracotta/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-terracotta/20 transition-colors duration-500">
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-terracotta" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-charcoal mb-3 sm:mb-4">
                    AI-Generated{" "}
                    <span className="font-medium text-muted-clay italic">
                      Plan
                    </span>
                  </h2>

                  <p className="text-driftwood font-light leading-relaxed mb-8 sm:mb-10 max-w-sm">
                    Get a personalized weekly workout plan crafted by AI based
                    on your fitness level, goals, and physical health.
                  </p>

                  <div className="flex items-center gap-3 text-xs text-terracotta tracking-[0.15em] uppercase font-semibold">
                    <span>Get My Plan</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Choose Your Own Workout */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Link
                href="/workouts"
                className="group block bg-gradient-to-br from-linen to-parchment rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 border border-warm-sand/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
              >
                {/* Decorative blob */}
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-sage/5 blur-3xl" />

                <div className="relative z-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sage/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-sage/20 transition-colors duration-500">
                    <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-sage" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-charcoal mb-3 sm:mb-4">
                    Choose Your{" "}
                    <span className="font-medium text-muted-clay italic">
                      Workout
                    </span>
                  </h2>

                  <p className="text-driftwood font-light leading-relaxed mb-8 sm:mb-10 max-w-sm">
                    Browse all available exercises with real-time pose tracking
                    and pick exactly what you want to work on today.
                  </p>

                  <div className="flex items-center gap-3 text-xs text-sage tracking-[0.15em] uppercase font-semibold">
                    <span>Browse Exercises</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Secondary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {/* Start Plan Workout */}
            <Link
              href="/plan-workout"
              className="group flex items-center gap-4 sm:gap-5 bg-linen rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-terracotta/20 hover:border-terracotta/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-terracotta" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-charcoal tracking-wide mb-0.5">
                  Plan Workout
                </h3>
                <p className="text-xs text-driftwood font-light">
                  Start today&apos;s exercises from your active plan
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-terracotta/50 group-hover:text-terracotta group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
            </Link>

            {/* Quick Start */}
            <Link
              href="/tracker"
              className="group flex items-center gap-4 sm:gap-5 bg-linen rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-warm-sand/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-charcoal" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-charcoal tracking-wide mb-0.5">
                  Quick Start Studio
                </h3>
                <p className="text-xs text-driftwood font-light">
                  Jump straight into the tracking camera
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-sand group-hover:text-charcoal group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
            </Link>

            {/* View History */}
            <Link
              href="/history"
              className="group flex items-center gap-4 sm:gap-5 bg-linen rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-warm-sand/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-charcoal" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-charcoal tracking-wide mb-0.5">
                  Workout History
                </h3>
                <p className="text-xs text-driftwood font-light">
                  Review past sessions, reps, and progress
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-sand group-hover:text-charcoal group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Saved Plans */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-[75rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-driftwood" />
                <h2 className="text-lg sm:text-xl font-medium text-charcoal tracking-wide">
                  My Plans
                </h2>
                {savedPlans.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-warm-sand/40 text-driftwood text-[10px] tracking-[0.15em] uppercase font-semibold">
                    {savedPlans.length}
                  </span>
                )}
              </div>
              <Link
                href="/suggestions"
                className="text-xs tracking-[0.15em] uppercase text-terracotta hover:text-charcoal transition-colors duration-300 font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> New Plan
              </Link>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-driftwood animate-spin" />
              </div>
            ) : savedPlans.length === 0 ? (
              <div className="bg-linen/60 rounded-2xl border border-warm-sand/30 p-8 sm:p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-warm-sand/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 text-driftwood" />
                </div>
                <h3 className="text-lg font-light tracking-tight text-charcoal mb-2">
                  No saved plans yet
                </h3>
                <p className="text-driftwood text-sm font-light mb-6 max-w-sm mx-auto">
                  Generate a personalized AI plan and save it to get started
                  with structured workouts.
                </p>
                <Link
                  href="/suggestions"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-parchment rounded-full text-xs tracking-[0.15em] uppercase font-semibold hover:bg-charcoal transition-colors duration-300"
                >
                  <Sparkles className="w-4 h-4" /> Generate Plan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    layout
                    className="bg-linen/60 rounded-2xl border border-warm-sand/30 hover:border-warm-sand/60 p-5 sm:p-6 transition-all duration-300"
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-charcoal tracking-wide truncate">
                        {plan.name || "Untitled Plan"}
                      </h3>
                    </div>

                    <p className="text-driftwood text-xs font-light line-clamp-2 mb-3 leading-relaxed">
                      {plan.summary || "No summary available"}
                    </p>

                    <p className="text-warm-sand text-[10px] tracking-[0.12em] uppercase mb-4">
                      {new Date(plan.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/plan-workout?plan_id=${plan.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal text-parchment text-[10px] tracking-[0.12em] uppercase font-semibold hover:bg-charcoal/85 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" /> Workout
                      </Link>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="px-3 py-2.5 rounded-xl text-[10px] text-driftwood border border-warm-sand/30 hover:border-red-300 hover:text-red-400 transition-all duration-300"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
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
