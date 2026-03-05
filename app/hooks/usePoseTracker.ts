/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { ExerciseType } from "../lib/exercises";

// Re-export for backward compatibility
export type { ExerciseType } from "../lib/exercises";
export { EXERCISES } from "../lib/exercises";

interface PoseTrackerState {
  isReady: boolean;
  reps: number;
  feedback: string;
  precision: number;
}

const calculateAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
) => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

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
  });

  const repStateRef = useRef({
    stage: "up", // 'up' or 'down'
    count: 0,
  });

  // Use a ref for exerciseType so onResults stays stable and
  // MediaPipe doesn't tear down / reinitialize on every switch.
  const exerciseTypeRef = useRef<ExerciseType>(exerciseType);
  exerciseTypeRef.current = exerciseType;

  // Reset rep counter when the exercise changes
  useEffect(() => {
    repStateRef.current = { stage: "up", count: 0 };
    setState((prev) => ({
      ...prev,
      reps: 0,
      feedback: "Position yourself in the frame",
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

        // Compute precision as average visibility of all 33 landmarks (0–100%)
        const avgVisibility =
          landmarks.reduce(
            (sum: number, lm: { visibility: number }) => sum + lm.visibility,
            0,
          ) / landmarks.length;
        const precision = Math.round(avgVisibility * 100);

        if (currentExercise === "Squats") {
          const hip = landmarks[24]; // Right hip
          const knee = landmarks[26]; // Right knee
          const ankle = landmarks[28]; // Right ankle

          if (
            hip.visibility > 0.5 &&
            knee.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, knee, ankle);
            let currentFeedback = "Keep going";

            if (angle > 160) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              }
            }
            if (angle < 90) {
              repStateRef.current.stage = "down";
              currentFeedback = "Drive up!";
            } else if (angle < 120 && repStateRef.current.stage === "up") {
              currentFeedback = "Lower...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure full body is visible",
            }));
          }
        }

        if (currentExercise === "Pushups") {
          const shoulder = landmarks[12]; // Right shoulder
          const elbow = landmarks[14]; // Right elbow
          const wrist = landmarks[16]; // Right wrist

          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, elbow, wrist);
            let currentFeedback = "Keep going";

            if (angle > 160) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              }
            }
            if (angle < 90) {
              repStateRef.current.stage = "down";
              currentFeedback = "Push up!";
            } else if (angle < 120 && repStateRef.current.stage === "up") {
              currentFeedback = "Go deeper...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }

        if (currentExercise === "Bicep Curls") {
          const shoulder = landmarks[12]; // Right shoulder
          const elbow = landmarks[14]; // Right elbow
          const wrist = landmarks[16]; // Right wrist

          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, elbow, wrist);
            let currentFeedback = "Keep going";

            if (angle > 150) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              } else {
                currentFeedback = "Curl up...";
              }
            }
            if (angle < 50) {
              repStateRef.current.stage = "down";
              currentFeedback = "Squeeze! Now lower slowly.";
            } else if (angle < 90 && repStateRef.current.stage === "up") {
              currentFeedback = "Curl higher...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure arm is visible",
            }));
          }
        }

        if (currentExercise === "Shoulder Press") {
          const hip = landmarks[24]; // Right hip
          const shoulder = landmarks[12]; // Right shoulder
          const elbow = landmarks[14]; // Right elbow
          const wrist = landmarks[16]; // Right wrist

          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            wrist.visibility > 0.5 &&
            hip.visibility > 0.5
          ) {
            const elbowAngle = calculateAngle(shoulder, elbow, wrist);
            let currentFeedback = "Keep going";

            if (elbowAngle > 160) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Locked out! Good rep.";
              }
            }
            if (elbowAngle < 90) {
              repStateRef.current.stage = "down";
              currentFeedback = "Press up!";
            } else if (elbowAngle < 120 && repStateRef.current.stage === "up") {
              currentFeedback = "Lower to shoulders...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }

        if (currentExercise === "Lunges") {
          const hip = landmarks[24]; // Right hip
          const knee = landmarks[26]; // Right knee
          const ankle = landmarks[28]; // Right ankle

          if (
            hip.visibility > 0.5 &&
            knee.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, knee, ankle);
            let currentFeedback = "Keep going";

            if (angle > 160) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              }
            }
            if (angle < 100) {
              repStateRef.current.stage = "down";
              currentFeedback = "Drive back up!";
            } else if (angle < 130 && repStateRef.current.stage === "up") {
              currentFeedback = "Lunge deeper...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure full body is visible",
            }));
          }
        }

        if (currentExercise === "Jumping Jacks") {
          const shoulder = landmarks[12]; // Right shoulder
          const hip = landmarks[24]; // Right hip
          const wrist = landmarks[16]; // Right wrist

          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const armAngle = calculateAngle(hip, shoulder, wrist);
            let currentFeedback = "Keep going";

            if (armAngle > 150) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              }
            }
            if (armAngle < 40) {
              repStateRef.current.stage = "down";
              currentFeedback = "Jump!";
            } else if (armAngle < 80 && repStateRef.current.stage === "up") {
              currentFeedback = "Arms up...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure full body is visible",
            }));
          }
        }

        if (currentExercise === "Deadlifts") {
          const shoulder = landmarks[12]; // Right shoulder
          const hip = landmarks[24]; // Right hip
          const knee = landmarks[26]; // Right knee

          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            knee.visibility > 0.5
          ) {
            const hipAngle = calculateAngle(shoulder, hip, knee);
            let currentFeedback = "Keep going";

            if (hipAngle > 160) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Lockout! Good rep.";
              }
            }
            if (hipAngle < 100) {
              repStateRef.current.stage = "down";
              currentFeedback = "Drive hips forward!";
            } else if (hipAngle < 130 && repStateRef.current.stage === "up") {
              currentFeedback = "Hinge at hips...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure full body is visible",
            }));
          }
        }

        if (currentExercise === "Lateral Raises") {
          const hip = landmarks[24]; // Right hip
          const shoulder = landmarks[12]; // Right shoulder
          const wrist = landmarks[16]; // Right wrist

          if (
            hip.visibility > 0.5 &&
            shoulder.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const armAngle = calculateAngle(hip, shoulder, wrist);
            let currentFeedback = "Keep going";

            if (armAngle < 25) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              } else {
                currentFeedback = "Raise arms to sides...";
              }
            }
            if (armAngle > 70) {
              repStateRef.current.stage = "down";
              currentFeedback = "Lower slowly!";
            } else if (armAngle > 40 && repStateRef.current.stage === "up") {
              currentFeedback = "Raise higher...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }

        if (currentExercise === "High Knees") {
          const leftShoulder = landmarks[11];
          const leftHip = landmarks[23];
          const leftKnee = landmarks[25];
          const rightShoulder = landmarks[12];
          const rightHip = landmarks[24];
          const rightKnee = landmarks[26];

          if (
            leftHip.visibility > 0.5 &&
            leftKnee.visibility > 0.5 &&
            rightHip.visibility > 0.5 &&
            rightKnee.visibility > 0.5
          ) {
            const leftAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
            const rightAngle = calculateAngle(
              rightShoulder,
              rightHip,
              rightKnee,
            );
            const minAngle = Math.min(leftAngle, rightAngle);
            let currentFeedback = "Keep going";

            if (minAngle > 155) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              } else {
                currentFeedback = "Drive knees up!";
              }
            }
            if (minAngle < 110) {
              repStateRef.current.stage = "down";
              currentFeedback = "Keep going!";
            } else if (minAngle < 140 && repStateRef.current.stage === "up") {
              currentFeedback = "Knees higher!";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure full body is visible",
            }));
          }
        }

        if (currentExercise === "Tricep Dips") {
          const shoulder = landmarks[12]; // Right shoulder
          const elbow = landmarks[14]; // Right elbow
          const wrist = landmarks[16]; // Right wrist

          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, elbow, wrist);
            let currentFeedback = "Keep going";

            if (angle > 150) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              }
            }
            if (angle < 90) {
              repStateRef.current.stage = "down";
              currentFeedback = "Push up!";
            } else if (angle < 120 && repStateRef.current.stage === "up") {
              currentFeedback = "Dip lower...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }

        if (currentExercise === "Glute Bridges") {
          const shoulder = landmarks[12]; // Right shoulder
          const hip = landmarks[24]; // Right hip
          const knee = landmarks[26]; // Right knee

          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            knee.visibility > 0.5
          ) {
            const hipAngle = calculateAngle(shoulder, hip, knee);
            let currentFeedback = "Keep going";

            if (hipAngle < 140) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              } else {
                currentFeedback = "Push hips up...";
              }
            }
            if (hipAngle > 160) {
              repStateRef.current.stage = "down";
              currentFeedback = "Hold! Now lower.";
            } else if (hipAngle > 145 && repStateRef.current.stage === "up") {
              currentFeedback = "Push hips higher...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure body is visible from the side",
            }));
          }
        }

        if (currentExercise === "Crunches") {
          const shoulder = landmarks[12]; // Right shoulder
          const hip = landmarks[24]; // Right hip
          const knee = landmarks[26]; // Right knee

          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            knee.visibility > 0.5
          ) {
            const torsoAngle = calculateAngle(shoulder, hip, knee);
            let currentFeedback = "Keep going";

            if (torsoAngle > 150) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                currentFeedback = "Good rep!";
              } else {
                currentFeedback = "Crunch up...";
              }
            }
            if (torsoAngle < 120) {
              repStateRef.current.stage = "down";
              currentFeedback = "Squeeze! Now lower.";
            } else if (torsoAngle < 140 && repStateRef.current.stage === "up") {
              currentFeedback = "Crunch higher...";
            }

            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: currentFeedback,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure body is visible from the side",
            }));
          }
        }

        // --- Helper-based tracking for remaining exercises ---

        // Elbow angle tracker: shoulder(12)-elbow(14)-wrist(16)
        const trackElbowAngle = (
          upThresh: number,
          downThresh: number,
          midThresh: number,
          upMsg: string,
          downMsg: string,
          midMsg: string,
          visMsg: string,
        ) => {
          const shoulder = landmarks[12];
          const elbow = landmarks[14];
          const wrist = landmarks[16];
          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, elbow, wrist);
            let fb = "Keep going";
            if (angle > upThresh) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = upMsg;
              }
            }
            if (angle < downThresh) {
              repStateRef.current.stage = "down";
              fb = downMsg;
            } else if (
              angle < midThresh &&
              repStateRef.current.stage === "up"
            ) {
              fb = midMsg;
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({ ...prev, feedback: visMsg }));
          }
        };

        // Knee angle tracker: hip(24)-knee(26)-ankle(28)
        const trackKneeAngle = (
          upThresh: number,
          downThresh: number,
          midThresh: number,
          upMsg: string,
          downMsg: string,
          midMsg: string,
          visMsg: string,
        ) => {
          const hip = landmarks[24];
          const knee = landmarks[26];
          const ankle = landmarks[28];
          if (
            hip.visibility > 0.5 &&
            knee.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, knee, ankle);
            let fb = "Keep going";
            if (angle > upThresh) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = upMsg;
              }
            }
            if (angle < downThresh) {
              repStateRef.current.stage = "down";
              fb = downMsg;
            } else if (
              angle < midThresh &&
              repStateRef.current.stage === "up"
            ) {
              fb = midMsg;
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({ ...prev, feedback: visMsg }));
          }
        };

        // Hip angle tracker: shoulder(12)-hip(24)-knee(26)
        const trackHipAngle = (
          upThresh: number,
          downThresh: number,
          midThresh: number,
          upMsg: string,
          downMsg: string,
          midMsg: string,
          visMsg: string,
        ) => {
          const shoulder = landmarks[12];
          const hip = landmarks[24];
          const knee = landmarks[26];
          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            knee.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, hip, knee);
            let fb = "Keep going";
            if (angle > upThresh) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = upMsg;
              }
            }
            if (angle < downThresh) {
              repStateRef.current.stage = "down";
              fb = downMsg;
            } else if (
              angle < midThresh &&
              repStateRef.current.stage === "up"
            ) {
              fb = midMsg;
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({ ...prev, feedback: visMsg }));
          }
        };

        // Arm abduction tracker: hip(24)-shoulder(12)-wrist(16)
        const trackArmAbduction = (
          upThresh: number,
          downThresh: number,
          midThresh: number,
          upMsg: string,
          downMsg: string,
          midMsg: string,
          visMsg: string,
        ) => {
          const hip = landmarks[24];
          const shoulder = landmarks[12];
          const wrist = landmarks[16];
          if (
            hip.visibility > 0.5 &&
            shoulder.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, shoulder, wrist);
            let fb = "Keep going";
            if (angle > upThresh) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = upMsg;
              }
            }
            if (angle < downThresh) {
              repStateRef.current.stage = "down";
              fb = downMsg;
            } else if (
              angle < midThresh &&
              repStateRef.current.stage === "up"
            ) {
              fb = midMsg;
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({ ...prev, feedback: visMsg }));
          }
        };

        // Alternating legs tracker (both hips/knees)
        const trackAlternatingLegs = (
          upThresh: number,
          downThresh: number,
          midThresh: number,
          upMsg: string,
          downMsg: string,
          midMsg: string,
          visMsg: string,
        ) => {
          const lS = landmarks[11];
          const lH = landmarks[23];
          const lK = landmarks[25];
          const rS = landmarks[12];
          const rH = landmarks[24];
          const rK = landmarks[26];
          if (
            lH.visibility > 0.5 &&
            lK.visibility > 0.5 &&
            rH.visibility > 0.5 &&
            rK.visibility > 0.5
          ) {
            const lA = calculateAngle(lS, lH, lK);
            const rA = calculateAngle(rS, rH, rK);
            const minAngle = Math.min(lA, rA);
            let fb = "Keep going";
            if (minAngle > upThresh) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = upMsg;
              }
            }
            if (minAngle < downThresh) {
              repStateRef.current.stage = "down";
              fb = downMsg;
            } else if (
              minAngle < midThresh &&
              repStateRef.current.stage === "up"
            ) {
              fb = midMsg;
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({ ...prev, feedback: visMsg }));
          }
        };

        // --- Pushup variants (elbow angle) ---
        if (currentExercise === "Wide Pushups") {
          trackElbowAngle(
            160,
            90,
            120,
            "Keep going",
            "Push up!",
            "Go deeper...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Diamond Pushups") {
          trackElbowAngle(
            155,
            80,
            110,
            "Keep going",
            "Push up!",
            "Go deeper...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Pike Pushups") {
          trackElbowAngle(
            155,
            85,
            115,
            "Keep going",
            "Press up!",
            "Lower head...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Wall Pushups") {
          trackElbowAngle(
            160,
            100,
            130,
            "Keep going",
            "Push away!",
            "Lean in more...",
            "Ensure upper body is visible",
          );
        }

        // --- Tricep variants (elbow angle) ---
        if (currentExercise === "Overhead Tricep Extension") {
          trackElbowAngle(
            155,
            60,
            100,
            "Extend fully...",
            "Squeeze! Now extend.",
            "Extend more...",
            "Ensure arm is visible",
          );
        }
        if (currentExercise === "Tricep Kickbacks") {
          trackElbowAngle(
            150,
            70,
            110,
            "Extend arm...",
            "Good squeeze! Extend back.",
            "Kick back more...",
            "Ensure arm is visible",
          );
        }

        // --- Curl variants (elbow angle, inverted: down=extended, up=curled) ---
        if (currentExercise === "Hammer Curls") {
          const shoulder = landmarks[12];
          const elbow = landmarks[14];
          const wrist = landmarks[16];
          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, elbow, wrist);
            let fb = "Keep going";
            if (angle > 150) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Curl up...";
              }
            }
            if (angle < 50) {
              repStateRef.current.stage = "down";
              fb = "Squeeze! Now lower slowly.";
            } else if (angle < 90 && repStateRef.current.stage === "up") {
              fb = "Curl higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure arm is visible",
            }));
          }
        }

        // --- Shoulder / raise variants (arm abduction) ---
        if (currentExercise === "Front Raises") {
          trackArmAbduction(
            140,
            30,
            70,
            "Lower slowly...",
            "Raise arms forward!",
            "Raise higher...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Arnold Press") {
          trackElbowAngle(
            160,
            85,
            115,
            "Press overhead...",
            "Press up!",
            "Lower to shoulders...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Upright Rows") {
          const shoulder = landmarks[12];
          const elbow = landmarks[14];
          const hip = landmarks[24];
          if (
            shoulder.visibility > 0.5 &&
            elbow.visibility > 0.5 &&
            hip.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, shoulder, elbow);
            let fb = "Keep going";
            if (angle < 30) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Pull elbows up...";
              }
            }
            if (angle > 80) {
              repStateRef.current.stage = "down";
              fb = "Lower slowly!";
            } else if (angle > 50 && repStateRef.current.stage === "up") {
              fb = "Pull higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }
        if (currentExercise === "Bent Over Rows") {
          trackElbowAngle(
            155,
            60,
            100,
            "Extend arm...",
            "Pull! Squeeze back.",
            "Pull higher...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Reverse Flys") {
          trackArmAbduction(
            130,
            20,
            60,
            "Bring arms in...",
            "Squeeze shoulder blades!",
            "Open wider...",
            "Ensure upper body is visible",
          );
        }
        if (currentExercise === "Chest Flys") {
          // Track how close wrists get (arm adduction) via abduction angle
          const hip = landmarks[24];
          const shoulder = landmarks[12];
          const wrist = landmarks[16];
          if (
            hip.visibility > 0.5 &&
            shoulder.visibility > 0.5 &&
            wrist.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, shoulder, wrist);
            let fb = "Keep going";
            if (angle > 70) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Open arms wider...";
              }
            }
            if (angle < 25) {
              repStateRef.current.stage = "down";
              fb = "Squeeze! Now open.";
            } else if (angle < 45 && repStateRef.current.stage === "up") {
              fb = "Bring arms together...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }

        // --- Lower body variants (knee angle) ---
        if (currentExercise === "Sumo Squats") {
          trackKneeAngle(
            160,
            85,
            115,
            "Stand tall",
            "Drive up!",
            "Lower more...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Bulgarian Split Squats") {
          trackKneeAngle(
            160,
            90,
            120,
            "Stand tall",
            "Drive up!",
            "Lower deeper...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Side Lunges") {
          trackKneeAngle(
            160,
            95,
            125,
            "Stand tall",
            "Push back up!",
            "Lunge deeper...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Step Ups") {
          trackKneeAngle(
            160,
            100,
            130,
            "Step up fully",
            "Step up!",
            "Drive knee higher...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Calf Raises") {
          // Track ankle angle via knee-ankle-foot
          const knee = landmarks[26];
          const ankle = landmarks[28];
          const foot = landmarks[32]; // Right foot index
          if (
            knee.visibility > 0.5 &&
            ankle.visibility > 0.5 &&
            foot.visibility > 0.5
          ) {
            const angle = calculateAngle(knee, ankle, foot);
            let fb = "Keep going";
            if (angle > 160) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Rise up on toes...";
              }
            }
            if (angle < 130) {
              repStateRef.current.stage = "down";
              fb = "Hold! Now lower.";
            } else if (angle < 145 && repStateRef.current.stage === "up") {
              fb = "Push higher on toes...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure legs and feet are visible",
            }));
          }
        }

        // --- Glute / hip variants ---
        if (currentExercise === "Donkey Kicks") {
          trackHipAngle(
            165,
            110,
            135,
            "Kick back...",
            "Squeeze glute! Now lower.",
            "Kick higher...",
            "Ensure body is visible from the side",
          );
        }
        if (currentExercise === "Fire Hydrants") {
          // Track lateral knee elevation via hip abduction
          const lHip = landmarks[23];
          const rHip = landmarks[24];
          const rKnee = landmarks[26];
          if (
            lHip.visibility > 0.5 &&
            rHip.visibility > 0.5 &&
            rKnee.visibility > 0.5
          ) {
            const angle = calculateAngle(lHip, rHip, rKnee);
            let fb = "Keep going";
            if (angle < 120) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Lift knee out...";
              }
            }
            if (angle > 165) {
              repStateRef.current.stage = "down";
              fb = "Open! Now lower.";
            } else if (angle > 140 && repStateRef.current.stage === "up") {
              fb = "Lift knee higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure hips and knees are visible",
            }));
          }
        }
        if (currentExercise === "Hip Thrusts") {
          // Same as glute bridges with slightly different thresholds
          const shoulder = landmarks[12];
          const hip = landmarks[24];
          const knee = landmarks[26];
          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            knee.visibility > 0.5
          ) {
            const hipAngle = calculateAngle(shoulder, hip, knee);
            let fb = "Keep going";
            if (hipAngle < 140) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Thrust hips up...";
              }
            }
            if (hipAngle > 155) {
              repStateRef.current.stage = "down";
              fb = "Squeeze! Now lower.";
            } else if (hipAngle > 145 && repStateRef.current.stage === "up") {
              fb = "Push hips higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure body is visible from the side",
            }));
          }
        }
        if (currentExercise === "Good Mornings") {
          trackHipAngle(
            160,
            90,
            125,
            "Stand tall",
            "Hinge forward! Now stand.",
            "Hinge deeper...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Wall Sit") {
          // Isometric: track reps as transitions in/out of hold position
          trackKneeAngle(
            160,
            85,
            110,
            "Stand up...",
            "Hold position!",
            "Sit deeper...",
            "Ensure full body is visible",
          );
        }

        // --- Core variants ---
        if (currentExercise === "Sit Ups") {
          trackHipAngle(
            155,
            90,
            120,
            "Lie back down...",
            "Sit all the way up!",
            "Curl up more...",
            "Ensure body is visible from the side",
          );
        }
        if (currentExercise === "Leg Raises") {
          // Track hip angle (shoulder-hip-ankle for leg elevation)
          const shoulder = landmarks[12];
          const hip = landmarks[24];
          const ankle = landmarks[28];
          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, hip, ankle);
            let fb = "Keep going";
            if (angle > 155) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Raise legs...";
              }
            }
            if (angle < 100) {
              repStateRef.current.stage = "down";
              fb = "Hold! Now lower slowly.";
            } else if (angle < 130 && repStateRef.current.stage === "up") {
              fb = "Raise legs higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure body is visible from the side",
            }));
          }
        }
        if (currentExercise === "Mountain Climbers") {
          trackAlternatingLegs(
            155,
            100,
            130,
            "Drive knees!",
            "Keep going!",
            "Knees higher!",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Bicycle Crunches") {
          trackAlternatingLegs(
            150,
            90,
            120,
            "Twist and crunch!",
            "Keep pedaling!",
            "Bring knee closer!",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Flutter Kicks") {
          // Track alternating ankle elevation
          const lH = landmarks[23];
          const lA = landmarks[27];
          const rH = landmarks[24];
          const rA = landmarks[28];
          if (
            lH.visibility > 0.5 &&
            lA.visibility > 0.5 &&
            rH.visibility > 0.5 &&
            rA.visibility > 0.5
          ) {
            const diff = Math.abs(lA.y - rA.y);
            let fb = "Keep going";
            if (diff > 0.08) {
              if (repStateRef.current.stage === "up") {
                repStateRef.current.stage = "down";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              }
            }
            if (diff < 0.03) {
              repStateRef.current.stage = "up";
              fb = "Flutter faster!";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure legs are visible",
            }));
          }
        }
        if (currentExercise === "V-Ups") {
          trackHipAngle(
            155,
            70,
            110,
            "Lie back...",
            "Reach for toes! V-shape!",
            "Fold more...",
            "Ensure body is visible from the side",
          );
        }
        if (currentExercise === "Dead Bugs") {
          trackAlternatingLegs(
            155,
            105,
            135,
            "Extend limbs...",
            "Keep going!",
            "Extend more!",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Side Plank Dips") {
          // Track lateral hip dip via hip-shoulder vertical alignment
          const shoulder = landmarks[12];
          const hip = landmarks[24];
          const ankle = landmarks[28];
          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, hip, ankle);
            let fb = "Keep going";
            if (angle > 170) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Dip hips down...";
              }
            }
            if (angle < 140) {
              repStateRef.current.stage = "down";
              fb = "Lift hips up!";
            } else if (angle < 160 && repStateRef.current.stage === "up") {
              fb = "Dip lower...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure body is visible from the side",
            }));
          }
        }
        if (currentExercise === "Russian Twists") {
          // Track shoulder rotation via left wrist - right wrist horizontal distance
          const lW = landmarks[15]; // Left wrist
          const rW = landmarks[16]; // Right wrist
          const lS = landmarks[11];
          const rS = landmarks[12];
          if (
            lW.visibility > 0.5 &&
            rW.visibility > 0.5 &&
            lS.visibility > 0.5 &&
            rS.visibility > 0.5
          ) {
            const midShoulderX = (lS.x + rS.x) / 2;
            const handMidX = (lW.x + rW.x) / 2;
            const offset = handMidX - midShoulderX;
            let fb = "Keep twisting";
            if (offset > 0.08) {
              if (repStateRef.current.stage === "up") {
                repStateRef.current.stage = "down";
                repStateRef.current.count += 1;
                fb = "Good twist!";
              }
            }
            if (offset < -0.08) {
              repStateRef.current.stage = "up";
              fb = "Twist other side!";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure upper body is visible",
            }));
          }
        }

        // --- Full body / cardio ---
        if (currentExercise === "Burpees") {
          // Track full squat-to-stand using hip-knee-ankle
          trackKneeAngle(
            160,
            80,
            115,
            "Stand tall",
            "Explode up!",
            "Get lower...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Squat Jumps") {
          trackKneeAngle(
            165,
            85,
            120,
            "Jump!",
            "Explode up!",
            "Squat deeper...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Box Jumps") {
          trackKneeAngle(
            165,
            90,
            120,
            "Land soft!",
            "Jump up!",
            "Load more...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Butt Kicks") {
          // Track heel-to-glute distance via knee flexion (hip-knee-ankle)
          const hip = landmarks[24];
          const knee = landmarks[26];
          const ankle = landmarks[28];
          if (
            hip.visibility > 0.5 &&
            knee.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(hip, knee, ankle);
            let fb = "Keep going";
            if (angle > 140) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Kick heels up!";
              }
            }
            if (angle < 50) {
              repStateRef.current.stage = "down";
              fb = "Great kick! Keep going.";
            } else if (angle < 90 && repStateRef.current.stage === "up") {
              fb = "Kick higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure full body is visible",
            }));
          }
        }
        if (currentExercise === "Arm Circles") {
          // Track shoulder rotation via wrist position relative to shoulder
          const shoulder = landmarks[12];
          const wrist = landmarks[16];
          if (shoulder.visibility > 0.5 && wrist.visibility > 0.5) {
            const above = wrist.y < shoulder.y;
            let fb = "Keep circling";
            if (above) {
              if (repStateRef.current.stage === "up") {
                repStateRef.current.stage = "down";
                repStateRef.current.count += 1;
                fb = "Good circle!";
              }
            } else {
              repStateRef.current.stage = "up";
              fb = "Circle around...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure arm is visible",
            }));
          }
        }
        if (currentExercise === "Toe Touches") {
          trackHipAngle(
            155,
            80,
            115,
            "Stand back up...",
            "Touch those toes!",
            "Reach lower...",
            "Ensure full body is visible",
          );
        }
        if (currentExercise === "Superman") {
          // Track back extension: shoulder elevation relative to hip
          const shoulder = landmarks[12];
          const hip = landmarks[24];
          const ankle = landmarks[28];
          if (
            shoulder.visibility > 0.5 &&
            hip.visibility > 0.5 &&
            ankle.visibility > 0.5
          ) {
            const angle = calculateAngle(shoulder, hip, ankle);
            let fb = "Keep going";
            if (angle > 165) {
              if (repStateRef.current.stage === "down") {
                repStateRef.current.stage = "up";
                repStateRef.current.count += 1;
                fb = "Good rep!";
              } else {
                fb = "Lift arms and legs...";
              }
            }
            if (angle < 140) {
              repStateRef.current.stage = "down";
              fb = "Hold! Now lower.";
            } else if (angle < 155 && repStateRef.current.stage === "up") {
              fb = "Lift higher...";
            }
            setState((prev) => ({
              ...prev,
              reps: repStateRef.current.count,
              feedback: fb,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              feedback: "Ensure body is visible from the side",
            }));
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

    const initMediaPipe = async () => {
      const poseModule = await import("@mediapipe/pose");

      if (!mountedRef.current) return;

      poseRef.current = new poseModule.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseRef.current.onResults(onResults);

      // Use requestAnimationFrame loop instead of @mediapipe/camera_utils Camera,
      // which opens its own getUserMedia stream and conflicts with react-webcam on mobile.
      let rafId: number;
      const sendFrame = async () => {
        if (!mountedRef.current || !poseRef.current) return;
        if (videoElement.readyState >= 2) {
          try {
            await poseRef.current.send({ image: videoElement });
          } catch {
            // Ignore errors during teardown
          }
        }
        rafId = requestAnimationFrame(sendFrame);
      };
      cameraRef.current = { stop: () => cancelAnimationFrame(rafId) };
      rafId = requestAnimationFrame(sendFrame);
      setState((prev) => ({ ...prev, isReady: true }));
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
