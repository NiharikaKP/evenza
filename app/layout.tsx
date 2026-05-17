import type { Metadata } from "next"
import { Geist_Mono, Raleway, EB_Garamond } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { InstallPrompt } from "@/components/shared/InstallPrompt"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Evenza',
  description: 'Discover and register for events at your university',
  manifest: '/manifest.webmanifest',
}

const ebGaramondHeading = EB_Garamond({subsets:['latin'],variable:'--font-heading'});

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", raleway.variable, ebGaramondHeading.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
