# Interactive Design System Explorer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static design-system page into an interactive explorer with WCAG contrast validation, component do/don't patterns, and a design token JSON download.

**Architecture:** Extract helper functions to a shared util, create reusable `ColorSwatch` and `ContrastChecker` components in `app/components/`, and update the server-rendered `page.tsx` to use them. `ContrastChecker` and `DownloadTokensButton` are the only `'use client'` components; everything else stays server-side.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules

---

### Task 1: Extract contrast helper functions to shared utility

**Files:**
- Create: `app/lib/contrast.ts`
- Modify: `app/design-system/page.tsx` (lines 11–35 removed, import added)

**Step 1: Create `app/lib/contrast.ts`**

```ts
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

export function relativeLuminance(hex: string): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = toLinear(parseInt(hex.slice(1, 3), 16))
  const g = toLinear(parseInt(hex.slice(3, 5), 16))
  const b = toLinear(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(fg: string, bg: string): string {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}
```

**Step 2: Verify file is correct, build passes**

Run: `npm run build` (from project root)
Expected: Build succeeds (page.tsx still has its own helpers so nothing breaks yet)

---

### Task 2: Create `ColorSwatch` component

**Files:**
- Create: `app/components/ColorSwatch.tsx`
- Create: `app/components/ColorSwatch.module.css`

**Step 1: Create `app/components/ColorSwatch.tsx`**

```tsx
import { hexToRgb, contrastRatio } from '@/app/lib/contrast'
import styles from './ColorSwatch.module.css'

export interface ColorToken {
  name: string
  token: string
  hex: string
}

interface ColorSwatchProps {
  swatch: ColorToken
}

export function ColorSwatch({ swatch }: ColorSwatchProps) {
  const onWhite = contrastRatio(swatch.hex, '#ffffff')
  const onBlack = contrastRatio(swatch.hex, '#000000')
  const textColor = parseFloat(onWhite) >= 4.5 ? '#ffffff' : '#111827'

  return (
    <div className={styles.swatch}>
      <div
        className={styles.swatchColor}
        style={{ backgroundColor: swatch.hex, color: textColor }}
      >
        {swatch.name}
      </div>
      <div className={styles.swatchMeta}>
        <code className={styles.code}>{swatch.token}</code>
        <span className={styles.swatchHex}>{swatch.hex}</span>
        <span className={styles.swatchRgb}>{hexToRgb(swatch.hex)}</span>
        <span className={styles.contrastRow}>
          <span title="Contrast vs white">◻ {onWhite}:1</span>
          <span title="Contrast vs black">◼ {onBlack}:1</span>
        </span>
      </div>
    </div>
  )
}
```

**Step 2: Create `app/components/ColorSwatch.module.css`**

```css
.swatch {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.swatchColor {
  height: 80px;
  display: flex;
  align-items: flex-end;
  padding: var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.swatchMeta {
  padding: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  background-color: var(--color-surface);
}

.code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  background-color: var(--color-gray-100);
  padding: 0.1em 0.3em;
  border-radius: var(--radius-sm);
  color: var(--color-primary-700);
  white-space: nowrap;
}

.swatchHex,
.swatchRgb {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-family: var(--font-family-mono);
}

.contrastRow {
  display: flex;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-family: var(--font-family-mono);
}
```

---

### Task 3: Create `ContrastChecker` component

**Files:**
- Create: `app/components/ContrastChecker.tsx`
- Create: `app/components/ContrastChecker.module.css`

