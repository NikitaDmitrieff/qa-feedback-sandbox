import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minions Smoke Test',
  description: 'Minimal Next.js app for minions pipeline testing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '2rem', maxWidth: 600, marginInline: 'auto' }}>
        {children}
      </body>
    </html>
  )
}
