"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Simple type fix: just allow any props that the Provider accepts
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}