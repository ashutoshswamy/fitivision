"use client";

import React, { useRef } from "react";
import Webcam from "react-webcam";
import { usePoseTracker, ExerciseType } from "../hooks/usePoseTracker";

interface CameraTrackerProps {
  exerciseType: ExerciseType;
  onTrackerUpdate: (reps: number, feedback: string, precision: number) => void;
}

export const CameraTracker = ({
  exerciseType,
  onTrackerUpdate,
}: CameraTrackerProps) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Expose the video element from the Webcam component ref
  const [videoElement, setVideoElement] =
    React.useState<HTMLVideoElement | null>(null);

  // Sync the webcam ref to our internal video element for MediaPipe handling
  const handleVideoLoad = React.useCallback(() => {
    if (webcamRef.current?.video) {
      setVideoElement(webcamRef.current.video);
    }
  }, []);

  const { isReady, reps, feedback, precision } = usePoseTracker(
    videoElement,
    canvasRef,
    exerciseType,
  );

  // Lift state up to parent
  const onTrackerUpdateRef = React.useRef(onTrackerUpdate);
  React.useEffect(() => {
    onTrackerUpdateRef.current = onTrackerUpdate;
  }, [onTrackerUpdate]);

  React.useEffect(() => {
    onTrackerUpdateRef.current(reps, feedback, precision);
  }, [reps, feedback, precision]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-charcoal rounded-3xl overflow-hidden shadow-xl border border-driftwood/40">
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment bg-charcoal z-20">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium tracking-wide">Initializing Camera...</p>
        </div>
      )}

      {/* Camera Feed */}
      <Webcam
        ref={webcamRef}
        onUserMedia={handleVideoLoad}
        className="absolute w-full h-full object-cover"
        mirrored={false}
        audio={false}
        videoConstraints={{
          facingMode: "user",
        }}
      />

      {/* MediaPipe Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full object-cover z-10"
        width={1280}
        height={720}
      />
    </div>
  );
};
