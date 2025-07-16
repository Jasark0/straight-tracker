import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/src/app/styles/General.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Straight Tracker',
    default: 'Straight Tracker',
  },
  description: 'Welcome to Straight Tracker, your go-to app for tracking pool matches and player statistics.',
  icons:{
    icon: '/straight-tab-logo.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
