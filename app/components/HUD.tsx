"use client";

import { ExerciseType, EXERCISES } from "../lib/exercises";

interface RomArcProps {
  angle: number;
  minAngle: number;
  maxAngle: number;
}

export function RomArc({ angle, minAngle, maxAngle }: RomArcProps) {
  const range = maxAngle - minAngle;
  // Prevent division by zero and ensure angle is clamped within bounds
  const clampedAngle = Math.max(minAngle, Math.min(maxAngle, angle || minAngle));
  // If min == max, progress is 1 to avoid NaN
  const progress = range > 0 ? (clampedAngle - minAngle) / range : 1; 

  const r = 30;
  const circ = 2 * Math.PI * r;
  const dashOff = circ * (1 - progress);

  // Success green > 70%, Warning yellow > 40%, Error red otherwise
  const color = progress > 0.7 ? "#7d9b76" : progress > 0.4 ? "#c9a857" : "#bd8965";

  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="flex-shrink-0">
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={isNaN(dashOff) ? circ : dashOff}
        transform="rotate(-90 38 38)"
        className="transition-all duration-200 ease-out"
        style={{ opacity: 0.8 }}
      />
      <text
        x="38"
        y="42"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="500"
        fontFamily="inherit"
      >
        {Math.round(angle || 0)}°
      </text>
    </svg>
  );
}

interface HUDProps {
  exerciseType: ExerciseType;
  primaryAngle: number;
  phase: "idle" | "up" | "down";
  repCount: number;
  phaseConfig?: {
    up: { min: number; max: number };
    down: { min: number; max: number };
  };
}

export function HUD({
  exerciseType,
  primaryAngle,
  phase,
  repCount,
  phaseConfig,
}: HUDProps) {
  const exercise = EXERCISES.find((e) => e.type === exerciseType);
  const pulseKey = repCount;

  if (!exercise) return null;

  const isDown = phase === "down";

  // Use passed config, or fallback to sensible defaults based on typical extension/flexion
  // (In full implementation, EXERCISES should hold these min/max bounds)
  const minAngle = phaseConfig
    ? isDown
      ? phaseConfig.down.min
      : phaseConfig.up.min
    : 40;
  const maxAngle = phaseConfig
    ? isDown
      ? phaseConfig.down.max
      : phaseConfig.up.max
    : 180;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Exercise label — Top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div className="bg-charcoal/60 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-4 shadow-2xl">
          <div
            className={`w-2 h-2 rounded-full ${phase === "idle" ? "bg-warm-sand/50" : "bg-sage animate-pulse"}`}
          />
          <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide">
            {exercise.type}
          </span>
          <span className="text-[10px] text-warm-sand/70 tracking-widest uppercase self-end mb-1.5 ml-2">
            {phase === "idle" ? "READY" : phase}
          </span>
        </div>
      </div>

      {/* Rep counter & Arc — Bottom left */}
      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
        <div className="bg-charcoal/60 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-5 shadow-2xl">
          <div className="text-center min-w-[60px]">
            <div
              key={pulseKey}
              className="font-serif text-5xl sm:text-6xl font-semibold text-white animate-pulse"
              style={{ lineHeight: 1 }}
            >
              {repCount}
            </div>
            <div className="text-[9px] text-warm-sand/60 font-medium uppercase tracking-[0.2em] mt-2">
              reps
            </div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <RomArc angle={primaryAngle} minAngle={minAngle} maxAngle={maxAngle} />
        </div>
      </div>
    </div>
  );
}
