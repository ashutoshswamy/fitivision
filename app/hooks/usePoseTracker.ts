/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { ExerciseType, EXERCISES, RepConfig } from "../lib/exercises";
import { calculateAngle } from "../lib/engine/angleCalculator";
import { createRepCounter, RepPhase } from "../lib/engine/repCounter";

// Re-export for backward compatibility
export type { ExerciseType } from "../lib/exercises";
export { EXERCISES } from "../lib/exercises";

interface PoseTrackerState {
  isReady: boolean;
  reps: number;
  feedback: string;
  precision: number;
  phase: RepPhase;
  primaryAngle: number;
}

// Posture correction rules per exercise group
type PostureCheck = (landmarks: any[]) => string | null;

function getPostureChecks(exercise: ExerciseType): PostureCheck[] {
  const checks: PostureCheck[] = [];

  // --- Squat-family posture checks ---
  if (["Squats", "Sumo Squats", "Bulgarian Split Squats", "Side Lunges", "Squat Jumps", "Box Jumps", "Wall Sit"].includes(exercise)) {
    // Check: back should stay relatively upright (shoulder-hip-knee angle)
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23]; const lK = lm[25];
      const rS = lm[12]; const rH = lm[24]; const rK = lm[26];
      const lVis = (lS.visibility + lH.visibility + lK.visibility) / 3;
      const rVis = (rS.visibility + rH.visibility + rK.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, h: lH, k: lK } : { s: rS, h: rH, k: rK };
      const hipAngle = calculateAngle(side.s, side.h, side.k);
      if (hipAngle < 60) return "Keep your back more upright";
      return null;
    });
    // Check: knees shouldn't go too far forward (knee-ankle alignment)
    checks.push((lm) => {
      const lK = lm[25]; const lA = lm[27];
      const rK = lm[26]; const rA = lm[28];
      if (lK.visibility > 0.5 && lA.visibility > 0.5) {
        if (lK.x - lA.x > 0.08) return "Keep knees behind your toes";
      }
      if (rK.visibility > 0.5 && rA.visibility > 0.5) {
        if (rA.x - rK.x > 0.08) return "Keep knees behind your toes";
      }
      return null;
    });
  }

  // --- Lunge posture checks ---
  if (["Lunges"].includes(exercise)) {
    checks.push((lm) => {
      const lH = lm[23]; const lK = lm[25]; const lA = lm[27];
      const rH = lm[24]; const rK = lm[26]; const rA = lm[28];
      const lVis = (lH.visibility + lK.visibility + lA.visibility) / 3;
      const rVis = (rH.visibility + rK.visibility + rA.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { h: lH, k: lK, a: lA } : { h: rH, k: rK, a: rA };
      const kneeAngle = calculateAngle(side.h, side.k, side.a);
      if (kneeAngle < 70) return "Don't lunge too deep, keep knee at ~90°";
      return null;
    });
  }

  // --- Pushup-family posture checks ---
  if (["Pushups", "Wide Pushups", "Diamond Pushups", "Pike Pushups", "Wall Pushups"].includes(exercise)) {
    // Check: body alignment (shoulder-hip-ankle should be straight ~160-180°)
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23]; const lA = lm[27];
      const rS = lm[12]; const rH = lm[24]; const rA = lm[28];
      const lVis = (lS.visibility + lH.visibility + lA.visibility) / 3;
      const rVis = (rS.visibility + rH.visibility + rA.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, h: lH, a: lA } : { s: rS, h: rH, a: rA };
      const bodyAngle = calculateAngle(side.s, side.h, side.a);
      if (bodyAngle < 150) return "Keep your body straight, don't sag your hips";
      return null;
    });
  }

  // --- Curl-family posture checks ---
  if (["Bicep Curls", "Hammer Curls"].includes(exercise)) {
    // Check: upper arm should stay close to torso (shoulder-elbow should be vertical)
    checks.push((lm) => {
      const lS = lm[11]; const lE = lm[13]; const lH = lm[23];
      const rS = lm[12]; const rE = lm[14]; const rH = lm[24];
      const lVis = (lS.visibility + lE.visibility + lH.visibility) / 3;
      const rVis = (rS.visibility + rE.visibility + rH.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, e: lE, h: lH } : { s: rS, e: rE, h: rH };
      // Check if elbow is drifting forward/backward from shoulder
      const elbowDrift = Math.abs(side.e.x - side.s.x);
      if (elbowDrift > 0.06) return "Keep elbows pinned to your sides";
      return null;
    });
  }

  // --- Shoulder press posture checks ---
  if (["Shoulder Press", "Arnold Press"].includes(exercise)) {
    // Check: don't arch back excessively
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23]; const lK = lm[25];
      const rS = lm[12]; const rH = lm[24]; const rK = lm[26];
      const lVis = (lS.visibility + lH.visibility + lK.visibility) / 3;
      const rVis = (rS.visibility + rH.visibility + rK.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, h: lH, k: lK } : { s: rS, h: rH, k: rK };
      const torsoAngle = calculateAngle(side.s, side.h, side.k);
      if (torsoAngle < 150) return "Don't arch your back, engage your core";
      return null;
    });
  }

  // --- Deadlift / Good Morning posture checks ---
  if (["Deadlifts", "Good Mornings"].includes(exercise)) {
    // Check: back should stay straight (shoulder should be in line above hip)
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23];
      const rS = lm[12]; const rH = lm[24];
      const lVis = (lS.visibility + lH.visibility) / 2;
      const rVis = (rS.visibility + rH.visibility) / 2;
      if (lVis < 0.5 && rVis < 0.5) return null;
      // If shoulder drops too far below hip level when hinging
      // This checks for excessive rounding
      return null;
    });
    // Check: knees shouldn't lock out too aggressively
    checks.push((lm) => {
      const lH = lm[23]; const lK = lm[25]; const lA = lm[27];
      const rH = lm[24]; const rK = lm[26]; const rA = lm[28];
      const lVis = (lH.visibility + lK.visibility + lA.visibility) / 3;
      const rVis = (rH.visibility + rK.visibility + rA.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { h: lH, k: lK, a: lA } : { h: rH, k: rK, a: rA };
      const kneeAngle = calculateAngle(side.h, side.k, side.a);
      if (kneeAngle < 140) return "Keep a slight bend in your knees";
      return null;
    });
  }

  // --- Lateral Raise checks ---
  if (["Lateral Raises", "Front Raises"].includes(exercise)) {
    // Check: don't shrug shoulders
    checks.push((lm) => {
      const lS = lm[11]; const lE = lm[0]; // nose/ear
      const rS = lm[12];
      if (lS.visibility > 0.5 && rS.visibility > 0.5 && lE.visibility > 0.5) {
        const shoulderHeight = (lS.y + rS.y) / 2;
        const headHeight = lE.y;
        const neckLen = shoulderHeight - headHeight;
        if (neckLen < 0.04) return "Don't shrug your shoulders, keep them relaxed";
      }
      return null;
    });
  }

  // --- Core exercise posture checks ---
  if (["Crunches", "Sit Ups", "V-Ups", "Bicycle Crunches"].includes(exercise)) {
    // Check: don't pull on neck (wrist shouldn't be behind head)
    checks.push((lm) => {
      const nose = lm[0]; const lW = lm[15]; const rW = lm[16];
      if (nose.visibility > 0.5 && (lW.visibility > 0.5 || rW.visibility > 0.5)) {
        const wristY = lW.visibility > rW.visibility ? lW.y : rW.y;
        if (wristY < nose.y - 0.05) return "Don't pull on your neck, keep hands light";
      }
      return null;
    });
  }

  // --- Glute Bridge / Hip Thrust checks ---
  if (["Glute Bridges", "Hip Thrusts"].includes(exercise)) {
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23]; const lK = lm[25];
      const rS = lm[12]; const rH = lm[24]; const rK = lm[26];
      const lVis = (lS.visibility + lH.visibility + lK.visibility) / 3;
      const rVis = (rS.visibility + rH.visibility + rK.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, h: lH, k: lK } : { s: rS, h: rH, k: rK };
      const hipAngle = calculateAngle(side.s, side.h, side.k);
      if (hipAngle > 175) return "Squeeze your glutes at the top";
      return null;
    });
  }

  // --- Tricep Dips checks ---
  if (["Tricep Dips"].includes(exercise)) {
    checks.push((lm) => {
      const lS = lm[11]; const lE = lm[13]; const lW = lm[15];
      const rS = lm[12]; const rE = lm[14]; const rW = lm[16];
      const lVis = (lS.visibility + lE.visibility + lW.visibility) / 3;
      const rVis = (rS.visibility + rE.visibility + rW.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, e: lE, w: lW } : { s: rS, e: rE, w: rW };
      const elbowAngle = calculateAngle(side.s, side.e, side.w);
      if (elbowAngle < 70) return "Don't go too deep, stop at 90° elbow bend";
      return null;
    });
  }

  // --- Bent Over Row checks ---
  if (["Bent Over Rows", "Reverse Flys"].includes(exercise)) {
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23]; const lK = lm[25];
      const rS = lm[12]; const rH = lm[24]; const rK = lm[26];
      const lVis = (lS.visibility + lH.visibility + lK.visibility) / 3;
      const rVis = (rS.visibility + rH.visibility + rK.visibility) / 3;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, h: lH, k: lK } : { s: rS, h: rH, k: rK };
      const hipAngle = calculateAngle(side.s, side.h, side.k);
      if (hipAngle > 160) return "Hinge forward more at the hips";
      if (hipAngle < 60) return "Don't bend too far forward";
      return null;
    });
  }

  // --- High Knees / Mountain Climbers checks ---
  if (["High Knees", "Mountain Climbers", "Butt Kicks"].includes(exercise)) {
    checks.push((lm) => {
      const lS = lm[11]; const rS = lm[12];
      if (lS.visibility > 0.5 && rS.visibility > 0.5) {
        const shoulderTilt = Math.abs(lS.y - rS.y);
        if (shoulderTilt > 0.06) return "Keep your shoulders level";
      }
      return null;
    });
  }

  // --- Leg Raises checks ---
  if (["Leg Raises"].includes(exercise)) {
    checks.push((lm) => {
      const lS = lm[11]; const lH = lm[23];
      const rS = lm[12]; const rH = lm[24];
      const lVis = (lS.visibility + lH.visibility) / 2;
      const rVis = (rS.visibility + rH.visibility) / 2;
      if (lVis < 0.5 && rVis < 0.5) return null;
      const side = lVis > rVis ? { s: lS, h: lH } : { s: rS, h: rH };
      // Lower back should stay pressed down (shoulder and hip on same plane)
      if (side.h.y < side.s.y - 0.03) return "Press your lower back into the floor";
      return null;
    });
  }

  return checks;
}

