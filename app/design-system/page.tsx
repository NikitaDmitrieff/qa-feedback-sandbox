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
            <div className={pageStyles.dontLabel}>✗ Don&apos;t — Inline styles bypass the design system</div>
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
              <span>img alt=&quot;A blue placeholder…&quot;</span>
            </div>
            <div className={pageStyles.codeBlock}>
              <pre>{`<img
  src="/hero.png"
  alt="Dashboard showing monthly sales chart"
/>`}</pre>
            </div>
          </div>

          <div className={pageStyles.dontBlock}>
            <div className={pageStyles.dontLabel}>✗ Don&apos;t — Empty or missing alt leaves screen readers blind</div>
            <div className={pageStyles.imgPlaceholderBad} role="img" aria-label="placeholder">
              <span>img alt=&quot;&quot; (empty)</span>
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
