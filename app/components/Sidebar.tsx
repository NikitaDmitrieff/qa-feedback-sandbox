'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/design-system', label: 'Design System' },
  { href: '/components-showcase', label: 'Components' },
  { href: '/design-audit', label: 'Design Audit' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>Design System</div>
      <ul className={styles.navList} role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={styles.navLink}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
