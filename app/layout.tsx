import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Loaded via <link> stylesheets below (same approach as the original Stitch
// export) rather than next/font/google, so production builds never depend
// on reaching fonts.googleapis.com at build time — only the visitor's
// browser fetches these, same as any normal Google Fonts embed.

export const metadata: Metadata = {
  title: `${siteConfig.cafeName} — ${siteConfig.tagline}`,
  description:
    "A neighborhood café and roastery in Salcedo Village, Makati. Coffee, sourdough, and somewhere unhurried to sit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* eslint-disable @next/next/no-page-custom-font -- App Router root
          layout applies to every route, so this rule's Pages Router
          "single page" warning does not apply here. */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      {/* eslint-enable @next/next/no-page-custom-font */}
      <body className="bg-surface text-on-surface font-body-md text-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
