"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "General Information",
    content:
      "FitVision is an AI-powered fitness tool designed to assist with exercise form and posture tracking. The information and feedback provided by this application are for general informational and educational purposes only. FitVision is not a substitute for professional medical advice, diagnosis, or treatment.",
  },
  {
    title: "Not Medical Advice",
    content:
      "The exercise suggestions, posture corrections, and AI-generated recommendations provided through FitVision — including those powered by Google Gemini — should not be considered medical advice. Always consult with a qualified healthcare professional, physician, or certified fitness trainer before starting any new exercise program, especially if you have pre-existing health conditions, injuries, or concerns about your physical capability.",
  },
  {
    title: "Assumption of Risk",
    content:
      "By using FitVision, you acknowledge that physical exercise carries inherent risks including but not limited to muscle strain, joint injury, and cardiovascular events. You assume full responsibility for your own safety during any exercise performed while using this application. FitVision and its creators shall not be held liable for any injury, damage, or adverse health outcome resulting from the use of this application.",
  },
  {
    title: "AI Accuracy Limitations",
    content:
      "FitVision uses on-device computer vision (MediaPipe Pose) and AI language models (Google Gemini) to provide feedback. While we strive for accuracy, these technologies have inherent limitations. Pose detection may be affected by lighting conditions, camera quality, clothing, or body positioning. AI-generated exercise suggestions are general in nature and may not account for your specific health circumstances.",
  },
  {
    title: "Privacy & Data Processing",
    content:
      "Pose tracking is performed entirely on your device — no video or image data leaves your browser. However, when using the AI Suggestions feature, text-based health information you provide is sent to Google's Gemini API for processing. We do not store this information on our servers. Please refer to Google's privacy policy for details on how they handle API data.",
  },
  {
    title: "No Guarantees",
    content:
      'FitVision does not guarantee any specific fitness results, weight loss, muscle gain, or health improvements. Individual results vary based on numerous factors including genetics, consistency, diet, and overall lifestyle. The application is provided "as is" without warranties of any kind, either express or implied.',
  },
  {
    title: "Age Requirement",
    content:
      "FitVision is intended for use by individuals aged 16 and older. If you are under 16, please use this application only under the supervision of a parent or guardian.",
  },
  {
    title: "Changes to This Disclaimer",
    content:
      "We reserve the right to update this disclaimer at any time. Continued use of FitVision after changes constitutes acceptance of the revised terms.",
  },
];

export default function DisclaimerPage() {
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
          <Link
            href="/"
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium text-driftwood hover:text-charcoal transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
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
            Disclaimer &{" "}
            <span className="font-medium text-muted-clay italic">
              terms of use.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-driftwood font-light max-w-lg leading-relaxed"
          >
            Please read the following carefully before using FitVision.
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
          <Link
            href="/disclaimer"
            className="text-[10px] tracking-[0.2em] uppercase text-sage hover:text-terracotta transition-colors duration-300"
          >
            Disclaimer
          </Link>
        </div>
      </footer>
    </div>
  );
}
