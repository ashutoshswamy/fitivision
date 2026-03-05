"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  LogIn,
  LogOut,
  Loader2,
  Dumbbell,
  AlertTriangle,
  Lightbulb,
  Calendar,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Save,
  Check,
  Trash2,
  Star,
  BookOpen,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

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

interface SuggestionsResponse {
  summary: string;
  weeklyPlan: DayPlan[];
  tips: string[];
  cautions: string[];
  availableInApp: string[];
  raw?: string;
  error?: string;
}

const fitnessLevels = ["Beginner", "Intermediate", "Advanced"];
const goalOptions = [
  "Weight Loss",
  "Muscle Building",
  "Flexibility",
  "Endurance",
  "General Fitness",
  "Posture Improvement",
  "Rehabilitation",
  "Stress Relief",
];
const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function SuggestionsPage() {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessLevel: "",
    goals: [] as string[],
    conditions: "",
    preferences: "",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SuggestionsResponse | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [step, setStep] = useState<"form" | "results">("form");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [planName, setPlanName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  interface SavedPlan {
    id: string;
    name: string;
    summary: string | null;
    is_active: boolean;
    created_at: string;
    plan_data: SuggestionsResponse;
    form_data: Record<string, unknown>;
  }

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  // Fetch saved plans on mount
  useEffect(() => {
    if (!isSignedIn) return;
    const fetchPlans = async () => {
      setLoadingPlans(true);
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

  const handleSavePlan = async () => {
    if (!results || savingPlan) return;
    setSavingPlan(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          name: planName || `Plan — ${new Date().toLocaleDateString()}`,
          form_data: formData,
          plan_data: results,
          summary: results.summary || null,
          is_active: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlanSaved(true);
        setShowSaveDialog(false);
        setSavedPlans((prev) => [data.plan, ...prev]);
        setTimeout(() => setPlanSaved(false), 3000);
      }
    } catch {
      // fail silently
    } finally {
      setSavingPlan(false);
    }
  };

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

  const handleActivatePlan = async (planId: string) => {
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", plan_id: planId }),
      });
      if (res.ok) {
        setSavedPlans((prev) =>
          prev.map((p) => ({ ...p, is_active: p.id === planId })),
        );
      }
    } catch {
      // fail silently
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    setResults(plan.plan_data);
    setStep("results");
    setPlanSaved(true);
    setShowSavedPlans(false);
  };

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          goals: formData.goals.join(", "),
        }),
      });
      const data = await res.json();
      setResults(data);
      setStep("results");
    } catch {
      setResults({
        error: "Failed to get suggestions. Please try again.",
      } as SuggestionsResponse);
      setStep("results");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

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
              href="/"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Home
            </Link>
            <Link
              href="/workouts"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Workouts
            </Link>
            <Link
              href="/suggestions"
              className="text-charcoal transition-colors duration-300"
            >
              AI Suggestions
            </Link>
            <Link
              href="/tracker"
              className="text-muted-clay hover:text-terracotta transition-colors duration-300 flex items-center gap-2"
            >
              Studio <ArrowRight className="w-4 h-4" />
            </Link>
            {isSignedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-driftwood hover:text-terracotta transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 text-parchment bg-charcoal px-4 py-2 rounded-full hover:bg-charcoal/85 transition-colors duration-300"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
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
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Home
                </Link>
                <Link
                  href="/workouts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Workouts
                </Link>
                <Link
                  href="/suggestions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-charcoal py-1"
                >
                  AI Suggestions
                </Link>
                <Link
                  href="/tracker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-clay hover:text-terracotta transition-colors py-1 flex items-center gap-2"
                >
                  Studio <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="pt-2 border-t border-warm-sand/30">
                  {isSignedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-driftwood hover:text-terracotta transition-colors py-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  ) : (
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center gap-2 text-parchment bg-charcoal px-4 py-2 rounded-full hover:bg-charcoal/85 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Header */}
      <section className="pt-28 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-[60rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 text-[10px] text-terracotta tracking-[0.3em] font-semibold uppercase mb-6"
          >
            <span className="w-8 h-px bg-terracotta" />
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Google Gemini</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-charcoal leading-[1] mb-4 sm:mb-6"
          >
            Personalized{" "}
            <span className="font-medium text-muted-clay italic">
              exercise plan.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-driftwood font-light max-w-xl leading-relaxed"
          >
            Tell us about yourself and your goals. Our AI will craft a tailored
            weekly exercise plan just for you.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-[60rem] mx-auto">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Form */}
                <div className="bg-linen/60 rounded-2xl sm:rounded-3xl border border-warm-sand/30 p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-10">
                  {/* Basic Info */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        1
                      </span>
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 28"
                          value={formData.age}
                          onChange={(e) =>
                            setFormData({ ...formData, age: e.target.value })
                          }
                          className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 text-sm appearance-none"
                        >
                          <option value="">Select</option>
                          {genderOptions.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 175"
                          value={formData.height}
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                          className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 70"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fitness Level */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        2
                      </span>
                      Fitness Level
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {fitnessLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            setFormData({ ...formData, fitnessLevel: level })
                          }
                          className={`px-5 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase font-semibold border transition-all duration-300 ${
                            formData.fitnessLevel === level
                              ? "bg-terracotta text-parchment border-terracotta"
                              : "bg-parchment text-driftwood border-warm-sand/50 hover:border-terracotta/50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        3
                      </span>
                      Your Goals
                      <span className="text-[10px] text-warm-sand font-normal tracking-wider">
                        (select multiple)
                      </span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => handleGoalToggle(goal)}
                          className={`px-5 py-2.5 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                            formData.goals.includes(goal)
                              ? "bg-sage text-parchment border-sage"
                              : "bg-parchment text-driftwood border-warm-sand/50 hover:border-sage/50"
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health & Preferences */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        4
                      </span>
                      Health & Preferences
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Pre-existing conditions or injuries
                        </label>
                        <textarea
                          placeholder="e.g., Lower back pain, knee injury, asthma..."
                          value={formData.conditions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditions: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Exercise preferences
                        </label>
                        <textarea
                          placeholder="e.g., Home workouts only, no equipment, prefer yoga..."
                          value={formData.preferences}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preferences: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="group relative inline-flex items-center justify-between px-8 py-4 bg-terracotta text-parchment rounded-full overflow-hidden transition-all duration-500 hover:bg-charcoal w-full sm:w-auto sm:min-w-[280px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-3 mx-auto">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="tracking-[0.15em] uppercase text-xs font-semibold">
                            Generating Plan...
                          </span>
                        </span>
                      ) : (
                        <>
                          <span className="relative z-10 tracking-[0.15em] uppercase text-xs font-semibold flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generate My Plan
                          </span>
                          <span className="relative z-10 w-8 h-8 rounded-full bg-parchment/20 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-2">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-warm-sand tracking-wider">
                      Results are AI-generated and not medical advice
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Back button + Save button row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep("form")}
                    className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-driftwood hover:text-charcoal transition-colors duration-300 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modify Inputs
                  </button>

                  {isSignedIn && (
                    <div className="flex items-center gap-3">
                      {planSaved ? (
                        <span className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-sage font-semibold">
                          <Check className="w-4 h-4" /> Saved
                        </span>
                      ) : (
                        <button
                          onClick={() => setShowSaveDialog(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-parchment text-xs tracking-[0.15em] uppercase font-semibold hover:bg-charcoal/85 transition-colors duration-300 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          Save Plan
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Save dialog */}
                <AnimatePresence>
                  {showSaveDialog && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-linen/80 rounded-2xl border border-warm-sand/40 p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                    >
                      <input
                        type="text"
                        placeholder="Name your plan (e.g., 'Summer Shred')"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        className="flex-1 bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm"
                        autoFocus
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSavePlan}
                          disabled={savingPlan}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-terracotta text-parchment text-xs tracking-[0.15em] uppercase font-semibold hover:bg-charcoal transition-colors duration-300 disabled:opacity-50"
                        >
                          {savingPlan ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {savingPlan ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setShowSaveDialog(false)}
                          className="px-4 py-3 rounded-xl text-xs tracking-[0.15em] uppercase font-medium text-driftwood hover:text-charcoal border border-warm-sand/40 hover:border-warm-sand transition-colors duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {results?.error ? (
                  <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-terracotta mx-auto mb-4" />
                    <p className="text-charcoal font-medium mb-2">
                      Something went wrong
                    </p>
                    <p className="text-driftwood text-sm">{results.error}</p>
                  </div>
                ) : results?.raw ? (
                  <div className="bg-linen/60 rounded-2xl border border-warm-sand/30 p-8">
                    <p className="text-driftwood whitespace-pre-wrap text-sm leading-relaxed">
                      {results.raw}
                    </p>
                  </div>
                ) : results ? (
                  <>
                    {/* Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-linen/60 rounded-2xl border border-warm-sand/30 p-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-terracotta" />
                        <h2 className="text-xl font-medium text-charcoal tracking-wide">
                          Your Personalized Plan
                        </h2>
                      </div>
                      <p className="text-driftwood font-light leading-relaxed">
                        {results.summary}
                      </p>
                    </motion.div>

                    {/* Weekly Plan */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-sage" />
                        <h2 className="text-xl font-medium text-charcoal tracking-wide">
                          Weekly Schedule
                        </h2>
                      </div>

                      {results.weeklyPlan?.map((day, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.05 }}
                          className="bg-linen/60 rounded-2xl border border-warm-sand/30 overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setExpandedDay(expandedDay === i ? null : i)
                            }
                            className="w-full flex items-center justify-between p-6 hover:bg-warm-sand/10 transition-colors duration-300"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-mono tracking-widest text-sage">
                                {day.day}
                              </span>
                              <span className="text-charcoal font-medium tracking-wide">
                                {day.focus}
                              </span>
                            </div>
                            {expandedDay === i ? (
                              <ChevronUp className="w-4 h-4 text-driftwood" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-driftwood" />
                            )}
                          </button>

                          <AnimatePresence>
                            {expandedDay === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 space-y-3">
                                  <div className="text-[10px] tracking-widest uppercase text-warm-sand mb-2">
                                    Rest: {day.restPeriod}
                                  </div>
                                  {day.exercises?.map((ex, j) => (
                                    <div
                                      key={j}
                                      className="bg-parchment rounded-xl p-4 border border-warm-sand/20 flex flex-col sm:flex-row sm:items-center gap-3"
                                    >
                                      <div className="flex-1">
                                        <p className="text-charcoal font-medium text-sm">
                                          {ex.name}
                                        </p>
                                        {ex.notes && (
                                          <p className="text-driftwood text-xs mt-1 font-light">
                                            {ex.notes}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase text-sage font-mono shrink-0">
                                        {ex.sets && <span>{ex.sets} sets</span>}
                                        {ex.reps && <span>{ex.reps} reps</span>}
                                        {ex.duration && (
                                          <span>{ex.duration}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Tips */}
                    {results.tips && results.tips.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-sage/5 rounded-2xl border border-sage/20 p-8"
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <Lightbulb className="w-5 h-5 text-sage" />
                          <h2 className="text-xl font-medium text-charcoal tracking-wide">
                            Tips for You
                          </h2>
                        </div>
                        <ul className="space-y-3">
                          {results.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-sm text-driftwood font-light leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* Cautions */}
                    {results.cautions && results.cautions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-terracotta/5 rounded-2xl border border-terracotta/20 p-8"
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <AlertTriangle className="w-5 h-5 text-terracotta" />
                          <h2 className="text-xl font-medium text-charcoal tracking-wide">
                            Things to Watch
                          </h2>
                        </div>
                        <ul className="space-y-3">
                          {results.cautions.map((caution, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-sm text-driftwood font-light leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                              {caution}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* Available in App */}
                    {results.availableInApp &&
                      results.availableInApp.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-linen/60 rounded-2xl border border-warm-sand/30 p-8"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <Dumbbell className="w-5 h-5 text-muted-clay" />
                            <h2 className="text-xl font-medium text-charcoal tracking-wide">
                              Track These in FitVision
                            </h2>
                          </div>
                          <p className="text-driftwood text-sm font-light mb-4">
                            These exercises from your plan are available for
                            real-time AI tracking in the studio:
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {results.availableInApp.map((ex, i) => (
                              <Link
                                key={i}
                                href={`/tracker?exercise=${encodeURIComponent(ex)}`}
                                className="group px-5 py-2.5 rounded-full bg-parchment text-xs tracking-[0.1em] uppercase font-semibold text-charcoal border border-warm-sand/50 hover:border-terracotta hover:text-terracotta transition-all duration-300 flex items-center gap-2"
                              >
                                {ex}
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}

                    {/* Disclaimer note */}
                    <div className="text-center pt-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-warm-sand">
                        AI-generated suggestions — not a substitute for
                        professional medical advice.{" "}
                        <Link
                          href="/disclaimer"
                          className="text-sage hover:text-terracotta transition-colors"
                        >
                          Read full disclaimer
                        </Link>
                      </p>
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Saved Plans Section */}
      {isSignedIn && (
        <section className="bg-linen/40 py-12 sm:py-16 px-4 sm:px-8">
          <div className="max-w-[52rem] mx-auto">
            <button
              onClick={() => setShowSavedPlans(!showSavedPlans)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-driftwood" />
                <h2 className="text-lg sm:text-xl font-medium text-charcoal tracking-wide">
                  My Saved Plans
                </h2>
                {savedPlans.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-warm-sand/40 text-driftwood text-[10px] tracking-[0.15em] uppercase font-semibold">
                    {savedPlans.length}
                  </span>
                )}
              </div>
              {showSavedPlans ? (
                <ChevronUp className="w-5 h-5 text-driftwood group-hover:text-charcoal transition-colors" />
              ) : (
                <ChevronDown className="w-5 h-5 text-driftwood group-hover:text-charcoal transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {showSavedPlans && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-4">
                    {loadingPlans ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 text-driftwood animate-spin" />
                      </div>
                    ) : savedPlans.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-driftwood text-sm font-light">
                          No saved plans yet. Generate a plan above and save it!
                        </p>
                      </div>
                    ) : (
                      savedPlans.map((plan) => (
                        <motion.div
                          key={plan.id}
                          layout
                          className={`bg-parchment rounded-2xl border p-6 transition-all duration-300 ${
                            plan.is_active
                              ? "border-terracotta/50 shadow-md"
                              : "border-warm-sand/30 hover:border-warm-sand/60"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1">
                                {plan.is_active && (
                                  <Star className="w-4 h-4 text-terracotta fill-terracotta flex-shrink-0" />
                                )}
                                <h3 className="text-base font-semibold text-charcoal tracking-wide truncate">
                                  {plan.name || "Untitled Plan"}
                                </h3>
                              </div>
                              <p className="text-driftwood text-xs font-light line-clamp-2">
                                {plan.summary || "No summary available"}
                              </p>
                              <p className="text-warm-sand text-[10px] tracking-[0.15em] uppercase mt-1.5">
                                {new Date(plan.created_at).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Link
                                href={`/plan-workout?plan_id=${plan.id}`}
                                className="px-4 py-2 rounded-xl text-[10px] tracking-[0.12em] uppercase font-semibold text-parchment bg-terracotta hover:bg-charcoal transition-colors duration-300 flex items-center gap-1.5"
                              >
                                <Dumbbell className="w-3.5 h-3.5" /> Workout
                              </Link>
                              <button
                                onClick={() => handleLoadPlan(plan)}
                                className="px-4 py-2 rounded-xl text-[10px] tracking-[0.12em] uppercase font-semibold text-charcoal border border-warm-sand/40 hover:border-charcoal transition-colors duration-300"
                              >
                                View
                              </button>
                              {!plan.is_active && (
                                <button
                                  onClick={() => handleActivatePlan(plan.id)}
                                  className="px-4 py-2 rounded-xl text-[10px] tracking-[0.12em] uppercase font-semibold text-sage border border-sage/30 hover:bg-sage hover:text-parchment transition-all duration-300"
                                  title="Set as active plan"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="px-3 py-2 rounded-xl text-[10px] text-driftwood border border-warm-sand/30 hover:border-red-300 hover:text-red-400 transition-all duration-300"
                                title="Delete plan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

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
