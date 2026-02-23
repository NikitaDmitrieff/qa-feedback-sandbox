'use client'

import { contrastRatioValue, meetsWcagAA, meetsWcagAAA } from '@/app/lib/contrast'
import type { DesignTokens } from '@/app/lib/tokenGenerator'
import styles from './BrandKitPreviewCanvas.module.css'

interface BrandKitPreviewCanvasProps {
  tokens: DesignTokens
  canvasVars: Record<string, string>
  brandName: string
  animKey: string
  pulse: boolean
}

// WCAG badge levels
type WcagLevel = 'AAA' | 'AA' | 'FAIL'

function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'FAIL'
}

interface WcagBadgeProps {
  fg: string
  bg: string
  label?: string
}

function WcagBadge({ fg, bg, label }: WcagBadgeProps) {
  const ratio = contrastRatioValue(fg, bg)
  const level = wcagLevel(ratio)
  const passesAA = meetsWcagAA(fg, bg)
  const passesAAA = meetsWcagAAA(fg, bg)

  return (
    <span
      className={`${styles.wcagBadge} ${
        passesAAA
          ? styles.wcagAAA
          : passesAA
            ? styles.wcagAA
            : styles.wcagFail
      }`}
      title={`${label ? label + ': ' : ''}${ratio.toFixed(2)}:1`}
      aria-label={`WCAG ${level}, contrast ratio ${ratio.toFixed(2)}:1`}
    >
      {level}
    </span>
  )
}

