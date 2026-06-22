import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { KeepAlive } from './KeepAlive'
import { JarvisAssistant } from '@/components/jarvis/JarvisAssistant'
import { SenseAlert } from '@/components/jarvis/SenseAlert'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI CTO — Generate System Architecture Instantly',
  description: 'Type a startup idea, get complete system architecture in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}>
        <KeepAlive />
        <JarvisAssistant />
        <SenseAlert />
        {children}
      </body>
    </html>
  )
}
