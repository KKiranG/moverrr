import type { Metadata, Viewport } from "next";

import { AppClientEffects } from "@/components/layout/app-client-effects";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://moverrr.com.au"),
  title: {
    default: "Need-first spare-capacity moves in Sydney",
    template: "%s · moverrr",
  },
  description:
    "Declare the move need first and get ranked spare-capacity matches with clear pricing, fit notes, and trust signals.",
  openGraph: {
    title: "moverrr",
    description:
      "Need-first spare-capacity matching for awkward-middle moves in Sydney.",
    type: "website",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className="antialiased">
        <div className="min-h-screen bg-background">
          <AppClientEffects />
          <a
            href="#main-content"
            className="sr-only rounded bg-[var(--bg-elevated-1)] px-4 py-2 text-sm font-medium text-text focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
          >
            Skip to main content
          </a>
          <div className="mx-auto min-h-screen max-w-[430px]">{children}</div>
        </div>
      </body>
    </html>
  );
}
