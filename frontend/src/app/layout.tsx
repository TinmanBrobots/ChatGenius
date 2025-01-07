import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChatGenius",
  description: "A Slack-like chat interface with modern features",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