**Step 1: Create `app/components/ContrastChecker.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { contrastRatio } from '@/app/lib/contrast'
import type { ColorToken } from './ColorSwatch'
import styles from './ContrastChecker.module.css'

interface ContrastCheckerProps {
  colors: ColorToken[]
}

interface WcagResult {
  label: string
  threshold: number
  pass: boolean
}

export function ContrastChecker({ colors }: ContrastCheckerProps) {
  const allColors: ColorToken[] = [
    { name: 'White', token: '--color-background', hex: '#ffffff' },
    { name: 'Black', token: '--color-gray-900', hex: '#111827' },
    ...colors,
  ]

  const [fgHex, setFgHex] = useState(allColors[0].hex)
  const [bgHex, setBgHex] = useState(allColors[1].hex)

  const ratio = parseFloat(contrastRatio(fgHex, bgHex))

  const results: WcagResult[] = [
    { label: 'AA Normal Text (4.5:1)', threshold: 4.5, pass: ratio >= 4.5 },
    { label: 'AA Large Text (3:1)', threshold: 3.0, pass: ratio >= 3.0 },
    { label: 'AAA Normal Text (7:1)', threshold: 7.0, pass: ratio >= 7.0 },
    { label: 'AAA Large Text (4.5:1)', threshold: 4.5, pass: ratio >= 4.5 },
  ]

  return (
    <div className={styles.checker}>
      <div className={styles.controls}>
        <div className={styles.colorPicker}>
          <label className={styles.label} htmlFor="fg-color">Foreground color</label>
          <select
            id="fg-color"
            className={styles.select}
            value={fgHex}
            onChange={(e) => setFgHex(e.target.value)}
          >
            {allColors.map((c) => (
              <option key={c.token} value={c.hex}>
                {c.name} ({c.hex})
              </option>
            ))}
          </select>
          <div className={styles.colorPreview} style={{ backgroundColor: fgHex }} aria-hidden="true" />
        </div>

        <div className={styles.colorPicker}>
          <label className={styles.label} htmlFor="bg-color">Background color</label>
          <select
            id="bg-color"
            className={styles.select}
            value={bgHex}
            onChange={(e) => setBgHex(e.target.value)}
          >
            {allColors.map((c) => (
              <option key={c.token} value={c.hex}>
                {c.name} ({c.hex})
              </option>
            ))}
          </select>
          <div className={styles.colorPreview} style={{ backgroundColor: bgHex }} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.preview} style={{ backgroundColor: bgHex, color: fgHex }}>
        <p className={styles.previewText}>Aa — Sample text preview</p>
        <p className={styles.previewSmall}>Normal body text at 16px</p>
      </div>

      <div className={styles.ratioDisplay}>
        <span className={styles.ratioValue}>{ratio.toFixed(2)}:1</span>
        <span className={styles.ratioLabel}>contrast ratio</span>
      </div>

      <div className={styles.results}>
        {results.map((r) => (
          <div key={r.label} className={r.pass ? styles.resultPass : styles.resultFail}>
            <span className={styles.resultBadge}>{r.pass ? '✓ Pass' : '✗ Fail'}</span>
            <span className={styles.resultLabel}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create `app/components/ContrastChecker.module.css`**

```css
.checker {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  max-width: 600px;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

@media (max-width: 640px) {
  .controls {
    grid-template-columns: 1fr;
  }
}

.colorPicker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.select {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background-color: var(--color-background);
  cursor: pointer;
}

.colorPreview {
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.preview {
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
}

.previewText {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-2) 0;
}

.previewSmall {
  font-size: var(--font-size-base);
  margin: 0;
}

.ratioDisplay {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}

.ratioValue {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-family: var(--font-family-mono);
}

.ratioLabel {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.resultPass,
.resultFail {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.resultPass {
  background-color: #f0fdf4;
  color: #166534;
}

.resultFail {
  background-color: #fef2f2;
  color: #991b1b;
}

.resultBadge {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-mono);
  min-width: 60px;
}

.resultLabel {
  color: inherit;
}
```

---

### Task 4: Create `DownloadTokensButton` component

**Files:**
- Create: `app/components/DownloadTokensButton.tsx`

**Step 1: Create `app/components/DownloadTokensButton.tsx`**

```tsx
'use client'

import styles from './DownloadTokensButton.module.css'

interface DesignTokensData {
  colors: Record<string, Record<string, string>>
  typography: {
    fontSizes: Record<string, string>
    fontWeights: Record<string, string>
    lineHeights: Record<string, string>
  }
  spacing: Record<string, string>
}

interface DownloadTokensButtonProps {
  tokens: DesignTokensData
}

export function DownloadTokensButton({ tokens }: DownloadTokensButtonProps) {
  const handleDownload = () => {
    const json = JSON.stringify(tokens, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-tokens.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className={styles.btn} onClick={handleDownload}>
      Download Design Token JSON
    </button>
  )
}
```

**Step 2: Create `app/components/DownloadTokensButton.module.css`**

```css
.btn {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary-600);
  cursor: pointer;
  background-color: transparent;
  color: var(--color-primary-600);
  transition: background-color 0.15s ease;
}

.btn:hover {
  background-color: var(--color-primary-50);
}
```

---

### Task 5: Update `app/design-system/page.tsx`

**Files:**
- Modify: `app/design-system/page.tsx`

**Step 1: Rewrite `app/design-system/page.tsx`**

Key changes:
1. Remove inline helper functions (now in `app/lib/contrast.ts`) — but keep `hexToRgb` usage via import
2. Rename `type ColorSwatch` → `type ColorToken` (to avoid clash with new component name)
3. Replace `SwatchGrid` inline component with `ColorSwatch` component from `app/components/`
4. Add `ContrastChecker` section with all palette colors passed in
5. Enhance Component Patterns section to show correct vs. incorrect usage (footer, image alt text)
6. Add `DownloadTokensButton` with the design token data

Full replacement of `app/design-system/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { ColorSwatch, type ColorToken } from '@/app/components/ColorSwatch'
import { ContrastChecker } from '@/app/components/ContrastChecker'
import { DownloadTokensButton } from '@/app/components/DownloadTokensButton'
import pageStyles from './page.module.css'

export const metadata: Metadata = {
  title: 'Design System — Minions Smoke Test',
  description: 'Design tokens, color palette, typography, spacing, and component patterns',
}

/* ---------- data ---------- */

const primaryColors: ColorToken[] = [
  { name: '50', token: '--color-primary-50', hex: '#eff6ff' },
  { name: '100', token: '--color-primary-100', hex: '#dbeafe' },
  { name: '200', token: '--color-primary-200', hex: '#bfdbfe' },
  { name: '300', token: '--color-primary-300', hex: '#93c5fd' },
  { name: '400', token: '--color-primary-400', hex: '#60a5fa' },
  { name: '500', token: '--color-primary-500', hex: '#3b82f6' },
  { name: '600', token: '--color-primary-600', hex: '#2563eb' },
  { name: '700', token: '--color-primary-700', hex: '#1d4ed8' },
  { name: '800', token: '--color-primary-800', hex: '#1e40af' },
  { name: '900', token: '--color-primary-900', hex: '#1e3a8a' },
]

const grayColors: ColorToken[] = [
  { name: '50', token: '--color-gray-50', hex: '#f9fafb' },
  { name: '100', token: '--color-gray-100', hex: '#f3f4f6' },
  { name: '200', token: '--color-gray-200', hex: '#e5e7eb' },
  { name: '300', token: '--color-gray-300', hex: '#d1d5db' },
  { name: '400', token: '--color-gray-400', hex: '#9ca3af' },
  { name: '500', token: '--color-gray-500', hex: '#6b7280' },
  { name: '600', token: '--color-gray-600', hex: '#4b5563' },
  { name: '700', token: '--color-gray-700', hex: '#374151' },
  { name: '800', token: '--color-gray-800', hex: '#1f2937' },
  { name: '900', token: '--color-gray-900', hex: '#111827' },
]

const semanticColors: ColorToken[] = [
  { name: 'Success', token: '--color-success', hex: '#16a34a' },
  { name: 'Warning', token: '--color-warning', hex: '#d97706' },
  { name: 'Error', token: '--color-error', hex: '#dc2626' },
  { name: 'Info', token: '--color-info', hex: '#0284c7' },
]

const allPaletteColors: ColorToken[] = [...primaryColors, ...grayColors, ...semanticColors]

const fontSizes = [
  { name: 'xs', token: '--font-size-xs', value: '0.75rem', px: '12px', sample: 'Extra small' },
  { name: 'sm', token: '--font-size-sm', value: '0.875rem', px: '14px', sample: 'Small' },
  { name: 'base', token: '--font-size-base', value: '1rem', px: '16px', sample: 'Base' },
  { name: 'lg', token: '--font-size-lg', value: '1.125rem', px: '18px', sample: 'Large' },
  { name: 'xl', token: '--font-size-xl', value: '1.25rem', px: '20px', sample: 'Extra large' },
  { name: '2xl', token: '--font-size-2xl', value: '1.5rem', px: '24px', sample: '2X large' },
  { name: '3xl', token: '--font-size-3xl', value: '1.875rem', px: '30px', sample: '3X large' },
  { name: '4xl', token: '--font-size-4xl', value: '2.25rem', px: '36px', sample: '4X large' },
]

const fontWeights = [
  { name: 'Normal', token: '--font-weight-normal', value: '400' },
  { name: 'Medium', token: '--font-weight-medium', value: '500' },
  { name: 'Semibold', token: '--font-weight-semibold', value: '600' },
  { name: 'Bold', token: '--font-weight-bold', value: '700' },
]

const lineHeights = [
  { name: 'tight', token: '--line-height-tight', value: '1.25' },
  { name: 'snug', token: '--line-height-snug', value: '1.375' },
  { name: 'normal', token: '--line-height-normal', value: '1.5' },
  { name: 'relaxed', token: '--line-height-relaxed', value: '1.625' },
  { name: 'loose', token: '--line-height-loose', value: '2' },
]

const spacingScale = [
  { token: '--spacing-1', value: '0.25rem', px: '4px' },
  { token: '--spacing-2', value: '0.5rem', px: '8px' },
  { token: '--spacing-3', value: '0.75rem', px: '12px' },
  { token: '--spacing-4', value: '1rem', px: '16px' },
  { token: '--spacing-5', value: '1.25rem', px: '20px' },
  { token: '--spacing-6', value: '1.5rem', px: '24px' },
  { token: '--spacing-8', value: '2rem', px: '32px' },
  { token: '--spacing-10', value: '2.5rem', px: '40px' },
  { token: '--spacing-12', value: '3rem', px: '48px' },
  { token: '--spacing-16', value: '4rem', px: '64px' },
]

const designTokensJson = {
  colors: {
    primary: Object.fromEntries(primaryColors.map((c) => [c.name, c.hex])),
    gray: Object.fromEntries(grayColors.map((c) => [c.name, c.hex])),
    semantic: Object.fromEntries(semanticColors.map((c) => [c.name.toLowerCase(), c.hex])),
  },
  typography: {
    fontSizes: Object.fromEntries(fontSizes.map((f) => [f.name, f.value])),
    fontWeights: Object.fromEntries(fontWeights.map((f) => [f.name.toLowerCase(), f.value])),
    lineHeights: Object.fromEntries(lineHeights.map((l) => [l.name, l.value])),
  },
  spacing: Object.fromEntries(spacingScale.map((s) => [s.token, s.value])),
}

/* ---------- sub-components ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={pageStyles.section}>
      <h2 className={pageStyles.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function SwatchGrid({ swatches }: { swatches: ColorToken[] }) {
  return (
    <div className={pageStyles.swatchGrid}>
      {swatches.map((s) => (
        <ColorSwatch key={s.token} swatch={s} />
      ))}
    </div>
  )
}

/* ---------- page ---------- */

export default function DesignSystemPage() {
  return (
    <main className={pageStyles.main}>
      <header className={pageStyles.header}>
        <div className={pageStyles.headerTop}>
          <h1 className={pageStyles.pageTitle}>Design System</h1>
          <DownloadTokensButton tokens={designTokensJson} />
        </div>
        <p className={pageStyles.pageSubtitle}>
          All design tokens are defined in{' '}
          <code className={pageStyles.code}>app/styles/globals.module.css</code>. See{' '}
          <code className={pageStyles.code}>app/styles/README.md</code> for usage guidance.
        </p>
      </header>

      {/* ---- Colors ---- */}
      <Section title="Color Palette">
        <h3 className={pageStyles.subsectionTitle}>Primary</h3>
        <SwatchGrid swatches={primaryColors} />

        <h3 className={pageStyles.subsectionTitle}>Neutrals</h3>
        <SwatchGrid swatches={grayColors} />

        <h3 className={pageStyles.subsectionTitle}>Semantic</h3>
        <SwatchGrid swatches={semanticColors} />

        <div className={pageStyles.codeBlock}>
          <pre>{`/* Usage */
color: var(--color-primary-600);
background-color: var(--color-surface);
border-color: var(--color-border);`}</pre>
        </div>
      </Section>

      {/* ---- Contrast Checker ---- */}
      <Section title="WCAG Contrast Checker">
        <p className={pageStyles.bodyText}>
          Select any two colors from the palette to check WCAG AA and AAA compliance in real time.
        </p>
        <ContrastChecker colors={allPaletteColors} />
      </Section>

      {/* ---- Typography ---- */}
      <Section title="Typography">
        <h3 className={pageStyles.subsectionTitle}>Font Sizes</h3>
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>px</th>
              <th>Sample</th>
            </tr>
          </thead>
          <tbody>
            {fontSizes.map((f) => (
              <tr key={f.token}>
                <td><code className={pageStyles.code}>{f.token}</code></td>
                <td>{f.value}</td>
                <td>{f.px}</td>
                <td style={{ fontSize: f.value }}>{f.sample}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className={pageStyles.subsectionTitle}>Font Weights</h3>
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Sample</th>
            </tr>
          </thead>
          <tbody>
            {fontWeights.map((f) => (
              <tr key={f.token}>
                <td><code className={pageStyles.code}>{f.token}</code></td>
                <td>{f.value}</td>
                <td style={{ fontWeight: Number(f.value) }}>{f.name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className={pageStyles.subsectionTitle}>Line Heights</h3>
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {lineHeights.map((l) => (
              <tr key={l.token}>
                <td><code className={pageStyles.code}>{l.token}</code></td>
                <td>{l.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={pageStyles.codeBlock}>
          <pre>{`/* Usage */
font-family: var(--font-family-sans);
font-size: var(--font-size-lg);
font-weight: var(--font-weight-semibold);
line-height: var(--line-height-relaxed);`}</pre>
        </div>
      </Section>

      {/* ---- Spacing ---- */}
      <Section title="Spacing Scale">
        <p className={pageStyles.bodyText}>4px base unit. All spacing uses multiples of 4px.</p>
        <div className={pageStyles.spacingList}>
          {spacingScale.map((s) => (
            <div key={s.token} className={pageStyles.spacingRow}>
              <code className={pageStyles.code}>{s.token}</code>
              <span className={pageStyles.spacingValues}>{s.value} / {s.px}</span>
              <div
                className={pageStyles.spacingBar}
                style={{ width: s.px, height: '1rem', backgroundColor: '#3b82f6' }}
                aria-label={`${s.px} spacing bar`}
              />
            </div>
          ))}
        </div>

        <div className={pageStyles.codeBlock}>
          <pre>{`/* Usage */
padding: var(--spacing-4);
margin-bottom: var(--spacing-8);
gap: var(--spacing-2);`}</pre>
        </div>
      </Section>

      {/* ---- Component Patterns ---- */}
      <Section title="Component Patterns">

        <h3 className={pageStyles.subsectionTitle}>Button States</h3>
        <div className={pageStyles.componentRow}>
          <button className={pageStyles.btnPrimary}>Primary</button>
          <button className={pageStyles.btnPrimary} disabled>Disabled</button>
          <button className={pageStyles.btnSecondary}>Secondary</button>
          <button className={pageStyles.btnDanger}>Danger</button>
        </div>
        <div className={pageStyles.codeBlock}>
          <pre>{`.btn {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
}
.btnPrimary {
  background-color: var(--color-primary-600);
  color: #ffffff;
}
.btnPrimary:hover { background-color: var(--color-primary-700); }
.btnPrimary:disabled { opacity: 0.5; cursor: not-allowed; }`}</pre>
        </div>

        <h3 className={pageStyles.subsectionTitle}>Card</h3>
        <div className={pageStyles.card}>
          <h4 className={pageStyles.cardTitle}>Card Title</h4>
          <p className={pageStyles.cardBody}>
            Cards use surface color, border, and padding tokens. They provide a contained, elevated container for content.
          </p>
          <button className={pageStyles.btnPrimary}>Action</button>
        </div>
        <div className={pageStyles.codeBlock}>
          <pre>{`.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}`}</pre>
        </div>

        <h3 className={pageStyles.subsectionTitle}>Input States</h3>
        <div className={pageStyles.inputStack}>
          <label className={pageStyles.label} htmlFor="default-input">Default</label>
          <input id="default-input" className={pageStyles.input} placeholder="Enter text..." type="text" />

          <label className={pageStyles.label} htmlFor="error-input">Error state</label>
          <input id="error-input" className={`${pageStyles.input} ${pageStyles.inputError}`} placeholder="Invalid input" type="text" aria-invalid="true" />
          <span className={pageStyles.errorMessage} role="alert">This field is required.</span>

          <label className={pageStyles.label} htmlFor="disabled-input">Disabled</label>
          <input id="disabled-input" className={pageStyles.input} placeholder="Disabled" type="text" disabled />
        </div>
        <div className={pageStyles.codeBlock}>
          <pre>{`.input {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background-color: var(--color-background);
}
.input:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
.inputError { border-color: var(--color-error); }`}</pre>
        </div>

        {/* Do / Don't: Footer styling */}
        <h3 className={pageStyles.subsectionTitle}>Correct vs. Incorrect Usage</h3>
        <div className={pageStyles.dosDonts}>
          <div className={pageStyles.doBlock}>
            <div className={pageStyles.doLabel}>✓ Do — Use CSS Modules for footer</div>
            <footer className={pageStyles.footerExample}>
              Footer styled via <code className={pageStyles.code}>.footer</code> class in .module.css
            </footer>
            <div className={pageStyles.codeBlock}>
              <pre>{`/* page.module.css */
.footer {
  margin-top: var(--spacing-8);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* component.tsx */
<footer className={styles.footer}>…</footer>`}</pre>
            </div>
          </div>

          <div className={pageStyles.dontBlock}>
            <div className={pageStyles.dontLabel}>✗ Don't — Inline styles bypass the design system</div>
            <footer style={{ color: '#999', fontSize: '13px', marginTop: '20px' }}>
              Footer with hardcoded inline styles
            </footer>
            <div className={pageStyles.codeBlock}>
              <pre>{`/* ✗ Avoid */
<footer style={{ color: '#999', fontSize: '13px' }}>
  …
</footer>`}</pre>
            </div>
          </div>
        </div>

        {/* Do / Don't: Image alt text */}
        <div className={pageStyles.dosDonts}>
          <div className={pageStyles.doBlock}>
            <div className={pageStyles.doLabel}>✓ Do — Always provide descriptive alt text</div>
            <div className={pageStyles.imgPlaceholder} role="img" aria-label="A blue placeholder image representing correct alt text usage">
              <span>img alt="A blue placeholder…"</span>
            </div>
            <div className={pageStyles.codeBlock}>
              <pre>{`<img
  src="/hero.png"
  alt="Dashboard showing monthly sales chart"
/>`}</pre>
            </div>
          </div>

          <div className={pageStyles.dontBlock}>
            <div className={pageStyles.dontLabel}>✗ Don't — Empty or missing alt leaves screen readers blind</div>
            <div className={pageStyles.imgPlaceholderBad} role="img" aria-label="placeholder">
              <span>img alt="" (empty)</span>
            </div>
            <div className={pageStyles.codeBlock}>
              <pre>{`{/* ✗ Avoid */}
<img src="/hero.png" alt="" />
<img src="/hero.png" />`}</pre>
            </div>
          </div>
        </div>

      </Section>
    </main>
  )
}
```

**Step 2: Add new CSS classes to `app/design-system/page.module.css`**

Append to existing file:

```css
/* Header layout */
.headerTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-3);
}

/* Do / Don't patterns */
.dosDonts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

@media (max-width: 640px) {
  .dosDonts {
    grid-template-columns: 1fr;
  }
}

.doBlock,
.dontBlock {
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.doBlock {
  border: 1px solid #bbf7d0;
  background-color: #f0fdf4;
}

.dontBlock {
  border: 1px solid #fecaca;
  background-color: #fef2f2;
}

.doLabel {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #166534;
}

.dontLabel {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #991b1b;
}

.footerExample {
  margin-top: var(--spacing-8);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.imgPlaceholder {
  height: 80px;
  background-color: #bfdbfe;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  color: #1e40af;
  font-family: var(--font-family-mono);
}

.imgPlaceholderBad {
  height: 80px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-family: var(--font-family-mono);
}
```

---

### Task 6: Run the build and verify

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors or missing module errors.

**Step 2: Check for TypeScript errors specifically**

```bash
npx tsc --noEmit
```

Expected: No errors.
