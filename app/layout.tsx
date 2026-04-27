import type { Metadata } from 'next'
import { Prata, Inter } from 'next/font/google'
import './globals.css'
import PostHogProvider from './components/layout/PostHogProvider'

const prata = Prata({
  subsets: ['latin'],
  weight: '400',
  variable: '--loaded-prata',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--loaded-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Funding Mix Calculator — MedAxis AI',
  description: 'A free calculator for life sciences founders combining grants, tax credits, and equity.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prata.variable} ${inter.variable}`}>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
