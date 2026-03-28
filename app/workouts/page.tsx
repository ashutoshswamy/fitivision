"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EXERCISES } from "../lib/exercises";
import { ArrowRight, LogIn, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";

const DifficultyBadge = ({
  level,
}: {
  level: "Beginner" | "Intermediate" | "Advanced";
}) => {
  const colors = {
    Beginner: "bg-sage/15 text-sage",
    Intermediate: "bg-terracotta/15 text-terracotta",
    Advanced: "bg-muted-clay/15 text-muted-clay",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold ${colors[level]}`}
    >
      {level}
    </span>
  );
};

export default function WorkoutsPage() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <section className="pt-28 sm:pt-32 pb-10 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-[75rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 text-[10px] text-sage tracking-[0.3em] font-semibold uppercase mb-4 sm:mb-6"
          >
            <span className="w-8 h-px bg-sage"></span>
            <span>Real-Time Pose Tracking</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-charcoal leading-[1] mb-4 sm:mb-6"
          >
            Available{" "}
            <span className="font-medium text-muted-clay italic">
              workouts.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-driftwood font-light max-w-lg leading-relaxed"
          >
            Each exercise is tracked in real-time using 33 body landmarks. Only
            movements with reliable joint-angle detection are included.
          </motion.p>
        </div>
      </section>

      {/* Workout Grid */}
      <section className="pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-[75rem] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {EXERCISES.map((exercise, i) => (
              <motion.div
                key={exercise.type}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              >
                <Link
                  href={`/tracker?exercise=${encodeURIComponent(exercise.type)}`}
                  className="group block bg-linen rounded-2xl p-5 sm:p-8 border border-warm-sand/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <DifficultyBadge level={exercise.difficulty} />
                    <span className="text-[10px] text-warm-sand tracking-widest uppercase font-mono">
                      {exercise.targetReps} reps
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-medium text-charcoal tracking-wide mb-2 sm:mb-3 group-hover:text-terracotta transition-colors duration-300">
                    {exercise.type}
                  </h3>

                  <p className="text-sm text-driftwood font-light leading-relaxed mb-6">
                    {exercise.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {exercise.muscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="px-3 py-1 rounded-full bg-parchment text-[10px] tracking-widest uppercase text-driftwood border border-warm-sand/50"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-terracotta tracking-[0.15em] uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Start tracking</span>
                    <ArrowRight />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-parchment py-10 sm:py-16 px-4 sm:px-8 border-t border-warm-sand/50"
      >
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
      </motion.footer>
    </div>
  );
}
