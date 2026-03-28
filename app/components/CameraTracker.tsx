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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync canvas dimensions to the actual video stream once it's playing.
  // onUserMedia fires before videoWidth/videoHeight are available on many
  // mobile browsers, so we listen for loadedmetadata on the <video> element.
  const handleVideoLoad = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) return;

    let resolved = false;
    const syncDimensions = () => {
      if (resolved) return;
      if (video.videoWidth && video.videoHeight) {
        resolved = true;
        setCanvasSize({ width: video.videoWidth, height: video.videoHeight });
        setVideoElement(video);
      }
    };

    // Dimensions may already be available (desktop browsers)
    if (video.videoWidth && video.videoHeight) {
      syncDimensions();
      return;
    }

    // Wait for the video metadata to load (mobile Safari, etc.)
    video.addEventListener("loadedmetadata", syncDimensions, { once: true });
    // Fallback: some mobile browsers fire "playing" but not "loadedmetadata"
    video.addEventListener("playing", syncDimensions, { once: true });

    // Polling fallback for mobile browsers where events fire before listeners
    // are attached (common race condition on iOS Safari and Android Chrome).
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      syncDimensions();
      if (resolved || attempts >= 50) {
        clearInterval(poll);
      }
    }, 100);
  }, []);

  const handleCameraError = useCallback((err: string | DOMException) => {
    const message = err instanceof DOMException ? err.message : String(err);
    if (message.includes("NotAllowedError") || message.includes("Permission")) {
      setCameraError(
        "Camera access was denied. Please allow camera permissions in your browser settings and reload.",
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
    } else if (
      message.includes("OverconstrainedError") ||
      message.includes("Overconstrained")
    ) {
      setCameraError(
        "Camera does not support the requested settings. Please try a different browser.",
      );
    } else {
      setCameraError(`Camera error: ${message}`);
    }
  }, []);

  // Handle orientation changes on mobile — re-sync canvas dimensions
  useEffect(() => {
    if (!videoElement) return;

    const handleOrientationChange = () => {
      // Small delay to let the browser settle after rotation
      setTimeout(() => {
        if (videoElement.videoWidth && videoElement.videoHeight) {
          setCanvasSize({
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
          });
        }
      }, 300);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    // Modern browsers also fire resize on orientation change
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [videoElement]);

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

  // Video constraints adapted for mobile vs desktop
  const videoConstraints = isMobile
    ? {
        facingMode: "user",
        width: { min: 240, ideal: 640 },
        height: { min: 320, ideal: 480 },
      }
    : {
        facingMode: "user",
        width: { min: 320, ideal: 1280 },
        height: { min: 240, ideal: 720 },
      };

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
          {isMobile && (
            <p className="text-xs text-warm-sand/60 mt-2 px-4 text-center">
              Please allow camera access when prompted
            </p>
          )}
        </div>
      )}

      {/* Camera Feed */}
      {!cameraError && (
        <Webcam
          ref={webcamRef}
          onUserMedia={handleVideoLoad}
          onUserMediaError={handleCameraError}
          className="absolute inset-0 z-[1] w-full h-full object-cover"
          style={{ objectFit: "cover" }}
          mirrored={false}
          audio={false}
          muted
          playsInline
          videoConstraints={videoConstraints}
        />
      )}

      {/* MediaPipe Canvas Overlay — dimensions match the actual video stream */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full object-cover"
        width={canvasSize.width}
        height={canvasSize.height}
      />
    </div>
  );
};
