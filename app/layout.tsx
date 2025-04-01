import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"


const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MJ's Haven - Luxury Shortlet Stays",
  description: "Find and book premium short-term rentals with ease.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          <NotificationsProvider>
            <Sidebar />
            <main className="lg:pl-[280px] transition-all duration-300">{children}</main>
            <Toaster />
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}