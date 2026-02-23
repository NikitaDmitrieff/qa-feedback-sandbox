'use client'

import { useState, useMemo } from 'react'
import { contrastRatioValue, meetsWcagAA, meetsWcagAAA } from '@/app/lib/contrast'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Category = 'primary' | 'gray' | 'semantic' | 'surface'

interface DesignToken {
  name: string
  token: string
  hex: string
  category: Category
}

interface ContrastResult {
  id: string
  fg: DesignToken
  bgLabel: string
  bgHex: string
  ratio: number
  aaPass: boolean
  aaaPass: boolean
  aaLargePass: boolean
  guidance: string
}

// ─────────────────────────────────────────────────────────────
// Static Token Data
// ─────────────────────────────────────────────────────────────

const TOKENS: DesignToken[] = [
  // Primary
  { name: 'primary-50',  token: '--color-primary-50',  hex: '#eff6ff', category: 'primary' },
  { name: 'primary-100', token: '--color-primary-100', hex: '#dbeafe', category: 'primary' },
  { name: 'primary-200', token: '--color-primary-200', hex: '#bfdbfe', category: 'primary' },
  { name: 'primary-300', token: '--color-primary-300', hex: '#93c5fd', category: 'primary' },
  { name: 'primary-400', token: '--color-primary-400', hex: '#60a5fa', category: 'primary' },
  { name: 'primary-500', token: '--color-primary-500', hex: '#3b82f6', category: 'primary' },
  { name: 'primary-600', token: '--color-primary-600', hex: '#2563eb', category: 'primary' },
  { name: 'primary-700', token: '--color-primary-700', hex: '#1d4ed8', category: 'primary' },
  { name: 'primary-800', token: '--color-primary-800', hex: '#1e40af', category: 'primary' },
  { name: 'primary-900', token: '--color-primary-900', hex: '#1e3a8a', category: 'primary' },
  // Gray
  { name: 'gray-50',  token: '--color-gray-50',  hex: '#f9fafb', category: 'gray' },
  { name: 'gray-100', token: '--color-gray-100', hex: '#f3f4f6', category: 'gray' },
  { name: 'gray-200', token: '--color-gray-200', hex: '#e5e7eb', category: 'gray' },
  { name: 'gray-300', token: '--color-gray-300', hex: '#d1d5db', category: 'gray' },
  { name: 'gray-400', token: '--color-gray-400', hex: '#9ca3af', category: 'gray' },
  { name: 'gray-500', token: '--color-gray-500', hex: '#6b7280', category: 'gray' },
  { name: 'gray-600', token: '--color-gray-600', hex: '#4b5563', category: 'gray' },
  { name: 'gray-700', token: '--color-gray-700', hex: '#374151', category: 'gray' },
  { name: 'gray-800', token: '--color-gray-800', hex: '#1f2937', category: 'gray' },
  { name: 'gray-900', token: '--color-gray-900', hex: '#111827', category: 'gray' },
  // Semantic
  { name: 'success', token: '--color-success', hex: '#16a34a', category: 'semantic' },
  { name: 'warning', token: '--color-warning', hex: '#d97706', category: 'semantic' },
  { name: 'error',   token: '--color-error',   hex: '#dc2626', category: 'semantic' },
  { name: 'info',    token: '--color-info',    hex: '#0284c7', category: 'semantic' },
  // Surface
  { name: 'background', token: '--color-background', hex: '#ffffff', category: 'surface' },
  { name: 'surface',    token: '--color-surface',    hex: '#f9fafb', category: 'surface' },
  { name: 'text',       token: '--color-text',       hex: '#111827', category: 'surface' },
  { name: 'text-muted', token: '--color-text-muted', hex: '#6b7280', category: 'surface' },
]

const BG_REFERENCES = [
  { label: 'White',   hex: '#ffffff' },
  { label: 'Black',   hex: '#000000' },
  { label: 'Surface', hex: '#f9fafb' },
]

const CATEGORIES: Category[] = ['primary', 'gray', 'semantic', 'surface']

const CATEGORY_LABELS: Record<Category, string> = {
  primary:  'Primary',
  gray:     'Gray',
  semantic: 'Semantic',
  surface:  'Surface',
}

const tokensByCategory = CATEGORIES.reduce<Record<Category, DesignToken[]>>(
  (acc, cat) => { acc[cat] = TOKENS.filter((t) => t.category === cat); return acc },
  { primary: [], gray: [], semantic: [], surface: [] },
)

