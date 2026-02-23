import type { Metadata } from 'next'
import './styles/globals.css'
import styles from './styles/globals.module.css'

export const metadata: Metadata = {
  title: 'Minions Smoke Test',
  description: 'Minimal Next.js app for minions pipeline testing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={styles.body}>
        {children}
      </body>
    </html>
  )
}
