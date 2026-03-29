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
  Loader2,
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
  BookOpen,
  UtensilsCrossed,
  ShoppingCart,
  Clock,
  Flame,
} from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";

interface Meal {
  type: string;
  name: string;
  prepTime: string;
  calories: string;
  protein: string;
  ingredients: string[];
  instructions: string;
  mealPrepTip?: string;
}

interface DayMealPlan {
  day: string;
  theme: string;
  meals: Meal[];
  dailyTotal: {
    calories: string;
    protein: string;
  };
}

interface GroceryCategory {
  category: string;
  items: string[];
}

interface MealPlanResponse {
  summary: string;
  dailyTargets: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  weeklyPlan: DayMealPlan[];
  groceryList: GroceryCategory[];
  mealPrepSchedule: {
    sunday: string[];
    midweek: string[];
  };
  tips: string[];
  cautions: string[];
  raw?: string;
  error?: string;
}

const activityLevels = [
  "Sedentary",
  "Lightly Active",
  "Moderately Active",
  "Very Active",
  "Athlete",
];

const dietaryGoalOptions = [
  "Weight Loss",
  "Muscle Gain",
  "Maintenance",
  "Clean Eating",
  "High Protein",
  "Low Carb",
  "Heart Health",
  "Energy Boost",
];

const restrictionOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
  "Low Sodium",
];

const cuisineOptions = [
  "Mediterranean",
  "Asian",
  "Indian",
  "Mexican",
  "American",
  "Italian",
  "Middle Eastern",
  "Japanese",
];

