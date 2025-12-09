#!/bin/bash

# Create directory if not exi
cat << 'EOF' > src/app/layout.tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import BottomNav from "@/components/layout/BottomNav"; // Import the Nav

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aboki V2",
  icons: { icon: "/abokiicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        // Updated global background to your new dark preference
        "min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] font-sans antialiased transition-colors duration-300", 
        bricolage.variable
      )}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            {/* Persistent Bottom Navigation */}
            <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF
