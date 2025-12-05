import { TRPCProvider } from '@/lib/trpc/provider'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TodoTalk',
  description: 'Team task management and real-time chat collaboration',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://todotalk.fly.dev',
  ),
}

// Enable static optimization for layout
export const dynamic = 'auto'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
