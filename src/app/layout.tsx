import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Providers } from "@/components/providers";
import { AuthInitializer } from "@/components/auth-initializer";
import { MigrationBanner } from "@/components/migration-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polyseer | See the future.",
  description: "AI-powered deep research for prediction markets. Paste any Polymarket or Kalshi URL and get an analyst-grade research report in seconds.",
  keywords: ["polymarket", "kalshi", "prediction markets", "AI deep research", "forecasting", "analysis"],
  authors: [{ name: "Polyseer" }],
  openGraph: {
    title: "Polyseer | See the future.",
    description: "AI-powered deep research for prediction markets. Supports Polymarket and Kalshi.",
    url: "https://polyseer.xyz",
    siteName: "Polyseer",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Verdict: ✅ YES • Confidence 78% • polyseer.xyz",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polyseer | See the future.",
    description: "AI-powered deep research for prediction markets. Supports Polymarket and Kalshi.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else if (theme === 'system') {
                    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.add(systemDark ? 'dark' : 'light');
                  } else {
                    root.classList.add('light');
                  }
                } catch (e) {
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}
      >
        <Providers>
          <AuthInitializer>
            <MigrationBanner />
            {/* 深色背景 */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black" />
            <Header />
            <main className="relative min-h-screen">{children}</main>
            
            {/* Fixed Footer Elements - Left */}
            <div className="fixed bottom-0 left-4 z-40 pointer-events-none">
              <div className="pb-4">
                <div className="relative pointer-events-auto">
                  <div className="relative bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-sm text-white/70">
                      基于{' '}
                      <a
                        href="https://github.com/yorkeccak/Polyseer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 hover:text-white font-medium transition-colors underline underline-offset-2"
                      >
                        GitHub 开源项目
                      </a>
                      {' '}开发
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer Elements - Right */}
            <div className="fixed bottom-0 right-4 z-40 pointer-events-none">
              <div className="pb-4 flex items-center gap-3">
                {/* Terms of Service Link */}
                <div className="relative pointer-events-auto">
                  <div className="relative bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <a
                      href="/terms"
                      className="text-sm text-white/80 hover:text-white/100 font-medium transition-colors underline underline-offset-2"
                    >
                      条款
                    </a>
                  </div>
                </div>

                {/* Not Financial Advice - Far Right */}
                <div className="relative pointer-events-auto">
                  <div className="relative bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-sm text-white/90 font-medium">非投资建议</span>
                  </div>
                </div>
              </div>
            </div>
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}