// Color scale ribbon with stagger animation
function ScaleRibbon({
  label,
  scale,
  animKey,
}: {
  label: string
  scale: Record<number, string>
  animKey: string
}) {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  return (
    <div className={styles.scaleRibbon}>
      <span className={styles.ribbonLabel}>{label}</span>
      <div className={styles.ribbonSwatches} key={animKey}>
        {steps.map((step, i) => (
          <div
            key={step}
            className={styles.ribbonSwatch}
            style={
              {
                '--swatch-color': scale[step],
                '--anim-delay': `${i * 40}ms`,
              } as React.CSSProperties
            }
            title={`${label}-${step}: ${scale[step]}`}
            aria-label={`${label} ${step}: ${scale[step]}`}
          >
            <span className={styles.ribbonSwatchLabel}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Individual component demo cards
function ComponentCard({
  title,
  wcagFg,
  wcagBg,
  children,
}: {
  title: string
  wcagFg: string
  wcagBg: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.componentCard}>
      <div className={styles.componentCardHeader}>
        <span className={styles.componentTitle}>{title}</span>
        <WcagBadge fg={wcagFg} bg={wcagBg} label={title} />
      </div>
      <div className={styles.componentDemo}>{children}</div>
    </div>
  )
}

export function BrandKitPreviewCanvas({
  tokens,
  canvasVars,
  brandName,
  animKey,
  pulse,
}: BrandKitPreviewCanvasProps) {
  const primary = tokens.primary
  const neutral = tokens.neutral
  const accent = tokens.accent
  const semantic = tokens.semantic

  const primaryText = canvasVars['--bk-primary-text'] ?? '#ffffff'
  const primaryHex = canvasVars['--bk-primary'] ?? primary[600]

  return (
    <main className={styles.canvasWrapper}>
      {/* Color scale ribbon */}
      <div className={styles.ribbon}>
        <ScaleRibbon label="Primary" scale={primary} animKey={animKey} />
        <ScaleRibbon label="Accent" scale={accent} animKey={animKey} />
        <ScaleRibbon label="Neutral" scale={neutral} animKey={animKey} />
      </div>

      {/* Component Theatre */}
      <div
        className={`${styles.theatre} ${pulse ? styles.theatrePulse : ''}`}
        style={canvasVars as React.CSSProperties}
      >
        <div className={styles.theatreInner}>
          <div className={styles.theatreHeader}>
            <span className={styles.theatreBrandName}>{brandName}</span>
            <span className={styles.theatreSubtitle}>Component Preview</span>
          </div>

          <div className={styles.componentGrid}>
            {/* Button — Primary */}
            <ComponentCard
              title="Button — Primary"
              wcagFg={primaryText}
              wcagBg={primaryHex}
            >
              <div className={styles.btnRow}>
                <button className={styles.btnPrimary}>Get started</button>
                <button className={styles.btnPrimary} disabled>
                  Disabled
                </button>
              </div>
            </ComponentCard>

            {/* Button — Secondary */}
            <ComponentCard
              title="Button — Secondary"
              wcagFg={primaryHex}
              wcagBg={canvasVars['--bk-bg'] ?? neutral[50]}
            >
              <div className={styles.btnRow}>
                <button className={styles.btnSecondary}>Cancel</button>
                <button className={styles.btnSecondary} disabled>
                  Disabled
                </button>
              </div>
            </ComponentCard>

            {/* Button — Ghost */}
            <ComponentCard
              title="Button — Ghost"
              wcagFg={canvasVars['--bk-text'] ?? neutral[900]}
              wcagBg={canvasVars['--bk-bg'] ?? neutral[50]}
            >
              <div className={styles.btnRow}>
                <button className={styles.btnGhost}>Learn more</button>
              </div>
            </ComponentCard>

            {/* Button — Danger */}
            <ComponentCard
              title="Button — Danger"
              wcagFg="#ffffff"
              wcagBg={semantic.error}
            >
              <div className={styles.btnRow}>
                <button className={styles.btnDanger}>Delete</button>
              </div>
            </ComponentCard>

            {/* Button — Accent */}
            <ComponentCard
              title="Button — Accent"
              wcagFg={canvasVars['--bk-accent-text'] ?? '#ffffff'}
              wcagBg={canvasVars['--bk-accent'] ?? accent[500]}
            >
              <div className={styles.btnRow}>
                <button className={styles.btnAccent}>Explore</button>
              </div>
            </ComponentCard>

            {/* Form Input */}
            <ComponentCard
              title="Form Input"
              wcagFg={canvasVars['--bk-text'] ?? neutral[900]}
              wcagBg={canvasVars['--bk-bg'] ?? neutral[50]}
            >
              <div className={styles.inputStack}>
                <label className={styles.inputLabel} htmlFor="demo-canvas-input">
                  Full name
                </label>
                <input
                  id="demo-canvas-input"
                  type="text"
                  className={styles.textField}
                  placeholder="Enter your name"
                  readOnly
                />
              </div>
            </ComponentCard>

            {/* Form Input — Error */}
            <ComponentCard
              title="Form Input — Error"
              wcagFg={canvasVars['--bk-error-text'] ?? '#7f1d1d'}
              wcagBg={canvasVars['--bk-bg'] ?? neutral[50]}
            >
              <div className={styles.inputStack}>
                <label className={styles.inputLabel} htmlFor="demo-canvas-error">
                  Email
                </label>
                <input
                  id="demo-canvas-error"
                  type="email"
                  className={`${styles.textField} ${styles.textFieldError}`}
                  placeholder="you@example.com"
                  aria-invalid="true"
                  readOnly
                />
                <span className={styles.errorMsg} role="alert">
                  Enter a valid email address.
                </span>
              </div>
            </ComponentCard>

            {/* Select */}
            <ComponentCard
              title="Form Select"
              wcagFg={canvasVars['--bk-text'] ?? neutral[900]}
              wcagBg={canvasVars['--bk-bg'] ?? neutral[50]}
            >
              <div className={styles.inputStack}>
                <label className={styles.inputLabel} htmlFor="demo-canvas-select">
                  Role
                </label>
                <select id="demo-canvas-select" className={styles.selectField}>
                  <option>Viewer</option>
                  <option>Editor</option>
                  <option>Admin</option>
                </select>
              </div>
            </ComponentCard>

            {/* Card */}
            <ComponentCard
              title="Card"
              wcagFg={canvasVars['--bk-text'] ?? neutral[900]}
              wcagBg={canvasVars['--bk-surface'] ?? neutral[100]}
            >
              <div className={styles.demoCard}>
                <h4 className={styles.demoCardTitle}>Card Title</h4>
                <p className={styles.demoCardBody}>
                  Cards provide a contained surface for related content.
                </p>
                <button className={styles.btnPrimary}>Action</button>
              </div>
            </ComponentCard>

            {/* Alert — Success */}
            <ComponentCard
              title="Alert — Success"
              wcagFg={canvasVars['--bk-success-text'] ?? '#14532d'}
              wcagBg={canvasVars['--bk-success-bg'] ?? '#f0fdf4'}
            >
              <div className={styles.alertSuccess} role="alert">
                <span aria-hidden="true">✓</span>
                Changes saved successfully.
              </div>
            </ComponentCard>

            {/* Alert — Error */}
            <ComponentCard
              title="Alert — Error"
              wcagFg={canvasVars['--bk-error-text'] ?? '#7f1d1d'}
              wcagBg={canvasVars['--bk-error-bg'] ?? '#fef2f2'}
            >
              <div className={styles.alertError} role="alert">
                <span aria-hidden="true">✕</span>
                Unable to save. Please try again.
              </div>
            </ComponentCard>

            {/* Alert — Warning */}
            <ComponentCard
              title="Alert — Warning"
              wcagFg={canvasVars['--bk-warning-text'] ?? '#78350f'}
              wcagBg={canvasVars['--bk-warning-bg'] ?? '#fffbeb'}
            >
              <div className={styles.alertWarning} role="status">
                <span aria-hidden="true">⚠</span>
                This action cannot be undone.
              </div>
            </ComponentCard>

            {/* Alert — Info */}
            <ComponentCard
              title="Alert — Info"
              wcagFg={canvasVars['--bk-info-text'] ?? '#0c4a6e'}
              wcagBg={canvasVars['--bk-info-bg'] ?? '#f0f9ff'}
            >
              <div className={styles.alertInfo} role="status">
                <span aria-hidden="true">ℹ</span>
                Your session expires in 30 minutes.
              </div>
            </ComponentCard>

            {/* Badges */}
            <ComponentCard
              title="Badges"
              wcagFg={primaryText}
              wcagBg={primaryHex}
            >
              <div className={styles.badgeRow}>
                <span className={styles.badgePrimary}>New</span>
                <span className={styles.badgeSuccess}>Active</span>
                <span className={styles.badgeError}>Failed</span>
                <span className={styles.badgeNeutral}>Draft</span>
              </div>
            </ComponentCard>

            {/* Tags / Chips */}
            <ComponentCard
              title="Tags / Chips"
              wcagFg={canvasVars['--bk-text'] ?? neutral[900]}
              wcagBg={canvasVars['--bk-surface'] ?? neutral[100]}
            >
              <div className={styles.tagRow}>
                {['Design', 'Accessibility', 'React', 'CSS'].map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </ComponentCard>

            {/* Checkbox */}
            <ComponentCard
              title="Checkbox"
              wcagFg={canvasVars['--bk-text'] ?? neutral[900]}
              wcagBg={canvasVars['--bk-bg'] ?? neutral[50]}
            >
              <div className={styles.checkboxStack}>
                <div className={styles.checkboxRow}>
                  <input
                    id="demo-canvas-cb1"
                    type="checkbox"
                    className={styles.checkbox}
                    defaultChecked
                    readOnly
                  />
                  <label className={styles.checkboxLabel} htmlFor="demo-canvas-cb1">
                    I agree to the terms
                  </label>
                </div>
                <div className={styles.checkboxRow}>
                  <input
                    id="demo-canvas-cb2"
                    type="checkbox"
                    className={styles.checkbox}
                    readOnly
                  />
                  <label className={styles.checkboxLabel} htmlFor="demo-canvas-cb2">
                    Subscribe to newsletter
                  </label>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </main>
  )
}
