import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer & Terms of Use",
  description:
    "FitVision terms of use, disclaimer, and privacy information. Learn how we keep your fitness data private with on-device processing.",
  alternates: {
    canonical: "https://fitvision.tech/disclaimer",
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