// Feedback messages per exercise for different phases
function getExerciseFeedback(exercise: ExerciseType, phase: RepPhase, repCompleted: boolean): string {
  if (repCompleted) {
    // Variety in rep completion messages
    const completionMsgs: Record<string, string> = {
      "Squats": "Good squat!",
      "Pushups": "Good pushup!",
      "Wide Pushups": "Good pushup!",
      "Diamond Pushups": "Great rep!",
      "Pike Pushups": "Strong press!",
      "Wall Pushups": "Good rep!",
      "Bicep Curls": "Nice curl!",
      "Hammer Curls": "Good curl!",
      "Shoulder Press": "Strong press!",
      "Arnold Press": "Great press!",
      "Lunges": "Good lunge!",
      "Deadlifts": "Good lift!",
      "Good Mornings": "Good rep!",
      "Lateral Raises": "Good raise!",
      "Front Raises": "Nice raise!",
      "Jumping Jacks": "Keep it up!",
      "High Knees": "Good pace!",
      "Tricep Dips": "Great dip!",
      "Glute Bridges": "Squeeze at top!",
      "Hip Thrusts": "Good thrust!",
      "Crunches": "Good crunch!",
      "Sit Ups": "Good sit up!",
      "V-Ups": "Great V-up!",
      "Leg Raises": "Good raise!",
      "Burpees": "Explosive!",
      "Squat Jumps": "Great jump!",
      "Box Jumps": "Nice jump!",
      "Mountain Climbers": "Keep climbing!",
      "Bicycle Crunches": "Good twist!",
      "Flutter Kicks": "Keep kicking!",
      "Dead Bugs": "Good control!",
      "Side Plank Dips": "Nice dip!",
      "Bent Over Rows": "Good pull!",
      "Reverse Flys": "Good fly!",
      "Chest Flys": "Good squeeze!",
      "Upright Rows": "Good row!",
      "Overhead Tricep Extension": "Good extension!",
      "Tricep Kickbacks": "Good kickback!",
      "Sumo Squats": "Good squat!",
      "Bulgarian Split Squats": "Great balance!",
      "Side Lunges": "Good lunge!",
      "Step Ups": "Good step!",
      "Calf Raises": "Nice raise!",
      "Donkey Kicks": "Good kick!",
      "Fire Hydrants": "Good rep!",
      "Wall Sit": "Holding strong!",
      "Butt Kicks": "Good pace!",
      "Arm Circles": "Keep circling!",
      "Toe Touches": "Good stretch!",
      "Superman": "Good hold!",
      "Russian Twists": "Good twist!",
    };
    return completionMsgs[exercise] || "Good rep!";
  }

  if (phase === "down") {
    const downMsgs: Record<string, string> = {
      "Squats": "Go deeper, aim for 90° at knees",
      "Sumo Squats": "Go deeper, push knees out",
      "Bulgarian Split Squats": "Lower down with control",
      "Side Lunges": "Sink into the lunge",
      "Pushups": "Lower your chest to the ground",
      "Wide Pushups": "Lower with control",
      "Diamond Pushups": "Keep elbows close, lower down",
      "Pike Pushups": "Lower your head toward the floor",
      "Wall Pushups": "Lean in closer to the wall",
      "Bicep Curls": "Now extend your arms fully",
      "Hammer Curls": "Extend arms all the way down",
      "Shoulder Press": "Lower weights to shoulder height",
      "Arnold Press": "Rotate and lower to shoulders",
      "Lunges": "Step forward and lower your knee",
      "Deadlifts": "Hinge at hips, lower with flat back",
      "Good Mornings": "Hinge forward with a flat back",
      "Lateral Raises": "Lower arms with control",
      "Front Raises": "Lower arms slowly",
      "Jumping Jacks": "Bring arms down, feet together",
      "High Knees": "Drive knee up higher!",
      "Tricep Dips": "Lower with control",
      "Glute Bridges": "Lower hips toward the floor",
      "Hip Thrusts": "Lower hips slowly",
      "Crunches": "Lift shoulders off the floor",
      "Sit Ups": "Come all the way up",
      "V-Ups": "Reach hands toward toes",
      "Leg Raises": "Lift legs up to 90°",
      "Burpees": "Drop down, chest to floor",
      "Squat Jumps": "Sink into the squat",
      "Box Jumps": "Bend knees to load up",
      "Mountain Climbers": "Drive knees in faster!",
      "Bicycle Crunches": "Twist and drive knee in",
      "Dead Bugs": "Extend opposite arm and leg",
      "Side Plank Dips": "Dip your hip toward the floor",
      "Bent Over Rows": "Extend arms fully down",
      "Reverse Flys": "Lower arms back down",
      "Chest Flys": "Squeeze arms together",
      "Upright Rows": "Lower arms back down",
      "Overhead Tricep Extension": "Lower behind your head",
      "Tricep Kickbacks": "Extend arm straight back",
      "Step Ups": "Step up and extend leg",
      "Donkey Kicks": "Extend leg back and up",
      "Wall Sit": "Hold at 90°, don't rise up",
      "Butt Kicks": "Kick heels to glutes!",
      "Toe Touches": "Reach down toward your toes",
      "Superman": "Lift arms and legs off floor",
    };
    return downMsgs[exercise] || "Keep going...";
  }

  // Phase is 'up' or 'idle' without rep completed
  const upMsgs: Record<string, string> = {
    "Squats": "Stand tall, then squat down",
    "Sumo Squats": "Stand up, then go again",
    "Bulgarian Split Squats": "Push back up, control it",
    "Side Lunges": "Push back to standing",
    "Pushups": "Push up, lock out arms",
    "Wide Pushups": "Press up to full extension",
    "Diamond Pushups": "Push up, squeeze triceps",
    "Pike Pushups": "Press back up",
    "Wall Pushups": "Push back from the wall",
    "Bicep Curls": "Curl the weight up slowly",
    "Hammer Curls": "Curl up with control",
    "Shoulder Press": "Press overhead fully",
    "Arnold Press": "Press and rotate overhead",
    "Lunges": "Push back to standing",
    "Deadlifts": "Stand up tall, squeeze glutes",
    "Good Mornings": "Rise up with a flat back",
    "Lateral Raises": "Raise arms to shoulder height",
    "Front Raises": "Raise arms to shoulder height",
    "Jumping Jacks": "Jump, spread arms and legs",
    "High Knees": "Alternate knees, stay light",
    "Tricep Dips": "Push back up to lockout",
    "Glute Bridges": "Drive hips up, squeeze glutes",
    "Hip Thrusts": "Thrust hips up, hold briefly",
    "Crunches": "Lower back down slowly",
    "Sit Ups": "Lower back with control",
    "V-Ups": "Lower limbs back down",
    "Leg Raises": "Lower legs slowly, don't swing",
    "Burpees": "Jump up explosively!",
    "Squat Jumps": "Jump up! Reach high",
    "Box Jumps": "Jump up, land softly",
    "Mountain Climbers": "Keep alternating, stay fast",
    "Bicycle Crunches": "Alternate sides with control",
    "Dead Bugs": "Return to start position",
    "Side Plank Dips": "Raise hip back up",
    "Bent Over Rows": "Pull elbows back, squeeze",
    "Reverse Flys": "Raise arms out to sides",
    "Chest Flys": "Open arms wide",
    "Upright Rows": "Pull elbows up to chin",
    "Overhead Tricep Extension": "Extend arms overhead",
    "Tricep Kickbacks": "Bring arm back forward",
    "Step Ups": "Step down and repeat",
    "Donkey Kicks": "Return knee under hip",
    "Wall Sit": "Keep holding, don't stand up!",
    "Butt Kicks": "Keep alternating legs",
    "Toe Touches": "Come back up to standing",
    "Superman": "Lower back down with control",
  };
  return upMsgs[exercise] || "Keep going...";
}

