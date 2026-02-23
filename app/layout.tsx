import type { Metadata } from 'next'
import { Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import './styles/globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MINIONS — Autonomous Code Generation',
  description: 'A website written, reviewed, and deployed entirely by AI agents. No humans were involved in the making of this page.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
