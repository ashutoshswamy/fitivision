"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowDown,
  Camera,
  Activity,
  Shield,
  Sparkles,
  Target,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Eye,
  Zap,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const marqueeItems = [
  "Real-Time Tracking",
  "33 Joint Points",
  "On-Device AI",
  "Zero Latency",
  "Privacy First",
  "No Hardware Needed",
  "Posture Correction",
  "Rep Counting",
];

export default function Home() {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-parchment text-charcoal font-sans selection:bg-terracotta selection:text-parchment">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-5 backdrop-blur-xl bg-parchment/70 border-b border-warm-sand/30"
      >
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10 text-xs tracking-[0.2em] uppercase font-medium">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-in"}
              className="text-driftwood hover:text-charcoal transition-colors duration-300 flex items-center gap-2"
            >
              Dashboard
            </Link>
            <Link
              href="#philosophy"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Philosophy
            </Link>
            <Link
              href="#process"
              className="text-driftwood hover:text-charcoal transition-colors duration-300"
            >
              Method
            </Link>
            {isSignedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-driftwood hover:text-terracotta transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 text-parchment bg-charcoal px-5 py-2.5 rounded-full hover:bg-charcoal/85 transition-all duration-300 hover:shadow-lg"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-6 pb-4 text-xs tracking-[0.2em] uppercase font-medium">
                <Link
                  href={isSignedIn ? "/dashboard" : "/sign-in"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="#philosophy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Philosophy
                </Link>
                <Link
                  href="#process"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-driftwood hover:text-charcoal transition-colors py-1"
                >
                  Method
                </Link>
                <div className="pt-2 border-t border-warm-sand/30">
                  {isSignedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-driftwood hover:text-terracotta transition-colors py-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  ) : (
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center gap-2 text-parchment bg-charcoal px-4 py-2 rounded-full hover:bg-charcoal/85 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.main
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100svh] flex flex-col justify-end lg:justify-center border-b border-warm-sand/50 bg-parchment"
      >
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-terracotta/[0.07] blur-[100px] animate-blob" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-sage/[0.08] blur-[80px] animate-blob [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-warm-sand/[0.06] blur-[120px] animate-blob [animation-delay:4s]" />
        </div>

        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/heropage.png"
            alt="FitVision hero background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-y-0 left-0 w-full lg:w-[60%] bg-gradient-to-r from-parchment via-parchment/80 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-parchment to-transparent"></div>
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-parchment/50 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-6 md:px-12 pt-32 pb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Left: Typography & CTA */}
            <motion.div
              className="w-full lg:w-5/12 flex flex-col justify-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="flex items-center gap-4 text-[10px] text-terracotta tracking-[0.3em] font-semibold uppercase mb-8 ml-1"
              >
                <span className="w-8 h-px bg-terracotta"></span>
                <span>Spatial AI</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                  Live
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tighter text-charcoal leading-[0.95] mb-6 sm:mb-8"
              >
                Mindful
                <br />
                movement,
                <br />
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-terracotta via-muted-clay to-driftwood italic pr-1">
                  guided by AI.
                </span>
              </motion.h1>

              <motion.div
                variants={fadeUp}
                custom={2}
                className="pl-4 sm:pl-6 border-l-2 border-terracotta/30 mb-8 sm:mb-10"
              >
                <p className="text-base sm:text-lg text-driftwood tracking-wide font-light max-w-sm leading-relaxed">
                  Find harmony in your form. FitVision uses on-device computer
                  vision to correct your posture in real-time — privately and
                  instantly.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                <Link
                  href={isSignedIn ? "/dashboard" : "/tracker"}
                  className="group relative inline-flex items-center justify-between px-8 py-5 bg-charcoal text-parchment rounded-full overflow-hidden transition-all duration-500 hover:bg-terracotta w-fit sm:min-w-[260px] shadow-xl hover:shadow-2xl hover:shadow-terracotta/20"
                >
                  <span className="relative z-10 tracking-[0.15em] uppercase text-xs font-semibold">
                    Begin Session
                  </span>
                  <span className="relative z-10 w-9 h-9 rounded-full bg-parchment/15 flex items-center justify-center transition-all duration-500 group-hover:translate-x-1 group-hover:bg-parchment/25">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link
                  href="#process"
                  className="inline-flex items-center gap-2 text-driftwood text-xs tracking-[0.15em] uppercase font-medium hover:text-charcoal transition-colors"
                >
                  Learn more
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Model Image */}
            <motion.div
              className="w-full lg:w-7/12 relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            >
              <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] bg-linen rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl group border border-warm-sand/40">
                <Image
                  src="/modelman.png"
                  alt="Athlete in motion"
                  fill
                  className="object-cover object-top lg:object-center group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  priority
                />

                {/* Scanning lines effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terracotta/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-parchment/90 backdrop-blur-md border border-white/40 text-[9px] uppercase tracking-widest font-semibold text-charcoal flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                    Vision / Active
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 hidden md:block">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-4 rounded-2xl bg-parchment/95 backdrop-blur-lg border border-white/50 shadow-xl flex items-center gap-4 transition-transform duration-500 group-hover:-translate-y-2"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center text-terracotta">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-driftwood mb-0.5">
                        Tracking Confidence
                      </p>
                      <p className="text-sm font-medium text-charcoal">
                        99.4% precision
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-warm-sand/40 rounded-tr-sm"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-warm-sand/40 rounded-bl-sm"></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-[9px] tracking-[0.3em] uppercase text-driftwood/60 font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-driftwood/40" />
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Marquee Strip */}
      <div className="relative z-10 py-5 bg-charcoal overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="mx-8 text-[10px] tracking-[0.3em] uppercase font-semibold text-parchment/60 flex items-center gap-3"
            >
              <span className="w-1 h-1 rounded-full bg-terracotta" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Ribbon */}
      <section className="relative z-10 py-16 sm:py-20 bg-parchment">
        <div className="max-w-[75rem] mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            {[
              { value: "33", label: "Key Joints Tracked", suffix: "" },
              { value: "99.4", label: "Tracking Precision", suffix: "%" },
              { value: "0", label: "Data Sent to Cloud", suffix: "ms" },
              { value: "51", label: "Exercises Supported", suffix: "+" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-light text-charcoal mb-2 tracking-tight">
                  {stat.value}
                  <span className="text-terracotta">{stat.suffix}</span>
                </div>
                <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-driftwood/70">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Process Section */}
      <section
        id="process"
        className="relative z-10 py-16 sm:py-24 md:py-32 bg-parchment"
      >
        <div className="max-w-[75rem] mx-auto px-6">
          <motion.div
            className="flex flex-col items-center text-center mb-12 sm:mb-16 md:mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] text-sage tracking-[0.3em] font-semibold uppercase mb-4">
              The Method
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tighter text-charcoal mb-8 pb-1">
              Refining Form through{" "}
              <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-sage to-driftwood italic pr-1">
                Technology.
              </span>
            </h2>
            <div className="w-16 h-px bg-warm-sand"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-warm-sand/50 to-transparent -z-10"></div>

            {[
              {
                num: "01",
                title: "Position",
                desc: "Step into the frame. The spatial AI instantly recognizes 33 key joints without any calibration required.",
                icon: <Eye className="w-5 h-5" />,
                gradient: "from-terracotta/10 to-transparent",
              },
              {
                num: "02",
                title: "Perform",
                desc: "Execute your movement. Dynamic guidelines overlay your feed, offering silent but precise feedback.",
                icon: <Zap className="w-5 h-5" />,
                gradient: "from-sage/10 to-transparent",
              },
              {
                num: "03",
                title: "Perfect",
                desc: "Adjust your posture through real-time angle analysis, protecting your joints and maximizing effort.",
                icon: <Target className="w-5 h-5" />,
                gradient: "from-muted-clay/10 to-transparent",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className={`relative flex flex-col items-center text-center group bg-gradient-to-b ${step.gradient} rounded-3xl p-8 md:p-10 border border-warm-sand/30 hover:border-warm-sand/60 transition-all duration-500 hover:shadow-lg hover:-translate-y-1`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-20 h-20 rounded-full bg-parchment border border-warm-sand flex items-center justify-center mb-8 shadow-sm relative">
                  <span className="text-xl font-light text-terracotta">{step.num}</span>
                  <div className="absolute -inset-2 rounded-full border border-warm-sand/40 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
                <div className="w-8 h-8 rounded-full bg-parchment border border-warm-sand/50 flex items-center justify-center text-sage mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-medium text-charcoal mb-4 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-driftwood leading-relaxed font-light text-sm max-w-xs">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy/Features Section */}
      <section
        id="philosophy"
        className="relative z-10 bg-charcoal rounded-2xl sm:rounded-[2.5rem] md:rounded-[4rem] mx-3 sm:mx-4 md:mx-8 mb-8 px-4 sm:px-6 py-16 sm:py-24 md:py-32 overflow-hidden border border-charcoal/40 shadow-2xl"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-terracotta/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sage/[0.05] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] text-[6rem] sm:text-[10rem] md:text-[15rem] font-bold text-parchment pointer-events-none tracking-tighter">
          FITVISION
        </div>

        <div className="max-w-[75rem] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-12 md:mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[10px] text-terracotta tracking-[0.3em] font-semibold uppercase mb-6 block">
                Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-parchment mb-6 sm:mb-8 leading-[1.1] pb-1">
                Designed for{" "}
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-muted-clay italic pr-1">
                  absolute focus.
                </span>
              </h2>
              <p className="text-warm-sand leading-relaxed font-light text-base sm:text-lg mb-8 sm:mb-10">
                We believe technology should quietly empower, never distract. By
                processing everything locally in your browser, FitVision ensures
                lightning-fast feedback without compromising the sanctity of
                your privacy.
              </p>
              <div className="flex gap-12">
                <div>
                  <div className="text-3xl font-light text-parchment mb-1">
                    100<span className="text-terracotta">%</span>
                  </div>
                  <div className="text-[10px] text-warm-sand/60 tracking-widest uppercase font-semibold">
                    Private & Local
                  </div>
                </div>
                <div className="w-px bg-warm-sand/20" />
                <div>
                  <div className="text-3xl font-light text-parchment mb-1">
                    Zero
                  </div>
                  <div className="text-[10px] text-warm-sand/60 tracking-widest uppercase font-semibold">
                    Hardware Req.
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
            >
              {[
                {
                  icon: <Camera className="w-6 h-6" />,
                  title: "Edge Processing",
                  desc: "All computation happens in your browser",
                },
                {
                  icon: <Activity className="w-6 h-6" />,
                  title: "Fluid Kinematics",
                  desc: "Smooth real-time motion analysis",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Secure Protocol",
                  desc: "Zero data leaves your device",
                },
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  title: "Minimal UI",
                  desc: "Clean interface, zero distraction",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="bg-parchment/[0.06] backdrop-blur-sm p-7 rounded-2xl border border-parchment/[0.08] flex flex-col gap-4 hover:bg-parchment/[0.1] hover:border-parchment/[0.15] transition-all duration-500 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-parchment/[0.08] flex items-center justify-center text-terracotta group-hover:bg-terracotta/20 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-sm font-medium tracking-wide text-parchment block mb-1">
                      {item.title}
                    </span>
                    <span className="text-xs text-warm-sand/50 font-light leading-relaxed">
                      {item.desc}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works visual section */}
      <section className="relative z-10 py-20 sm:py-28 bg-parchment overflow-hidden">
        <div className="max-w-[75rem] mx-auto px-6">
          <motion.div
            className="relative bg-linen rounded-3xl border border-warm-sand/40 p-8 sm:p-12 md:p-16 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/[0.04] rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-sage/[0.05] rounded-full blur-[60px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[10px] text-terracotta tracking-[0.3em] font-semibold uppercase mb-6 block">
                  Experience
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tighter text-charcoal mb-6 leading-[1.1]">
                  Your personal AI
                  <br />
                  <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-sage italic pr-1">
                    movement coach.
                  </span>
                </h2>
                <p className="text-driftwood font-light text-base leading-relaxed mb-8">
                  Open your camera, select an exercise, and start moving. FitVision
                  tracks your form in real-time, counts your reps, and provides instant
                  feedback to help you train safer and smarter.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: <Eye className="w-4 h-4" />, text: "Automatic joint detection in milliseconds" },
                    { icon: <Lock className="w-4 h-4" />, text: "100% on-device — your video never leaves the browser" },
                    { icon: <Zap className="w-4 h-4" />, text: "Instant posture feedback with angle analysis" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-parchment border border-warm-sand/50 flex items-center justify-center text-sage shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm text-driftwood font-light">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-warm-sand/40 shadow-xl bg-parchment">
                  <Image
                    src="/modelman.png"
                    alt="FitVision tracking demo"
                    fill
                    className="object-cover"
                  />
                  {/* Overlay UI mockup elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="px-3 py-1.5 rounded-full bg-parchment/90 backdrop-blur-md text-[9px] uppercase tracking-widest font-semibold text-charcoal flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                      Tracking Active
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-sage/90 backdrop-blur-md text-[9px] uppercase tracking-widest font-semibold text-parchment">
                      Good Form
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <motion.div
                  className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-parchment rounded-2xl border border-warm-sand/40 p-4 shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-2xl font-light text-charcoal">12</div>
                  <div className="text-[9px] tracking-widest uppercase text-driftwood font-semibold">Reps</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {!isSignedIn && (
        <motion.section
          className="relative z-10 py-24 sm:py-32 px-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto text-center relative">
            {/* Decorative orbs */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-terracotta/[0.06] blur-[80px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[10px] text-sage tracking-[0.3em] font-semibold uppercase mb-6 block">
                Get Started
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-charcoal mb-4 pb-2">
                Ready to{" "}
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-muted-clay italic pr-2 pb-1 inline-block">
                  begin?
                </span>
              </h2>
              <p className="text-driftwood font-light text-lg mb-10 max-w-md mx-auto">
                Create a free account to track your sessions, save your progress,
                and unlock your potential.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-charcoal text-parchment rounded-full text-sm font-medium tracking-wide hover:bg-terracotta transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-terracotta/20"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-parchment text-charcoal border border-warm-sand/60 rounded-full text-sm font-medium tracking-wide hover:bg-linen hover:border-warm-sand transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="bg-parchment py-12 sm:py-16 px-4 sm:px-8 border-t border-warm-sand/50">
        <div className="max-w-[75rem] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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

            <div className="flex items-center gap-8">
              <Link
                href="#process"
                className="text-[10px] tracking-[0.2em] uppercase text-driftwood hover:text-charcoal transition-colors duration-300"
              >
                Method
              </Link>
              <Link
                href="#philosophy"
                className="text-[10px] tracking-[0.2em] uppercase text-driftwood hover:text-charcoal transition-colors duration-300"
              >
                Philosophy
              </Link>
              <Link
                href="/disclaimer"
                className="text-[10px] tracking-[0.2em] uppercase text-sage hover:text-terracotta transition-colors duration-300"
              >
                Disclaimer
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-warm-sand/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-medium text-driftwood/60 tracking-[0.2em] uppercase">
              © {new Date().getFullYear()} FitVision. Cultivating mindful
              movement.
            </p>
            <p className="text-[10px] text-driftwood/40 tracking-wide">
              Built with care. Powered by on-device AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
