import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitVision — Mindful Movement, Guided by AI",
  description:
    "On-device computer vision for real-time posture correction and exercise tracking.",
  icons: {
    icon: "/logo-nobg.png",
    apple: "/logo-nobg.png",
  },
};

const clerkAppearance = {
  elements: {
    formButtonPrimary:
      "bg-terracotta hover:bg-charcoal text-parchment rounded-xl shadow-md transition-all duration-500 text-xs uppercase tracking-[0.15em] font-semibold",
    card: "shadow-xl shadow-charcoal/5 rounded-2xl",
    headerTitle: "font-serif text-charcoal",
    headerSubtitle: "text-driftwood",
    socialButtonsBlockButton:
      "border border-warm-sand/40 text-charcoal hover:bg-warm-sand/20 rounded-xl transition-all duration-300",
    formFieldInput:
      "border-warm-sand/40 text-charcoal rounded-xl focus:border-terracotta focus:ring-terracotta/20",
    footerActionLink:
      "text-terracotta hover:text-charcoal transition-colors duration-300",
    userButtonPopoverCard:
      "bg-linen border border-warm-sand/30 rounded-2xl shadow-xl",
    userButtonPopoverActionButton:
      "hover:bg-warm-sand/20 text-charcoal rounded-lg",
    userButtonPopoverActionButtonText: "text-charcoal text-sm",
    userButtonPopoverFooter: "hidden",
    userPreviewMainIdentifier: "text-charcoal font-medium",
    userPreviewSecondaryIdentifier: "text-driftwood",
  },
  variables: {
    colorPrimary: "#b5674a",
    colorText: "#3c3831",
    colorTextSecondary: "#8b6b4a",
    colorBackground: "#f2ede4",
    colorInputBackground: "#f2ede4",
    colorInputText: "#3c3831",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontFamilyButtons: "var(--font-dm-sans), sans-serif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <body
          className={`${cormorant.variable} ${dmSans.variable} ${geistMono.variable} antialiased bg-parchment text-charcoal`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
