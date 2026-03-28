import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "FitVision terms of service. Understand the terms and conditions for using our AI-powered fitness application.",
  alternates: {
    canonical: "https://fitvision.tech/terms-of-service",
  },
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
