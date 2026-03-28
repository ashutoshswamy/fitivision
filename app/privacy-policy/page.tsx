"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Information We Collect",
    content:
      "FitVision is designed with privacy at its core. Pose tracking and exercise detection are performed entirely on your device using on-device AI — no video, image, or body-tracking data is ever transmitted to our servers. When you use the AI Suggestions feature, text-based health information you voluntarily provide is sent to our AI service for processing. We collect basic account information (email, name) through our authentication provider, Clerk, when you create an account.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Account information is used solely to authenticate you and provide access to your workout history. Text-based health inputs submitted to the AI Suggestions feature are processed in real-time to generate personalized recommendations and are not stored on our servers after processing. Workout statistics (exercise counts, session duration) may be stored in our database to provide you with progress tracking across sessions.",
  },
  {
    title: "On-Device Processing",
    content:
      "FitVision uses MediaPipe, a browser-based machine learning framework, to perform all pose detection and exercise tracking directly on your device. Your camera feed is never recorded, stored, or transmitted. All visual processing happens locally in your browser, ensuring your physical data remains completely private.",
  },
  {
    title: "Third-Party Services",
    content:
      "We use the following third-party services: Clerk for authentication, Supabase for database storage, and Google Generative AI for the AI Suggestions feature. Each of these services has their own privacy policies. We recommend reviewing their respective privacy practices. We do not sell, trade, or share your personal information with third parties for marketing purposes.",
  },
  {
    title: "Cookies & Local Storage",
    content:
      "FitVision uses essential cookies and local storage for authentication and session management. We do not use tracking cookies or analytics that monitor your browsing behavior across other websites. Any data stored locally in your browser is used solely to improve your experience within the application.",
  },
  {
    title: "Data Retention & Deletion",
    content:
      "You may request deletion of your account and associated data at any time by contacting us. Workout data stored in our database will be permanently deleted upon account deletion. Since pose tracking data never leaves your device, there is no server-side visual data to delete.",
  },
  {
    title: "Children's Privacy",
    content:
      "FitVision is intended for users aged 16 and older. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated revision date. Continued use of FitVision after changes constitutes acceptance of the revised policy.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-parchment text-charcoal font-sans selection:bg-terracotta selection:text-parchment">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-6 backdrop-blur-md bg-parchment/80 border-b border-warm-sand/50"
      >
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-nobg.png"
              alt="FitVision"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-serif text-lg sm:text-xl font-light tracking-wide">
              FitVision
            </span>
          </Link>
          <div className="flex items-center gap-6 lg:gap-10 text-xs tracking-[0.2em] uppercase font-medium">
            <Link
              href="/"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Dashboard
            </Link>
            <Link
              href="/#philosophy"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Philosophy
            </Link>
            <Link
              href="/#process"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Method
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Header */}
      <section className="pt-28 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-[55rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 text-[10px] text-sage tracking-[0.3em] font-semibold uppercase mb-6"
          >
            <span className="w-8 h-px bg-sage" />
            <span>Legal</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tighter text-charcoal leading-[1] mb-4 sm:mb-6"
          >
            Privacy{" "}
            <span className="font-medium text-muted-clay italic">
              policy.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-driftwood font-light max-w-lg leading-relaxed"
          >
            Your privacy matters. Here&apos;s how FitVision handles your data.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-[55rem] mx-auto space-y-6 sm:space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.5 }}
              className="bg-linen/60 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-warm-sand/30"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <span className="text-[10px] font-mono tracking-widest text-sage">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg sm:text-xl font-medium text-charcoal tracking-wide">
                  {section.title}
                </h2>
              </div>
              <p className="text-driftwood font-light leading-relaxed text-sm">
                {section.content}
              </p>
            </motion.div>
          ))}

          {/* Last updated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center pt-8 border-t border-warm-sand/30"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-sand font-medium">
              Last updated — March 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-parchment py-10 sm:py-16 px-4 sm:px-8 border-t border-warm-sand/50">
        <div className="max-w-[75rem] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-nobg.png"
              alt="FitVision"
              width={120}
              height={32}
              className="h-7 sm:h-8 w-auto"
            />
            <span className="font-serif text-lg sm:text-xl font-light tracking-wide">
              FitVision
            </span>
          </Link>
          <p className="text-[10px] font-medium text-driftwood tracking-[0.2em] uppercase text-center">
            © {new Date().getFullYear()} FitVision. Cultivating mindful
            movement.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms-of-service"
              className="text-[10px] tracking-[0.2em] uppercase text-sage hover:text-terracotta transition-colors duration-300"
            >
              Terms
            </Link>
            <Link
              href="/disclaimer"
              className="text-[10px] tracking-[0.2em] uppercase text-sage hover:text-terracotta transition-colors duration-300"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
