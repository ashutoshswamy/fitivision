import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FitVision",
  url: "https://fitvision.tech",
  description:
    "AI-powered fitness tracker with real-time pose detection, posture correction, and personalized workout plans — all on-device.",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time pose detection",
    "Posture correction",
    "Rep counting",
    "AI workout plan generation",
    "51+ supported exercises",
    "On-device processing",
    "Privacy-first design",
  ],
};

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fitvision.tech"),
  title: {
    default: "FitVision — AI-Powered Fitness Tracker with Real-Time Pose Detection",
    template: "%s | FitVision",
  },
  description:
    "Track your workouts with real-time AI pose detection. Get instant posture correction, rep counting, and personalized workout plans — all on-device, no hardware needed. Privacy-first fitness technology.",
  keywords: [
    "AI fitness tracker",
    "pose detection",
    "real-time posture correction",
    "exercise tracking",
    "workout tracker",
    "rep counter",
    "AI workout planner",
    "computer vision fitness",
    "on-device AI",
    "privacy-first fitness",
    "home workout tracker",
    "form correction",
    "MediaPipe pose",
    "webcam fitness",
  ],
  authors: [{ name: "FitVision" }],
  creator: "FitVision",
  publisher: "FitVision",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fitvision.tech",
    siteName: "FitVision",
    title: "FitVision — AI-Powered Fitness Tracker with Real-Time Pose Detection",
    description:
      "Track your workouts with real-time AI pose detection. Instant posture correction, rep counting, and personalized plans — all on-device, privacy-first.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FitVision — AI-Powered Real-Time Fitness Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitVision — AI-Powered Fitness Tracker",
    description:
      "Real-time pose detection, posture correction, and rep counting — all on-device with zero hardware needed.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://fitvision.tech",
  },
  category: "fitness",
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
