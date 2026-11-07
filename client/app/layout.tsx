import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
import "../styles/tokens.css";
import CookieConsent from "@/components/CookieConsent";

const inter = localFont({
  src: [
    { path: "../fonts/inter/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter/inter-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UQZERA",
  description: "Ephemeral encrypted messenger",
};

export const viewport: Viewport = {
  themeColor: "#0a0e16",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce");

  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        {nonce && <meta name="x-nonce" content={nonce} />}
      </head>
      <body className="font-sans bg-surface text-on-surface antialiased">
        <div className="liquid-bg" aria-hidden="true">
          <div className="blob" style={{ width: 400, height: 400, top: "10%", left: "20%" }} />
          <div className="blob" style={{ width: 350, height: 350, top: "60%", left: "70%" }} />
          <div className="blob" style={{ width: 300, height: 300, top: "40%", left: "50%" }} />
        </div>
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}