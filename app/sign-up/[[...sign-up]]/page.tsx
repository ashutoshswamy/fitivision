import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-6 relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-sage/5 blur-3xl animate-blob" />
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-terracotta/5 blur-3xl animate-blob"
        style={{ animationDelay: "2s" }}
      />

      {/* Background watermark */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] sm:text-[20rem] font-bold text-charcoal tracking-tighter font-serif">
          FV
        </div>
      </div>

      {/* Logo & back link */}
      <div className="absolute top-5 left-4 sm:top-8 sm:left-8 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo-nobg.png"
            alt="FitVision"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
          <span className="font-serif text-lg font-light tracking-wide">
            FitVision
          </span>
        </Link>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header text */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-terracotta font-semibold mb-2 sm:mb-3 flex items-center justify-center gap-3">
            <span className="w-6 h-px bg-terracotta" />
            Begin Your Journey
            <span className="w-6 h-px bg-terracotta" />
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-charcoal">
            Create your <span className="italic text-muted-clay">studio</span>
          </h1>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              cardBox: "w-full shadow-none",
              card: "bg-linen/80 backdrop-blur-sm border border-warm-sand/30 shadow-xl shadow-charcoal/5 rounded-2xl p-6 w-full",
              headerTitle:
                "font-serif text-charcoal text-xl font-light tracking-tight",
              headerSubtitle: "text-driftwood text-sm font-light tracking-wide",
              socialButtonsBlockButton:
                "bg-parchment border border-warm-sand/40 text-charcoal hover:bg-warm-sand/20 hover:border-warm-sand/60 transition-all duration-300 rounded-xl font-sans text-sm",
              socialButtonsBlockButtonText: "text-charcoal font-medium text-sm",
              dividerLine: "bg-warm-sand/40",
              dividerText:
                "text-driftwood/60 text-xs uppercase tracking-widest",
              formFieldLabel:
                "text-driftwood text-xs tracking-wider uppercase font-medium",
              formFieldInput:
                "bg-parchment border-warm-sand/40 text-charcoal rounded-xl focus:border-terracotta focus:ring-terracotta/20 placeholder:text-warm-sand font-sans transition-all duration-300",
              formButtonPrimary:
                "bg-terracotta hover:bg-charcoal text-parchment rounded-xl shadow-md hover:shadow-lg transition-all duration-500 text-xs uppercase tracking-[0.15em] font-semibold py-3",
              footerActionLink:
                "text-terracotta hover:text-charcoal transition-colors duration-300 font-medium",
              footerActionText: "text-driftwood text-sm",
              identityPreviewEditButton: "text-terracotta hover:text-charcoal",
              formFieldAction: "text-terracotta hover:text-charcoal text-xs",
              alertText: "text-terracotta text-sm",
              otpCodeFieldInput: "border-warm-sand/40 text-charcoal rounded-lg",
              formResendCodeLink: "text-terracotta hover:text-charcoal",
              footer: "bg-transparent",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: false,
            },
          }}
        />
      </div>
    </div>
  );
}
