import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercise Library — 51+ Tracked Exercises",
  description:
    "Browse 51+ exercises with AI-powered real-time tracking. Push, pull, legs, core, cardio, and more — each with pose detection for form correction and rep counting.",
  alternates: {
    canonical: "https://fitvision.tech/workouts",
  },
  openGraph: {
    title: "Exercise Library — 51+ Tracked Exercises | FitVision",
    description:
      "Browse 51+ exercises with AI-powered real-time tracking and form correction.",
    url: "https://fitvision.tech/workouts",
  },
};

export default function WorkoutsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
