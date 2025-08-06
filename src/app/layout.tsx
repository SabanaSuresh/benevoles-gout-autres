import type { Metadata } from "next"
import { Lato, Glass_Antiqua } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/components/ClientLayout"

// Lato : Regular et Light
const lato = Lato({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-lato",
})

// Glass Antiqua pour les titres
const glassAntiqua = Glass_Antiqua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-glass",
})

export const metadata: Metadata = {
  title: "Gestion des bénévoles",
  description: "Application du tiers-lieu Le Goût des Autres",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        {/* ✅ PWA support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3e878e" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${lato.variable} ${glassAntiqua.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