// ─────────────────────────────────────────────────────────────
// Contrast Computation (runs once at module load)
// ─────────────────────────────────────────────────────────────

function buildGuidance(ratio: number, aaPass: boolean, aaaPass: boolean): string {
  if (aaaPass)  return `${ratio.toFixed(2)}:1 — passes WCAG AAA`
  if (aaPass)   return `${ratio.toFixed(2)}:1 — passes WCAG AA, not AAA`
  if (ratio >= 3) return `${ratio.toFixed(2)}:1 — large-text AA only`
  return `${ratio.toFixed(2)}:1 — fails WCAG AA (needs 4.5:1)`
}

const ALL_RESULTS: ContrastResult[] = TOKENS.flatMap((token) =>
  BG_REFERENCES.map((bg) => {
    const ratio      = contrastRatioValue(token.hex, bg.hex)
    const aaPass     = meetsWcagAA(token.hex, bg.hex)
    const aaaPass    = meetsWcagAAA(token.hex, bg.hex)
    const aaLargePass = meetsWcagAA(token.hex, bg.hex, true)
    return {
      id:         `${token.token}::${bg.label}`,
      fg:         token,
      bgLabel:    bg.label,
      bgHex:      bg.hex,
      ratio,
      aaPass,
      aaaPass,
      aaLargePass,
      guidance:   buildGuidance(ratio, aaPass, aaaPass),
    }
  }),
)

const TOTAL      = ALL_RESULTS.length
const AA_PASSING = ALL_RESULTS.filter((r) => r.aaPass).length