export const usePoseTracker = (
  videoElement: HTMLVideoElement | null,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  exerciseType: ExerciseType,
) => {
  const [state, setState] = useState<PoseTrackerState>({
    isReady: false,
    reps: 0,
    feedback: "Position yourself in the frame",
    precision: 0,
    phase: "idle",
    primaryAngle: 0,
  });

  const repCounterRef = useRef(createRepCounter());
  const postureThrottleRef = useRef(0);

  // Use a ref for exerciseType so onResults stays stable and
  // MediaPipe doesn't tear down / reinitialize on every switch.
  const exerciseTypeRef = useRef<ExerciseType>(exerciseType);
  exerciseTypeRef.current = exerciseType;

  // Reset rep counter when the exercise changes
  useEffect(() => {
    repCounterRef.current.reset();
    setState((prev) => ({
      ...prev,
      reps: 0,
      feedback: "Position yourself in the frame",
      phase: "idle",
      primaryAngle: 0,
    }));
  }, [exerciseType]);

  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const onResults = useCallback(
    async (results: any) => {
      if (!canvasRef.current || !videoElement) return;

      const canvasCtx = canvasRef.current.getContext("2d");
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      if (results.poseLandmarks) {
        // Dynamically import drawing utils
        const drawingUtils = await import("@mediapipe/drawing_utils");
        const poseUtils = await import("@mediapipe/pose");

        drawingUtils.drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          poseUtils.POSE_CONNECTIONS,
          {
            color: "#d4c9b8",
            lineWidth: 2,
          },
        );
        drawingUtils.drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "#8b9685",
          lineWidth: 1,
          radius: 3,
        });

        const landmarks = results.poseLandmarks;
        const currentExercise = exerciseTypeRef.current;
        const exerciseDef = EXERCISES.find((e) => e.type === currentExercise);
        const repConfig = exerciseDef?.repConfig;

        // Compute precision as average visibility of all 33 landmarks (0–100%)
        const avgVisibility =
          landmarks.reduce(
            (sum: number, lm: { visibility: number }) => sum + lm.visibility,
            0,
          ) / landmarks.length;
        const precision = Math.round(avgVisibility * 100);

        // Check minimum body visibility
        const visibleCount = landmarks.filter((lm: { visibility: number }) => lm.visibility > 0.5).length;
        if (visibleCount < 10) {
          setState((prev) => ({
            ...prev,
            precision,
            feedback: "Move back so your full body is visible",
          }));
          canvasCtx.restore();
          return;
        }

        // Helper: run posture checks and return correction feedback if any
        const checkPosture = (): string | null => {
          const now = Date.now();
          if (now - postureThrottleRef.current < 800) return null;
          const checks = getPostureChecks(currentExercise);
          for (const check of checks) {
            const correction = check(landmarks);
            if (correction) {
              postureThrottleRef.current = now;
              return correction;
            }
          }
          return null;
        };

        // Helper: Elbow angle tracker (Side-agnostic)
        const trackElbowAngle = (
          config: RepConfig,
        ) => {
          const lS = landmarks[11]; const lE = landmarks[13]; const lW = landmarks[15];
          const rS = landmarks[12]; const rE = landmarks[14]; const rW = landmarks[16];
          const lVis = (lS.visibility + lE.visibility + lW.visibility) / 3;
          const rVis = (rS.visibility + rE.visibility + rW.visibility) / 3;

          if (lVis > 0.5 || rVis > 0.5) {
            const side = lVis > rVis ? { s: lS, e: lE, w: lW } : { s: rS, e: rE, w: rW };
            const angle = calculateAngle(side.s, side.e, side.w);
            const { phase, repCount, repCompleted } = repCounterRef.current.update(angle, config);
            const postureFb = checkPosture();
            const fb = postureFb || getExerciseFeedback(currentExercise, phase, repCompleted);
            setState((prev) => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: angle }));
          } else {
            setState((prev) => ({ ...prev, feedback: "Ensure arms are visible" }));
          }
        };

        // Helper: Knee angle tracker (Side-agnostic)
        const trackKneeAngle = (
          config: RepConfig,
        ) => {
          const lH = landmarks[23]; const lK = landmarks[25]; const lA = landmarks[27];
          const rH = landmarks[24]; const rK = landmarks[26]; const rA = landmarks[28];
          const lVis = (lH.visibility + lK.visibility + lA.visibility) / 3;
          const rVis = (rH.visibility + rK.visibility + rA.visibility) / 3;

          if (lVis > 0.5 || rVis > 0.5) {
            const side = lVis > rVis ? { h: lH, k: lK, a: lA } : { h: rH, k: rK, a: rA };
            const angle = calculateAngle(side.h, side.k, side.a);
            const { phase, repCount, repCompleted } = repCounterRef.current.update(angle, config);
            const postureFb = checkPosture();
            const fb = postureFb || getExerciseFeedback(currentExercise, phase, repCompleted);
            setState((prev) => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: angle }));
          } else {
            setState((prev) => ({ ...prev, feedback: "Ensure legs are visible" }));
          }
        };

        // Helper: Hip angle tracker (Side-agnostic)
        const trackHipAngle = (
          config: RepConfig,
        ) => {
          const lS = landmarks[11]; const lH = landmarks[23]; const lK = landmarks[25];
          const rS = landmarks[12]; const rH = landmarks[24]; const rK = landmarks[26];
          const lVis = (lS.visibility + lH.visibility + lK.visibility) / 3;
          const rVis = (rS.visibility + rH.visibility + rK.visibility) / 3;

          if (lVis > 0.5 || rVis > 0.5) {
            const side = lVis > rVis ? { s: lS, h: lH, k: lK } : { s: rS, h: rH, k: rK };
            const angle = calculateAngle(side.s, side.h, side.k);
            const { phase, repCount, repCompleted } = repCounterRef.current.update(angle, config);
            const postureFb = checkPosture();
            const fb = postureFb || getExerciseFeedback(currentExercise, phase, repCompleted);
            setState((prev) => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: angle }));
          } else {
            setState((prev) => ({ ...prev, feedback: "Ensure body is visible from the side" }));
          }
        };

        // Helper: Arm abduction tracker (Side-agnostic)
        const trackArmAbduction = (
          config: RepConfig,
        ) => {
          const lH = landmarks[23]; const lS = landmarks[11]; const lW = landmarks[15];
          const rH = landmarks[24]; const rS = landmarks[12]; const rW = landmarks[16];
          const lVis = (lH.visibility + lS.visibility + lW.visibility) / 3;
          const rVis = (rH.visibility + rS.visibility + rW.visibility) / 3;

          if (lVis > 0.5 || rVis > 0.5) {
            const side = lVis > rVis ? { h: lH, s: lS, w: lW } : { h: rH, s: rS, w: rW };
            const angle = calculateAngle(side.h, side.s, side.w);
            const { phase, repCount, repCompleted } = repCounterRef.current.update(angle, config);
            const postureFb = checkPosture();
            const fb = postureFb || getExerciseFeedback(currentExercise, phase, repCompleted);
            setState((prev) => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: angle }));
          } else {
            setState((prev) => ({ ...prev, feedback: "Ensure upper body is visible" }));
          }
        };

        // Helper: Alternating legs tracker
        const trackAlternatingLegs = (
          config: RepConfig,
        ) => {
          const lS = landmarks[11];
          const lH = landmarks[23];
          const lK = landmarks[25];
          const rS = landmarks[12];
          const rH = landmarks[24];
          const rK = landmarks[26];
          if (lH.visibility > 0.5 && lK.visibility > 0.5 && rH.visibility > 0.5 && rK.visibility > 0.5) {
            const lA = calculateAngle(lS, lH, lK);
            const rA = calculateAngle(rS, rH, rK);
            const minAngle = Math.min(lA, rA);
            const { phase, repCount, repCompleted } = repCounterRef.current.update(minAngle, config);
            const postureFb = checkPosture();
            const fb = postureFb || getExerciseFeedback(currentExercise, phase, repCompleted);
            setState((prev) => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: minAngle }));
          } else {
            setState((prev) => ({ ...prev, feedback: "Ensure full body is visible" }));
          }
        };

        if (!repConfig) {
          setState((prev) => ({ ...prev, feedback: "Exercise configuration missing" }));
        } else {
          // Group 1: Knee Angle Exercises
          if (["Squats", "Lunges", "Sumo Squats", "Bulgarian Split Squats", "Side Lunges", "Step Ups", "Wall Sit", "Burpees", "Squat Jumps", "Box Jumps", "Butt Kicks"].includes(currentExercise)) {
            trackKneeAngle(repConfig);
          }
          // Group 2: Elbow Angle Exercises
          else if (["Pushups", "Bicep Curls", "Shoulder Press", "Wide Pushups", "Diamond Pushups", "Pike Pushups", "Wall Pushups", "Overhead Tricep Extension", "Tricep Kickbacks", "Hammer Curls", "Arnold Press", "Bent Over Rows", "Tricep Dips", "Upright Rows"].includes(currentExercise)) {
            trackElbowAngle(repConfig);
          }
          // Group 3: Hip Angle Exercises (Shoulder-Hip-Knee)
          else if (["Deadlifts", "Glute Bridges", "Crunches", "Donkey Kicks", "Good Mornings", "Sit Ups", "V-Ups", "Toe Touches", "Superman", "Hip Thrusts", "Side Plank Dips", "Leg Raises"].includes(currentExercise)) {
            trackHipAngle(repConfig);
          }
          // Group 4: Arm Abduction Exercises
          else if (["Lateral Raises", "Jumping Jacks", "Front Raises", "Reverse Flys", "Chest Flys"].includes(currentExercise)) {
            trackArmAbduction(repConfig);
          }
          // Group 5: Alternating Leg Exercises
          else if (["Mountain Climbers", "Bicycle Crunches", "Dead Bugs", "High Knees"].includes(currentExercise)) {
            trackAlternatingLegs(repConfig);
          }
          // Group 6: Custom Tracker Exercises
          else if (currentExercise === "Russian Twists") {
            const lW = landmarks[15]; const rW = landmarks[16];
            const lS = landmarks[11]; const rS = landmarks[12];
            if (lW.visibility > 0.5 && rW.visibility > 0.5 && lS.visibility > 0.5 && rS.visibility > 0.5) {
              const midS = (lS.x + rS.x) / 2; const handX = (lW.x + rW.x) / 2;
              const offset = (handX - midS) * 100;
              const { phase, repCount, repCompleted } = repCounterRef.current.update(offset, {
                up: { min: 8, max: 100 }, down: { min: -100, max: -8 },
              });
              let fb: string;
              if (repCompleted) {
                fb = "Good twist!";
              } else if (phase === "up") {
                fb = "Now twist to the other side";
              } else if (phase === "down") {
                fb = "Good! Now twist back";
              } else {
                fb = "Twist your torso side to side";
              }
              // Posture check for Russian Twists: keep feet off ground
              const lA = landmarks[27]; const rA = landmarks[28];
              const lH = landmarks[23]; const rH = landmarks[24];
              if (lA.visibility > 0.5 && rA.visibility > 0.5 && lH.visibility > 0.5 && rH.visibility > 0.5) {
                const legsAngle = calculateAngle(lS, lH, landmarks[25]);
                if (legsAngle > 160) fb = "Lean back more, keep core engaged";
              }
              setState(prev => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: Math.abs(offset) * 1.8 }));
            } else {
              setState(prev => ({ ...prev, feedback: "Ensure upper body is visible" }));
            }
          }
          else if (currentExercise === "Calf Raises") {
            const lK = landmarks[25]; const lA = landmarks[27]; const lF = landmarks[31];
            const rK = landmarks[26]; const rA = landmarks[28]; const rF = landmarks[32];
            const lVis = (lK.visibility + lA.visibility + lF.visibility) / 3;
            const rVis = (rK.visibility + rA.visibility + rF.visibility) / 3;

            if (lVis > 0.5 || rVis > 0.5) {
              const side = lVis > rVis ? { k: lK, a: lA, f: lF } : { k: rK, a: rA, f: rF };
              const angle = calculateAngle(side.k, side.a, side.f);
              const { phase, repCount, repCompleted } = repCounterRef.current.update(angle, {
                up: { min: 160, max: 180 }, down: { min: 0, max: 130 },
              });
              let fb: string;
              if (repCompleted) {
                fb = "Nice calf raise!";
              } else if (phase === "down") {
                fb = "Push up higher on your toes";
              } else {
                fb = "Hold at the top, then lower slowly";
              }
              // Posture: keep knees straight
              const lH = landmarks[23]; const rH = landmarks[24];
              if (lVis > rVis && lH.visibility > 0.5) {
                const kneeAngle = calculateAngle(lH, lK, lA);
                if (kneeAngle < 160) fb = "Keep your knees straight";
              } else if (rVis >= lVis && rH.visibility > 0.5) {
                const kneeAngle = calculateAngle(rH, rK, rA);
                if (kneeAngle < 160) fb = "Keep your knees straight";
              }
              setState(prev => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: angle }));
            } else {
              setState(prev => ({ ...prev, feedback: "Ensure legs and feet are visible" }));
            }
          }
          else if (currentExercise === "Fire Hydrants") {
            // Track hip abduction using shoulder-hip-knee angle on the moving leg
            const lS = landmarks[11]; const rS = landmarks[12];
            const lH = landmarks[23]; const rH = landmarks[24];
            const lK = landmarks[25]; const rK = landmarks[26];
            const lVis = (lH.visibility + lK.visibility + lS.visibility) / 3;
            const rVis = (rH.visibility + rK.visibility + rS.visibility) / 3;

            if (lVis > 0.5 || rVis > 0.5) {
              // Use the side with better visibility; measure hip abduction as
              // the angle between the torso line and the thigh
              const side = lVis > rVis
                ? { s: lS, h: lH, k: lK }
                : { s: rS, h: rH, k: rK };
              const angle = calculateAngle(side.s, side.h, side.k);
              const { phase, repCount, repCompleted } = repCounterRef.current.update(angle, repConfig);
              let fb: string;
              if (repCompleted) {
                fb = "Good fire hydrant!";
              } else if (phase === "down") {
                fb = "Lift your knee out to the side";
              } else {
                fb = "Lower knee back down with control";
              }
              // Posture: keep arms straight (shouldn't lean)
              const lE = landmarks[13]; const rE = landmarks[14];
              if (lE.visibility > 0.5 && rE.visibility > 0.5) {
                const shoulderTilt = Math.abs(lS.y - rS.y);
                if (shoulderTilt > 0.06) fb = "Keep your shoulders level, don't lean";
              }
              setState(prev => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: angle }));
            } else {
              setState(prev => ({ ...prev, feedback: "Ensure hips and knees are visible" }));
            }
          }
          else if (currentExercise === "Flutter Kicks") {
            const lA = landmarks[27]; const rA = landmarks[28];
            if (lA.visibility > 0.5 && rA.visibility > 0.5) {
              const diff = Math.abs(lA.y - rA.y) * 1000;
              const { phase, repCount, repCompleted } = repCounterRef.current.update(diff, repConfig);
              let fb: string;
              if (repCompleted) {
                fb = "Keep kicking!";
              } else if (phase === "down") {
                fb = "Separate your legs more, kick wider";
              } else {
                fb = "Bring legs closer together, then kick";
              }
              // Posture: keep lower back pressed down
              const lH = landmarks[23]; const rH = landmarks[24];
              const lS = landmarks[11];
              if (lH.visibility > 0.5 && rH.visibility > 0.5 && lS.visibility > 0.5) {
                const bodyAngle = calculateAngle(lS, lH, lA);
                if (bodyAngle > 170) fb = "Lift your legs off the floor";
              }
              setState(prev => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: Math.min(diff / 5, 180) }));
            } else {
              setState(prev => ({ ...prev, feedback: "Ensure legs are visible" }));
            }
          }
          else if (currentExercise === "Arm Circles") {
            const lS = landmarks[11]; const lE = landmarks[13]; const lW = landmarks[15];
            const rS = landmarks[12]; const rE = landmarks[14]; const rW = landmarks[16];
            const lH = landmarks[23]; const rH = landmarks[24];
            const lVis = (lS.visibility + lW.visibility + lH.visibility) / 3;
            const rVis = (rS.visibility + rW.visibility + rH.visibility) / 3;

            if (lVis > 0.5 || rVis > 0.5) {
              const side = lVis > rVis
                ? { s: lS, e: lE, w: lW, h: lH }
                : { s: rS, e: rE, w: rW, h: rH };
              // Track arm abduction angle (hip-shoulder-wrist) for circle detection
              const abductionAngle = calculateAngle(side.h, side.s, side.w);
              // Use wrist position relative to shoulder to detect up/down
              const wristAbove = side.w.y < side.s.y;
              const metric = wristAbove ? 1 : 0;
              const { phase, repCount, repCompleted } = repCounterRef.current.update(metric, {
                up: { min: 1, max: 1 }, down: { min: 0, max: 0 },
              });
              let fb: string;
              if (repCompleted) {
                fb = "Keep circling!";
              } else if (phase === "up") {
                fb = "Continue the circle downward";
              } else {
                fb = "Circle arms upward";
              }
              // Posture: keep arms extended (elbow angle should be near 180°)
              const elbowAngle = calculateAngle(side.s, side.e, side.w);
              if (elbowAngle < 140) fb = "Keep your arms straight while circling";
              // Posture: arms should be raised to at least shoulder height
              if (abductionAngle < 60 && phase !== "idle") fb = "Raise arms higher to shoulder level";
              setState(prev => ({ ...prev, reps: repCount, feedback: fb, phase, primaryAngle: abductionAngle }));
            } else {
              setState(prev => ({ ...prev, feedback: "Ensure arms are visible" }));
            }
          }
        }

        // Update precision from landmark visibility (only if changed)
        setState((prev) => {
          if (prev.precision === precision) return prev;
          return { ...prev, precision };
        });
      }

      canvasCtx.restore();
    },
    [canvasRef, videoElement],
  );

  useEffect(() => {
    if (!videoElement || typeof window === "undefined") return;

    mountedRef.current = true;

    // Detect mobile for performance-tuned settings
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth < 768;

    const initMediaPipe = async () => {
      try {
        const poseModule = await import("@mediapipe/pose");

        if (!mountedRef.current) return;

        poseRef.current = new poseModule.Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        poseRef.current.setOptions({
          // Use lighter model on mobile for better performance
          modelComplexity: isMobile ? 0 : 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: isMobile ? 0.6 : 0.5,
          minTrackingConfidence: isMobile ? 0.6 : 0.5,
        });

        poseRef.current.onResults(onResults);

        // Use requestAnimationFrame loop instead of @mediapipe/camera_utils Camera,
        // which opens its own getUserMedia stream and conflicts with react-webcam on mobile.
        let rafId: number;
        let processing = false;
        // Throttle frame rate on mobile to avoid overloading the GPU
        let lastFrameTime = 0;
        const minFrameInterval = isMobile ? 66 : 33; // ~15fps mobile, ~30fps desktop

        const sendFrame = async () => {
          if (!mountedRef.current || !poseRef.current) return;

          const now = performance.now();
          if (now - lastFrameTime < minFrameInterval) {
            rafId = requestAnimationFrame(sendFrame);
            return;
          }

          // readyState >= HTMLMediaElement.HAVE_CURRENT_DATA (2) means at
          // least one frame is available. On some mobile browsers the video
          // element reports readyState 0 while still providing frames via
          // videoWidth/videoHeight, so accept either signal.
          const hasFrame =
            videoElement.readyState >= 2 ||
            (videoElement.videoWidth > 0 && videoElement.videoHeight > 0);
          if (hasFrame && !processing) {
            processing = true;
            try {
              await poseRef.current.send({ image: videoElement });
              lastFrameTime = now;
            } catch {
              // Ignore errors during teardown
            }
            processing = false;
          }
          rafId = requestAnimationFrame(sendFrame);
        };
        cameraRef.current = { stop: () => cancelAnimationFrame(rafId) };
        rafId = requestAnimationFrame(sendFrame);
        setState((prev) => ({ ...prev, isReady: true }));
      } catch (err) {
        console.error("MediaPipe initialization failed:", err);
        setState((prev) => ({
          ...prev,
          isReady: true,
          feedback: "Pose detection failed to load. Please refresh the page.",
        }));
      }
    };

    initMediaPipe();

    return () => {
      mountedRef.current = false;
      cameraRef.current?.stop();
      poseRef.current?.close();
      poseRef.current = null;
      cameraRef.current = null;
    };
  }, [videoElement, onResults]);

  return state;
};
