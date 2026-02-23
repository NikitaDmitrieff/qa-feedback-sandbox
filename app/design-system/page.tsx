import type { Metadata } from 'next'
import pageStyles from './page.module.css'

export const metadata: Metadata = {
  title: 'Design System — Minions Smoke Test',
  description: 'Design tokens, color palette, typography, spacing, and component patterns',
}

/* ---------- helpers ---------- */

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function relativeLuminance(hex: string): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = toLinear(parseInt(hex.slice(1, 3), 16))
  const g = toLinear(parseInt(hex.slice(3, 5), 16))
  const b = toLinear(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(fg: string, bg: string): string {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}

/* ---------- data ---------- */

type ColorSwatch = { name: string; token: string; hex: string }

const primaryColors: ColorSwatch[] = [
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

const grayColors: ColorSwatch[] = [
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

const semanticColors: ColorSwatch[] = [
  { name: 'Success', token: '--color-success', hex: '#16a34a' },
  { name: 'Warning', token: '--color-warning', hex: '#d97706' },
  { name: 'Error', token: '--color-error', hex: '#dc2626' },
  { name: 'Info', token: '--color-info', hex: '#0284c7' },
]

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

/* ---------- components ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={pageStyles.section}>
      <h2 className={pageStyles.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function SwatchGrid({ swatches }: { swatches: ColorSwatch[] }) {
  return (
    <div className={pageStyles.swatchGrid}>
      {swatches.map((s) => {
        const onWhite = contrastRatio(s.hex, '#ffffff')
        const onBlack = contrastRatio(s.hex, '#000000')
        const textColor = parseFloat(onWhite) >= 4.5 ? '#ffffff' : '#111827'
        return (
          <div key={s.token} className={pageStyles.swatch}>
            <div
              className={pageStyles.swatchColor}
              style={{ backgroundColor: s.hex, color: textColor }}
            >
              {s.name}
            </div>
            <div className={pageStyles.swatchMeta}>
              <code className={pageStyles.code}>{s.token}</code>
              <span className={pageStyles.swatchHex}>{s.hex}</span>
              <span className={pageStyles.swatchRgb}>{hexToRgb(s.hex)}</span>
              <span className={pageStyles.contrastRow}>
                <span title="Contrast vs white">◻ {onWhite}:1</span>
                <span title="Contrast vs black">◼ {onBlack}:1</span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- page ---------- */

export default function DesignSystemPage() {
  return (
    <main className={pageStyles.main}>
      <header className={pageStyles.header}>
        <h1 className={pageStyles.pageTitle}>Design System</h1>
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
      </Section>
    </main>
  )
}
