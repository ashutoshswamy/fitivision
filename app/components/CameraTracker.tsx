"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });

  // Sync canvas dimensions to the actual video stream once it's playing.
  // onUserMedia fires before videoWidth/videoHeight are available on many
  // mobile browsers, so we listen for loadedmetadata on the <video> element.
  const handleVideoLoad = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) return;

    const syncDimensions = () => {
      if (video.videoWidth && video.videoHeight) {
        setCanvasSize({ width: video.videoWidth, height: video.videoHeight });
        setVideoElement(video);
      }
    };

    // Dimensions may already be available (desktop browsers)
    if (video.videoWidth && video.videoHeight) {
      syncDimensions();
    } else {
      // Wait for the video metadata to load (mobile Safari, etc.)
      video.addEventListener("loadedmetadata", syncDimensions, { once: true });
    }
  }, []);

  const handleCameraError = useCallback((err: string | DOMException) => {
    const message = err instanceof DOMException ? err.message : String(err);
    if (message.includes("NotAllowedError") || message.includes("Permission")) {
      setCameraError(
        "Camera access was denied. Please allow camera permissions and reload.",
      );
    } else if (
      message.includes("NotFoundError") ||
      message.includes("DevicesNotFound") ||
      message.includes("Requested device not found")
    ) {
      setCameraError("No camera found on this device.");
    } else if (
      message.includes("NotReadableError") ||
      message.includes("TrackStartError")
    ) {
      setCameraError("Camera is in use by another app. Close it and reload.");
    } else {
      setCameraError(`Camera error: ${message}`);
    }
  }, []);

  const { isReady, reps, feedback, precision } = usePoseTracker(
    videoElement,
    canvasRef,
    exerciseType,
  );

  // Lift state up to parent
  const onTrackerUpdateRef = useRef(onTrackerUpdate);
  useEffect(() => {
    onTrackerUpdateRef.current = onTrackerUpdate;
  }, [onTrackerUpdate]);

  useEffect(() => {
    onTrackerUpdateRef.current(reps, feedback, precision);
  }, [reps, feedback, precision]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-charcoal rounded-3xl overflow-hidden shadow-xl border border-driftwood/40">
      {/* Error state */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment bg-charcoal z-30 px-6 text-center">
          <svg
            className="w-10 h-10 text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium tracking-wide mb-2">{cameraError}</p>
          <button
            onClick={() => {
              setCameraError(null);
              setVideoElement(null);
            }}
            className="mt-2 px-4 py-2 bg-sage/80 hover:bg-sage text-charcoal rounded-lg text-sm font-semibold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {!isReady && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment bg-charcoal z-20">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium tracking-wide">Initializing Camera...</p>
        </div>
      )}

      {/* Camera Feed */}
      {!cameraError && (
        <Webcam
          ref={webcamRef}
          onUserMedia={handleVideoLoad}
          onUserMediaError={handleCameraError}
          className="absolute w-full h-full object-cover"
          mirrored={false}
          audio={false}
          playsInline
          videoConstraints={{
            facingMode: "user",
            width: { min: 320, ideal: 1280 },
            height: { min: 240, ideal: 720 },
          }}
        />
      )}

      {/* MediaPipe Canvas Overlay — dimensions match the actual video stream */}
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full object-cover z-10"
        width={canvasSize.width}
        height={canvasSize.height}
      />
    </div>
  );
};
