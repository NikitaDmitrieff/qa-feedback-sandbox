import type { Metadata } from 'next'
import './styles/globals.css'
import styles from './styles/globals.module.css'
import layoutStyles from './layout.module.css'
import { Sidebar } from './components/Sidebar'
import { ThemeCustomizer } from './components/ThemeCustomizer'

export const metadata: Metadata = {
  title: 'Minions Smoke Test',
  description: 'Minimal Next.js app for minions pipeline testing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <div className={layoutStyles.appLayout}>
          <Sidebar />
          <div className={layoutStyles.pageContent}>
            {children}
          </div>
        </div>
        <ThemeCustomizer />
      </body>
    </html>
  )
}
