import type { Metadata } from 'next'
import { DesignAuditDashboard } from './DesignAuditDashboard'

export const metadata: Metadata = {
  title: 'Design Audit — Minions Smoke Test',
  description: 'WCAG AA/AAA contrast compliance audit for all design tokens',
}

export default function DesignAuditPage() {
  return <DesignAuditDashboard />
}