// ─────────────────────────────────────────────────────────────
// Export helper
// ─────────────────────────────────────────────────────────────

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function StatusBadge({ pass }: { pass: boolean }) {
  return (
    <span
      className={pass ? styles.badgePass : styles.badgeFail}
      role="img"
      aria-label={pass ? 'Pass' : 'Fail'}
    >
      {pass ? 'Pass' : 'Fail'}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export function DesignAuditDashboard() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter,   setStatusFilter]   = useState<'all' | 'pass' | 'fail'>('all')
  const [wcagLevel,      setWcagLevel]      = useState<'AA' | 'AAA'>('AA')

  const healthScore = Math.round((AA_PASSING / TOTAL) * 100)

  const filteredResults = useMemo(() => {
    return ALL_RESULTS.filter((r) => {
      if (categoryFilter !== 'all' && r.fg.category !== categoryFilter) return false
      if (statusFilter !== 'all') {
        const passes = wcagLevel === 'AA' ? r.aaPass : r.aaaPass
        if (statusFilter === 'pass' && !passes) return false
        if (statusFilter === 'fail' &&  passes) return false
      }
      return true
    })
  }, [categoryFilter, statusFilter, wcagLevel])

  function handleExport() {
    downloadJSON(
      {
        generated: new Date().toISOString(),
        summary: {
          totalPairs:       TOTAL,
          wcagAAPassCount:  AA_PASSING,
          wcagAAFailCount:  TOTAL - AA_PASSING,
          healthScore,
        },
        pairs: ALL_RESULTS.map((r) => ({
          foreground:        r.fg.token,
          foregroundHex:     r.fg.hex,
          background:        r.bgLabel,
          backgroundHex:     r.bgHex,
          contrastRatio:     parseFloat(r.ratio.toFixed(2)),
          wcagAA:            r.aaPass,
          wcagAAA:           r.aaaPass,
          wcagAALargeText:   r.aaLargePass,
          guidance:          r.guidance,
        })),
      },
      'wcag-compliance-report.json',
    )
  }

  const barColor =
    healthScore >= 80 ? 'var(--color-success)' :
    healthScore >= 50 ? 'var(--color-warning)' :
    'var(--color-error)'

  return (
    <main className={styles.main}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.pageTitle}>Design Audit</h1>
            <p className={styles.pageSubtitle}>
              WCAG AA/AAA contrast compliance across all design tokens
            </p>
          </div>

          <div className={styles.headerActions}>
            <div
              className={styles.healthScoreCard}
              aria-label={`Token Health Score: ${healthScore}%`}
            >
              <div className={styles.healthScoreLabel}>Token Health Score</div>
              <span className={styles.healthScoreValue}>{healthScore}%</span>
              <div className={styles.healthScoreBar} aria-hidden="true">
                <div
                  className={styles.healthScoreBarFill}
                  style={{ '--score': healthScore, '--bar-color': barColor } as React.CSSProperties}
                />
              </div>
              <div className={styles.healthScoreSub}>
                {AA_PASSING} / {TOTAL} pairs pass WCAG AA
              </div>
            </div>

            <button
              className={styles.exportButton}
              onClick={handleExport}
              type="button"
            >
              Export Report (JSON)
            </button>
          </div>
        </div>
      </header>

      {/* ── Token Tree ── */}
      <section className={styles.section} aria-labelledby="token-tree-heading">
        <h2 id="token-tree-heading" className={styles.sectionTitle}>Token Tree</h2>
        <div className={styles.tokenTree}>
          {CATEGORIES.map((cat) => (
            <details key={cat} className={styles.treeCategory} open>
              <summary className={styles.treeCategorySummary}>
                <span className={styles.treeCategoryLabel}>{CATEGORY_LABELS[cat]}</span>
                <span className={styles.treeCategoryCount}>
                  {tokensByCategory[cat].length} tokens
                </span>
              </summary>
              <ul className={styles.tokenList} role="list">
                {tokensByCategory[cat].map((token) => (
                  <li key={token.token} className={styles.tokenItem}>
                    <div
                      className={styles.tokenSwatch}
                      style={{ '--token-color': token.hex } as React.CSSProperties}
                      aria-hidden="true"
                    />
                    <code className={styles.tokenName}>{token.token}</code>
                    <span className={styles.tokenHex}>{token.hex}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* ── Contrast Audit ── */}
      <section className={styles.section} aria-labelledby="contrast-audit-heading">
        <h2 id="contrast-audit-heading" className={styles.sectionTitle}>Contrast Audit</h2>

        {/* Filter bar */}
        <div className={styles.filterBar} role="group" aria-label="Filter contrast results">
          <label className={styles.filterLabel} htmlFor="category-filter">
            Category
          </label>
          <select
            id="category-filter"
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          <label className={styles.filterLabel} htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pass' | 'fail')}
          >
            <option value="all">All</option>
            <option value="pass">Pass only</option>
            <option value="fail">Fail only</option>
          </select>

          <div className={styles.wcagToggle} role="group" aria-label="WCAG level">
            <button
              className={wcagLevel === 'AA' ? styles.wcagBtnActive : styles.wcagBtn}
              onClick={() => setWcagLevel('AA')}
              type="button"
              aria-pressed={wcagLevel === 'AA'}
            >
              AA
            </button>
            <button
              className={wcagLevel === 'AAA' ? styles.wcagBtnActive : styles.wcagBtn}
              onClick={() => setWcagLevel('AAA')}
              type="button"
              aria-pressed={wcagLevel === 'AAA'}
            >
              AAA
            </button>
          </div>

          <span className={styles.resultCount} aria-live="polite">
            {filteredResults.length} of {TOTAL} pairs
          </span>
        </div>

        {/* Results table */}
        <div
          className={styles.tableWrapper}
          role="region"
          aria-label="Contrast results"
          tabIndex={0}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Foreground Token</th>
                <th scope="col" className={styles.th}>Background</th>
                <th scope="col" className={styles.th}>Ratio</th>
                <th scope="col" className={styles.th}>AA</th>
                <th scope="col" className={styles.th}>AAA</th>
                <th scope="col" className={styles.th}>Guidance</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.cellFlex}>
                      <div
                        className={styles.colorDot}
                        style={{
                          '--dot-color': result.fg.hex,
                          '--dot-border': result.fg.hex === '#ffffff' ? '#e5e7eb' : result.fg.hex,
                        } as React.CSSProperties}
                        aria-hidden="true"
                      />
                      <code className={styles.tokenCode}>{result.fg.token}</code>
                      <span className={styles.tokenHexSmall}>{result.fg.hex}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cellFlex}>
                      <div
                        className={styles.colorDot}
                        style={{
                          '--dot-color': result.bgHex,
                          '--dot-border': result.bgHex === '#ffffff' ? '#e5e7eb' : result.bgHex,
                        } as React.CSSProperties}
                        aria-hidden="true"
                      />
                      <span>{result.bgLabel}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.ratioValue}>{result.ratio.toFixed(2)}:1</span>
                  </td>
                  <td className={styles.td}>
                    <StatusBadge pass={result.aaPass} />
                  </td>
                  <td className={styles.td}>
                    <StatusBadge pass={result.aaaPass} />
                  </td>
                  <td className={styles.td}>
                    <span className={styles.guidance}>{result.guidance}</span>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No results match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
