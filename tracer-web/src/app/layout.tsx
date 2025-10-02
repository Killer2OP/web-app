import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { HydrationFix } from "@/components/HydrationFix";

// Configure Google Fonts for the application
// Geist Sans - Modern, clean sans-serif font for UI text
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono - Monospace font for code and technical content
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO metadata for the application
export const metadata: Metadata = {
  title: "Traycer - AI-Powered Development Planning",
  description: "Streamline your development workflow with AI-powered task and agent management",
};

/**
 * Root layout component - wraps all pages in the application
 * 
 * This component provides:
 * - Global font configuration (Geist Sans & Mono)
 * - Theme provider for dark/light mode switching
 * - Hydration fix to prevent SSR/client mismatch issues
 * - Basic page structure with header, main content, and footer
 * - Suppression of hydration warnings for browser compatibility
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
        data-suppress-hydration-warning="true"
      >
        {/* Theme provider enables dark/light mode switching */}
        <ThemeProvider>
          {/* Fix for hydration mismatches caused by browser extensions */}
          <HydrationFix />
          
          {/* Main application structure */}
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer with developer attribution */}
            <footer className="bg-card border-t border-border py-4 px-6">
              <div className="text-center text-sm text-muted-foreground">
                Developed by <span className="font-medium text-foreground">Pratham Mahajan</span>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
