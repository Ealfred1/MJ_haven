import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./clientLayout"

export const metadata: Metadata = {
  title: "MJ's Haven - Luxury Shortlet Stays",
  description: "Find and book premium short-term rentals with ease.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}

