import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import SkipToContent from "./components/SkipToContent";
import { ToastProvider } from "./components/ui/ToastProvider";
import { SoundEffectsProvider } from "./components/SoundEffects";
import { ThemeProvider } from "./components/ThemeProvider";
import KeyboardShortcutsProvider from "./components/KeyboardShortcutsProvider";
import ReminderNotificationProvider from "./components/ReminderNotificationProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reel Picks - Discover Your Next Favorite Film",
  description: "Explore movies, discover new favorites, and manage your personal movie collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', prefersDark);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200`}
      >
        <SkipToContent />
        <ThemeProvider>
          <SoundEffectsProvider>
            <ToastProvider>
              <KeyboardShortcutsProvider>
                <ReminderNotificationProvider />
                <ErrorBoundary>
                  <Header />
                </ErrorBoundary>
                <ErrorBoundary>
                  <main id="main-content" className="min-h-screen page-transition" tabIndex={-1}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                      {children}
                    </div>
                  </main>
                </ErrorBoundary>
              </KeyboardShortcutsProvider>
            </ToastProvider>
          </SoundEffectsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
