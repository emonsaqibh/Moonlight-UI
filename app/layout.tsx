import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { themeInitScript } from "@/components/app/theme"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Moonlight",
  description: "The Moonlight UI demo app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
