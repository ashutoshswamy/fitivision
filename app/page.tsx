"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
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

export default function Home() {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-parchment text-charcoal font-sans selection:bg-terracotta selection:text-parchment">
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
                className="flex items-center gap-2 text-parchment bg-charcoal px-4 py-2 rounded-full hover:bg-charcoal/85 transition-colors duration-300"
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
      <main className="relative min-h-[100svh] flex flex-col justify-end lg:justify-center border-b border-warm-sand/50 bg-parchment">
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/heropage.png"
            alt="FitVision hero background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-r from-parchment/90 via-parchment/60 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-parchment/80 to-transparent"></div>
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
                <span className="font-medium text-muted-clay italic">
                  guided by AI.
                </span>
              </motion.h1>

              <motion.div
                variants={fadeUp}
                custom={2}
                className="pl-4 sm:pl-6 border-l border-warm-sand mb-8 sm:mb-10"
              >
                <p className="text-base sm:text-lg text-driftwood tracking-wide font-light max-w-sm leading-relaxed">
                  Find harmony in your form. FitVision uses on-device computer
                  vision to correct your posture in real-time.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
              >
                <Link
                  href={isSignedIn ? "/dashboard" : "/tracker"}
                  className="group relative inline-flex items-center justify-between px-8 py-5 bg-terracotta text-parchment rounded-full overflow-hidden transition-all duration-500 hover:bg-charcoal w-fit sm:min-w-[240px] shadow-lg"
                >
                  <span className="relative z-10 tracking-[0.15em] uppercase text-xs font-semibold">
                    Begin Session
                  </span>
                  <span className="relative z-10 w-8 h-8 rounded-full bg-parchment/20 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-2">
                    <ArrowRight className="w-5 h-5" />
                  </span>
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
              <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] bg-linen rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl group border border-warm-sand/50">
                <Image
                  src="/modelman.png"
                  alt="Athlete in motion"
                  fill
                  className="object-cover object-top lg:object-center group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  priority
                />

                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-parchment/90 backdrop-blur-md border border-white/40 text-[9px] uppercase tracking-widest font-semibold text-charcoal">
                    Vision / Active
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 hidden md:block">
                  <div className="p-4 rounded-2xl bg-parchment/95 backdrop-blur-lg border border-white/50 shadow-lg flex items-center gap-4 transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="w-10 h-10 rounded-full bg-linen flex items-center justify-center text-terracotta">
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
                  </div>
                </div>

                <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-warm-sand/50"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-warm-sand/50"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

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
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-charcoal mb-8">
              Refining Form through Technology.
            </h2>
            <div className="w-16 h-px bg-warm-sand"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 relative">
            <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-px bg-warm-sand/50 -z-10"></div>

            {[
              {
                num: "01",
                title: "Position",
                desc: "Step into the frame. The spatial AI instantly recognizes 33 key joints without any calibration required.",
              },
              {
                num: "02",
                title: "Perform",
                desc: "Execute your movement. Dynamic guidelines overlay your feed, offering silent but precise feedback.",
              },
              {
                num: "03",
                title: "Perfect",
                desc: "Adjust your posture through real-time angle analysis, protecting your joints and maximizing effort.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center group mt-4 md:mt-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-20 h-20 rounded-full bg-parchment border border-warm-sand flex items-center justify-center text-xl font-light text-terracotta mb-8 shadow-sm group-hover:bg-linen transition-colors relative">
                  {step.num}
                  <div className="absolute -inset-2 rounded-full border border-warm-sand scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"></div>
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
        className="relative z-10 bg-linen rounded-2xl sm:rounded-[2.5rem] md:rounded-[4rem] mx-3 sm:mx-4 md:mx-8 mb-8 px-4 sm:px-6 py-16 sm:py-24 md:py-32 overflow-hidden border border-warm-sand/40 shadow-sm"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[6rem] sm:text-[10rem] md:text-[15rem] font-bold text-charcoal pointer-events-none tracking-tighter mix-blend-overlay">
          AESTHETIC
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-charcoal mb-6 sm:mb-8 leading-[1.1]">
                Designed for{" "}
                <span className="font-medium text-muted-clay italic">
                  absolute focus.
                </span>
              </h2>
              <p className="text-driftwood leading-relaxed font-light text-base sm:text-lg mb-6 sm:mb-8">
                We believe technology should quietly empower, never distract. By
                processing everything locally in your browser, FitVision ensures
                lightning-fast feedback without compromising the sanctity of
                your privacy.
              </p>
              <div className="flex gap-12">
                <div>
                  <div className="text-2xl font-light text-charcoal mb-1">
                    100%
                  </div>
                  <div className="text-[10px] text-sage tracking-widest uppercase font-semibold">
                    Private & Local
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-light text-charcoal mb-1">
                    Zero
                  </div>
                  <div className="text-[10px] text-sage tracking-widest uppercase font-semibold">
                    Hardware Req.
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
            >
              {[
                {
                  icon: <Camera className="w-6 h-6" />,
                  title: "Edge Processing",
                },
                {
                  icon: <Activity className="w-6 h-6" />,
                  title: "Fluid Kinematics",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Secure Protocol",
                },
                { icon: <Sparkles className="w-6 h-6" />, title: "Minimal UI" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="bg-parchment p-8 rounded-3xl border border-warm-sand/50 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition-transform hover:-translate-y-1 duration-300"
                >
                  <div className="text-sage">{item.icon}</div>
                  <span className="text-sm font-medium tracking-wide text-charcoal">
                    {item.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isSignedIn && (
        <motion.section
          className="relative z-10 py-20 px-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-charcoal mb-4">
              Ready to begin?
            </h2>
            <p className="text-driftwood font-light mb-8">
              Create a free account to track your sessions and progress.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 bg-terracotta text-parchment rounded-full text-sm font-medium tracking-wide hover:bg-charcoal transition-colors shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linen text-charcoal border border-warm-sand/50 rounded-full text-sm font-medium tracking-wide hover:bg-warm-sand/30 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        </motion.section>
      )}

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
