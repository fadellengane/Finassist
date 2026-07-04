import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BottomNav } from "@/components/BottomNav";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FinAssist — Peux-tu te le permettre ?",
  description: "L'assistant financier personnel qui te dit si tu peux vraiment te permettre une dépense.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinAssist",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={manrope.variable}>
      <body className="font-sans font-normal bg-canvas-light dark:bg-canvas-dark text-ink-light dark:text-ink-dark antialiased">
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-md flex-col">
            <main className="flex-1 pb-28 safe-top">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
