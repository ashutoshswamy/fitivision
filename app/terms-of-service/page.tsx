"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using FitVision, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application. These terms constitute a legally binding agreement between you and FitVision.",
  },
  {
    title: "Description of Service",
    content:
      "FitVision is an AI-powered fitness application that uses on-device computer vision to track exercise form and provide real-time posture feedback. The service includes pose detection, exercise counting, and optional AI-generated fitness suggestions. FitVision is provided as a fitness assistance tool and is not a medical device.",
  },
  {
    title: "User Accounts",
    content:
      "To access certain features, you must create an account through our authentication provider. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update your information as necessary.",
  },
  {
    title: "Acceptable Use",
    content:
      "You agree to use FitVision only for its intended purpose of personal fitness tracking and improvement. You shall not: attempt to reverse-engineer, decompile, or extract the source code; use the service to develop competing products; share your account with others; or use the service in any way that violates applicable laws or regulations.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, features, and functionality of FitVision — including but not limited to the design, code, algorithms, graphics, and branding — are owned by FitVision and are protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the application for personal, non-commercial purposes.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law, FitVision and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service. This includes but is not limited to physical injury, data loss, or any damages resulting from reliance on AI-generated recommendations. Our total liability shall not exceed the amount you paid for the service.",
  },
  {
    title: "Disclaimer of Warranties",
    content:
      'FitVision is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or that AI-generated feedback will be accurate or suitable for your specific circumstances. You use the service at your own risk.',
  },
  {
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate your access to FitVision at any time, with or without cause, and with or without notice. Upon termination, your right to use the service will immediately cease. You may also terminate your account at any time by contacting us.",
  },
  {
    title: "Governing Law",
    content:
      "These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of FitVision shall be resolved through good-faith negotiation before pursuing formal legal proceedings.",
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. Your continued use of FitVision after any modifications constitutes acceptance of the updated terms. We encourage you to review these terms periodically.",
  },
];

export default function TermsOfServicePage() {
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
            Terms of{" "}
            <span className="font-medium text-muted-clay italic">
              service.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-driftwood font-light max-w-lg leading-relaxed"
          >
            The terms and conditions governing your use of FitVision.
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
              href="/privacy-policy"
              className="text-[10px] tracking-[0.2em] uppercase text-sage hover:text-terracotta transition-colors duration-300"
            >
              Privacy
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