const cookingSkillLevels = ["Beginner", "Intermediate", "Advanced"];
const budgetOptions = ["Budget-Friendly", "Moderate", "No Limit"];
const mealsPerDayOptions = ["2", "3", "4", "5"];
const prepTimeOptions = ["15 min", "30 min", "45 min", "60+ min"];

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function MealPrepPage() {
  const { isSignedIn } = useUser();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    dietaryGoals: [] as string[],
    dietaryRestrictions: [] as string[],
    allergies: "",
    cuisinePreferences: [] as string[],
    mealsPerDay: "3",
    budget: "",
    cookingSkill: "",
    prepTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MealPlanResponse | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "results">("form");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [planName, setPlanName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);

  interface SavedPlan {
    id: string;
    name: string;
    summary: string | null;
    is_active: boolean;
    created_at: string;
    plan_data: MealPlanResponse;
    form_data: Record<string, unknown>;
  }

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/plans?plan_type=meal");
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
          name: planName || `Meal Plan — ${new Date().toLocaleDateString()}`,
          plan_type: "meal",
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

  const handleLoadPlan = (plan: SavedPlan) => {
    setResults(plan.plan_data);
    setStep("results");
    setPlanSaved(true);
    setShowSavedPlans(false);
  };

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryGoals: prev.dietaryGoals.includes(goal)
        ? prev.dietaryGoals.filter((g) => g !== goal)
        : [...prev.dietaryGoals, goal],
    }));
  };

  const handleRestrictionToggle = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter((r) => r !== restriction)
        : [...prev.dietaryRestrictions, restriction],
    }));
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
        ? prev.cuisinePreferences.filter((c) => c !== cuisine)
        : [...prev.cuisinePreferences, cuisine],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meal-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dietaryGoals: formData.dietaryGoals.join(", "),
          dietaryRestrictions: formData.dietaryRestrictions.join(", "),
          cuisinePreferences: formData.cuisinePreferences.join(", "),
        }),
      });
      const data = await res.json();
      setResults(data);
      setStep("results");
    } catch {
      setResults({
        error: "Failed to generate meal plan. Please try again.",
      } as MealPlanResponse);
      setStep("results");
    } finally {
      setLoading(false);
    }
  };

  const toggleMealExpand = (dayIndex: number, mealIndex: number) => {
    const key = `${dayIndex}-${mealIndex}`;
    setExpandedMeal(expandedMeal === key ? null : key);
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
              href={isSignedIn ? "/dashboard" : "/sign-in"}
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Dashboard
            </Link>
            <Link
              href="/suggestions"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Workout Plan
            </Link>
            <Link
              href="/meal-prep"
              className="text-terracotta font-semibold"
            >
              Meal Prep
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
                  href={isSignedIn ? "/dashboard" : "/sign-in"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="/suggestions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Workout Plan
                </Link>
                <Link
                  href="/meal-prep"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-terracotta font-semibold py-1"
                >
                  Meal Prep
                </Link>
                <div className="pt-2 border-t border-warm-sand/30">
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
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>AI-Powered Nutrition</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-charcoal leading-[1] mb-4 sm:mb-6"
          >
            Personalized{" "}
            <span className="font-medium text-muted-clay italic">
              meal prep plan.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-driftwood font-light max-w-xl leading-relaxed"
          >
            Share your dietary needs and preferences. Our AI will craft a
            tailored weekly meal prep plan with recipes, grocery lists, and
            nutrition info.
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

                  {/* Activity Level */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        2
                      </span>
                      Activity Level
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {activityLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            setFormData({ ...formData, activityLevel: level })
                          }
                          className={`px-5 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase font-semibold border transition-all duration-300 ${
                            formData.activityLevel === level
                              ? "bg-terracotta text-parchment border-terracotta"
                              : "bg-parchment text-driftwood border-warm-sand/50 hover:border-terracotta/50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Goals */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        3
                      </span>
                      Dietary Goals
                      <span className="text-[10px] text-warm-sand font-normal tracking-wider">
                        (select multiple)
                      </span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {dietaryGoalOptions.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => handleGoalToggle(goal)}
                          className={`px-5 py-2.5 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                            formData.dietaryGoals.includes(goal)
                              ? "bg-sage text-parchment border-sage"
                              : "bg-parchment text-driftwood border-warm-sand/50 hover:border-sage/50"
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        4
                      </span>
                      Dietary Restrictions
                      <span className="text-[10px] text-warm-sand font-normal tracking-wider">
                        (if any)
                      </span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {restrictionOptions.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRestrictionToggle(r)}
                          className={`px-5 py-2.5 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                            formData.dietaryRestrictions.includes(r)
                              ? "bg-charcoal text-parchment border-charcoal"
                              : "bg-parchment text-driftwood border-warm-sand/50 hover:border-charcoal/30"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine Preferences */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        5
                      </span>
                      Cuisine Preferences
                      <span className="text-[10px] text-warm-sand font-normal tracking-wider">
                        (optional)
                      </span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {cuisineOptions.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleCuisineToggle(c)}
                          className={`px-5 py-2.5 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                            formData.cuisinePreferences.includes(c)
                              ? "bg-driftwood text-parchment border-driftwood"
                              : "bg-parchment text-driftwood border-warm-sand/50 hover:border-driftwood/50"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Practical Details */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        6
                      </span>
                      Practical Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Cooking Skill
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {cookingSkillLevels.map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setFormData({ ...formData, cookingSkill: s })
                              }
                              className={`px-4 py-2 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                                formData.cookingSkill === s
                                  ? "bg-terracotta text-parchment border-terracotta"
                                  : "bg-parchment text-driftwood border-warm-sand/50 hover:border-terracotta/50"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Budget
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {budgetOptions.map((b) => (
                            <button
                              key={b}
                              onClick={() =>
                                setFormData({ ...formData, budget: b })
                              }
                              className={`px-4 py-2 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                                formData.budget === b
                                  ? "bg-sage text-parchment border-sage"
                                  : "bg-parchment text-driftwood border-warm-sand/50 hover:border-sage/50"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Meals Per Day
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {mealsPerDayOptions.map((m) => (
                            <button
                              key={m}
                              onClick={() =>
                                setFormData({ ...formData, mealsPerDay: m })
                              }
                              className={`px-4 py-2 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                                formData.mealsPerDay === m
                                  ? "bg-terracotta text-parchment border-terracotta"
                                  : "bg-parchment text-driftwood border-warm-sand/50 hover:border-terracotta/50"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                          Max Prep Time Per Meal
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {prepTimeOptions.map((t) => (
                            <button
                              key={t}
                              onClick={() =>
                                setFormData({ ...formData, prepTime: t })
                              }
                              className={`px-4 py-2 rounded-full text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                                formData.prepTime === t
                                  ? "bg-terracotta text-parchment border-terracotta"
                                  : "bg-parchment text-driftwood border-warm-sand/50 hover:border-terracotta/50"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <h2 className="text-lg font-medium text-charcoal tracking-wide mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-semibold">
                        7
                      </span>
                      Allergies & Additional Notes
                    </h2>
                    <textarea
                      placeholder="e.g., Peanut allergy, lactose intolerant, prefer high-fiber foods..."
                      value={formData.allergies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allergies: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full bg-parchment border border-warm-sand/40 text-charcoal rounded-xl px-4 py-3 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 outline-none transition-all duration-300 placeholder:text-warm-sand text-sm resize-none"
                    />
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
                            Crafting Your Plan...
                          </span>
                        </span>
                      ) : (
                        <>
                          <span className="relative z-10 tracking-[0.15em] uppercase text-xs font-semibold flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4" />
                            Generate Meal Plan
                          </span>
                          <span className="relative z-10 w-8 h-8 rounded-full bg-parchment/20 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-2">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-warm-sand tracking-wider">
                      Results are AI-generated and not medical/dietary advice
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
                        placeholder="Name your plan (e.g., 'Clean Eating Week')"
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
                          Your Personalized Meal Plan
                        </h2>
                      </div>
                      <p className="text-driftwood font-light leading-relaxed mb-6">
                        {results.summary}
                      </p>

                      {/* Daily Targets */}
                      {results.dailyTargets && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20 text-center">
                            <Flame className="w-4 h-4 text-terracotta mx-auto mb-1" />
                            <p className="text-lg font-medium text-charcoal">
                              {results.dailyTargets.calories}
                            </p>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-driftwood">
                              Calories
                            </p>
                          </div>
                          <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20 text-center">
                            <p className="text-lg font-medium text-charcoal">
                              {results.dailyTargets.protein}
                            </p>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-driftwood">
                              Protein
                            </p>
                          </div>
                          <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20 text-center">
                            <p className="text-lg font-medium text-charcoal">
                              {results.dailyTargets.carbs}
                            </p>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-driftwood">
                              Carbs
                            </p>
                          </div>
                          <div className="bg-parchment rounded-xl p-4 border border-warm-sand/20 text-center">
                            <p className="text-lg font-medium text-charcoal">
                              {results.dailyTargets.fats}
                            </p>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-driftwood">
                              Fats
                            </p>
                          </div>
                        </div>
                      )}
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
                          Weekly Meal Schedule
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
                                {day.theme}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              {day.dailyTotal && (
                                <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-driftwood">
                                  {day.dailyTotal.calories} cal ·{" "}
                                  {day.dailyTotal.protein} protein
                                </span>
                              )}
                              {expandedDay === i ? (
                                <ChevronUp className="w-4 h-4 text-driftwood" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-driftwood" />
                              )}
                            </div>
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
                                <div className="px-6 pb-6 space-y-4">
                                  {day.meals?.map((meal, j) => (
                                    <div
                                      key={j}
                                      className="bg-parchment rounded-xl border border-warm-sand/20 overflow-hidden"
                                    >
                                      <button
                                        onClick={() =>
                                          toggleMealExpand(i, j)
                                        }
                                        className="w-full flex items-center justify-between p-4 hover:bg-warm-sand/5 transition-colors duration-200"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="text-[10px] tracking-[0.15em] uppercase text-terracotta font-semibold shrink-0">
                                            {meal.type}
                                          </span>
                                          <span className="text-charcoal font-medium text-sm truncate">
                                            {meal.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono tracking-widest text-driftwood">
                                            <Clock className="w-3 h-3" />
                                            {meal.prepTime}
                                          </span>
                                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono tracking-widest text-sage">
                                            <Flame className="w-3 h-3" />
                                            {meal.calories} cal
                                          </span>
                                          {expandedMeal ===
                                          `${i}-${j}` ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-driftwood" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-driftwood" />
                                          )}
                                        </div>
                                      </button>

                                      <AnimatePresence>
                                        {expandedMeal ===
                                          `${i}-${j}` && (
                                          <motion.div
                                            initial={{
                                              height: 0,
                                              opacity: 0,
                                            }}
                                            animate={{
                                              height: "auto",
                                              opacity: 1,
                                            }}
                                            exit={{
                                              height: 0,
                                              opacity: 0,
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="px-4 pb-4 space-y-3 border-t border-warm-sand/20 pt-3">
                                              {/* Mobile meta */}
                                              <div className="flex items-center gap-4 sm:hidden text-[10px] font-mono tracking-widest text-driftwood">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  {meal.prepTime}
                                                </span>
                                                <span className="flex items-center gap-1 text-sage">
                                                  <Flame className="w-3 h-3" />
                                                  {meal.calories} cal
                                                </span>
                                                {meal.protein && (
                                                  <span>
                                                    {meal.protein} protein
                                                  </span>
                                                )}
                                              </div>

                                              {/* Ingredients */}
                                              {meal.ingredients &&
                                                meal.ingredients.length >
                                                  0 && (
                                                  <div>
                                                    <p className="text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                                                      Ingredients
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                      {meal.ingredients.map(
                                                        (ing, k) => (
                                                          <span
                                                            key={k}
                                                            className="px-3 py-1.5 rounded-lg bg-linen/80 text-xs text-charcoal border border-warm-sand/20"
                                                          >
                                                            {ing}
                                                          </span>
                                                        ),
                                                      )}
                                                    </div>
                                                  </div>
                                                )}

                                              {/* Instructions */}
                                              {meal.instructions && (
                                                <div>
                                                  <p className="text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-2">
                                                    Instructions
                                                  </p>
                                                  <p className="text-sm text-charcoal font-light leading-relaxed">
                                                    {meal.instructions}
                                                  </p>
                                                </div>
                                              )}

                                              {/* Meal Prep Tip */}
                                              {meal.mealPrepTip && (
                                                <div className="bg-sage/5 rounded-lg p-3 border border-sage/15">
                                                  <p className="text-[10px] tracking-[0.15em] uppercase text-sage font-semibold mb-1">
                                                    Prep Tip
                                                  </p>
                                                  <p className="text-xs text-driftwood font-light">
                                                    {meal.mealPrepTip}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Grocery List */}
                    {results.groceryList &&
                      results.groceryList.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="bg-linen/60 rounded-2xl border border-warm-sand/30 overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setShowGroceryList(!showGroceryList)
                            }
                            className="w-full flex items-center justify-between p-8 hover:bg-warm-sand/10 transition-colors duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <ShoppingCart className="w-5 h-5 text-driftwood" />
                              <h2 className="text-xl font-medium text-charcoal tracking-wide">
                                Weekly Grocery List
                              </h2>
                            </div>
                            {showGroceryList ? (
                              <ChevronUp className="w-5 h-5 text-driftwood" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-driftwood" />
                            )}
                          </button>

                          <AnimatePresence>
                            {showGroceryList && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {results.groceryList.map((cat, i) => (
                                    <div key={i}>
                                      <h3 className="text-[10px] tracking-[0.2em] uppercase text-terracotta font-semibold mb-3">
                                        {cat.category}
                                      </h3>
                                      <ul className="space-y-1.5">
                                        {cat.items.map((item, j) => (
                                          <li
                                            key={j}
                                            className="flex items-start gap-2 text-xs text-charcoal font-light"
                                          >
                                            <span className="w-1.5 h-1.5 rounded-full bg-warm-sand mt-1.5 shrink-0" />
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                    {/* Meal Prep Schedule */}
                    {results.mealPrepSchedule && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-driftwood/5 rounded-2xl border border-driftwood/15 p-8"
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <Clock className="w-5 h-5 text-driftwood" />
                          <h2 className="text-xl font-medium text-charcoal tracking-wide">
                            Prep Schedule
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {results.mealPrepSchedule.sunday &&
                            results.mealPrepSchedule.sunday.length > 0 && (
                              <div>
                                <h3 className="text-[10px] tracking-[0.2em] uppercase text-terracotta font-semibold mb-3">
                                  Sunday Prep
                                </h3>
                                <ul className="space-y-2">
                                  {results.mealPrepSchedule.sunday.map(
                                    (task, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-driftwood font-light leading-relaxed"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                                        {task}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          {results.mealPrepSchedule.midweek &&
                            results.mealPrepSchedule.midweek.length > 0 && (
                              <div>
                                <h3 className="text-[10px] tracking-[0.2em] uppercase text-driftwood font-semibold mb-3">
                                  Mid-Week Refresh
                                </h3>
                                <ul className="space-y-2">
                                  {results.mealPrepSchedule.midweek.map(
                                    (task, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-driftwood font-light leading-relaxed"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-driftwood mt-2 shrink-0" />
                                        {task}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </motion.div>
                    )}

                    {/* Tips */}
                    {results.tips && results.tips.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-sage/5 rounded-2xl border border-sage/20 p-8"
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <Lightbulb className="w-5 h-5 text-sage" />
                          <h2 className="text-xl font-medium text-charcoal tracking-wide">
                            Nutrition Tips
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
                            Dietary Cautions
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

                    {/* Disclaimer */}
                    <div className="text-center pt-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-warm-sand">
                        AI-generated meal plan — not a substitute for
                        professional dietary advice.{" "}
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
                  My Saved Meal Plans
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
                          No saved meal plans yet. Generate a plan above and
                          save it!
                        </p>
                      </div>
                    ) : (
                      savedPlans.map((plan) => (
                        <motion.div
                          key={plan.id}
                          layout
                          className="bg-parchment rounded-2xl border border-warm-sand/30 hover:border-warm-sand/60 p-6 transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-charcoal tracking-wide truncate">
                                {plan.name || "Untitled Plan"}
                              </h3>
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
                              <button
                                onClick={() => handleLoadPlan(plan)}
                                className="px-4 py-2 rounded-xl text-[10px] tracking-[0.12em] uppercase font-semibold text-parchment bg-terracotta hover:bg-charcoal transition-colors duration-300 flex items-center gap-1.5"
                              >
                                <UtensilsCrossed className="w-3.5 h-3.5" />{" "}
                                View
                              </button>
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
