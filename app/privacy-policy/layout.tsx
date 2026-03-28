import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "FitVision privacy policy. Learn how we handle your data with on-device processing and protect your privacy.",
  alternates: {
    canonical: "https://fitvision.tech/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
