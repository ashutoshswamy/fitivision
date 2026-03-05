import React, { useState, useRef, useEffect } from "react";
import { ExerciseType, EXERCISES } from "../lib/exercises";
import { ChevronDown } from "lucide-react";

interface SidebarMetricsProps {
  reps: number;
  feedback: string;
  precision?: number;
  exercise: ExerciseType;
  onExerciseChange: (type: ExerciseType) => void;
  planMode?: boolean;
}

export const SidebarMetrics = ({
  reps,
  feedback,
  exercise,
  onExerciseChange,
  planMode = false,
}: SidebarMetricsProps) => {
  const currentExercise = EXERCISES.find((e) => e.type === exercise);
  const targetReps = currentExercise?.targetReps ?? 15;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full md:w-80 h-full bg-charcoal/90 text-parchment rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto border border-driftwood/20">
      {/* Top Section */}
      <div className="space-y-5 sm:space-y-6 md:space-y-8">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-sage uppercase mb-3">
            Exercise
          </h2>
          {planMode ? (
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-parchment/10 text-parchment shadow-md border border-parchment/10">
              {exercise}
            </span>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-parchment/10 text-parchment shadow-md text-sm font-medium tracking-wide transition-all duration-300 hover:bg-parchment/15 border border-parchment/10"
              >
                <span>{exercise}</span>
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-charcoal border border-driftwood/30 shadow-xl">
                  {EXERCISES.map(({ type }) => (
                    <button
                      key={type}
                      onClick={() => {
                        onExerciseChange(type);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium tracking-wide transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                        exercise === type
                          ? "bg-sage/30 text-parchment"
                          : "text-warm-sand hover:bg-parchment/10"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rep Counter */}
        <div className="pt-6 border-t border-driftwood/20">
          <h2 className="text-sm font-semibold tracking-widest text-sage uppercase mb-1">
            Repetitions
          </h2>
          <div className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tighter text-parchment">
            {reps}
            <span className="text-2xl text-warm-sand/50 tracking-normal">
              /{targetReps}
            </span>
          </div>
        </div>

        {/* Muscle Tags */}
        {currentExercise && (
          <div className="pt-4 border-t border-driftwood/20">
            <h2 className="text-xs font-semibold tracking-widest text-sage uppercase mb-2">
              Target Muscles
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {currentExercise.muscles.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-full bg-parchment/8 text-[10px] tracking-widest uppercase text-warm-sand/70 border border-driftwood/15"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section - Feedback */}
      <div className="bg-parchment/8 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-driftwood/20 mt-4 sm:mt-6">
        <h3 className="text-xs font-semibold tracking-widest text-sage uppercase mb-3">
          Live Form Feedback
        </h3>
        <div className="flex items-start gap-4">
          <div className="mt-1 w-2 h-2 rounded-full bg-sage animate-pulse"></div>
          <p className="text-lg font-medium text-parchment/90 leading-snug">
            {feedback}
          </p>
        </div>
      </div>
    </div>
  );
};
