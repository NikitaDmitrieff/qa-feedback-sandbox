'use client'

import { useState, useCallback } from 'react'
import { contrastRatio } from '@/app/lib/contrast'
import styles from './page.module.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ColorScheme = 'default' | 'high-contrast' | 'accessible'

interface SchemeColors {
  bg: string
  surface: string
  text: string
  textMuted: string
  primary: string
  /** Text on primary-colored button background */
  primaryText: string
  border: string
  /** Error button/badge background */
  error: string
  /** Text on error button background */
  errorText: string
  /** Tinted alert background for errors */
  errorBg: string
  errorBorder: string
  /** Text shown inside error-tinted alerts */
  errorTextOnBg: string
  /** Success button background */
  success: string
  /** Text on success button background */
  successText: string
  /** Tinted alert background for success */
  successBg: string
  successBorder: string
  /** Text shown inside success-tinted alerts */
  successTextOnBg: string
  /** Warning button background */
  warning: string
  /** Text on warning button background */
  warningText: string
  /** Tinted alert background for warnings */
  warningBg: string
  warningBorder: string
  /** Text shown inside warning-tinted alerts */
  warningTextOnBg: string
}

interface WcagCheck {
  label: string
  threshold: number
  fg: string
  bg: string
}

interface ComponentDef {
  id: string
  title: string
  tips: string[]
  getChecks: (s: SchemeColors) => WcagCheck[]
  code: string
  render: (s: SchemeColors) => React.ReactNode
}

// ---------------------------------------------------------------------------
// Color Schemes
// ---------------------------------------------------------------------------

const COLOR_SCHEMES: Record<ColorScheme, SchemeColors> = {
  default: {
    bg: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#2563eb',
    primaryText: '#ffffff',
    border: '#e5e7eb',
    error: '#dc2626',
    errorText: '#ffffff',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    errorTextOnBg: '#991b1b',
    success: '#16a34a',
    successText: '#ffffff',
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',
    successTextOnBg: '#166534',
    warning: '#d97706',
    warningText: '#ffffff',
    warningBg: '#fffbeb',
    warningBorder: '#fde68a',
    warningTextOnBg: '#92400e',
  },
  'high-contrast': {
    bg: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#d1d5db',
    primary: '#60a5fa',
    primaryText: '#000000',
    border: '#6b7280',
    error: '#f87171',
    errorText: '#000000',
    errorBg: '#450a0a',
    errorBorder: '#b91c1c',
    errorTextOnBg: '#fca5a5',
    success: '#4ade80',
    successText: '#000000',
    successBg: '#052e16',
    successBorder: '#166534',
    successTextOnBg: '#86efac',
    warning: '#fbbf24',
    warningText: '#000000',
    warningBg: '#431407',
    warningBorder: '#b45309',
    warningTextOnBg: '#fde68a',
  },
  accessible: {
    bg: '#f8f9fa',
    surface: '#f0f1f3',
    text: '#1a1a2e',
    textMuted: '#495057',
    primary: '#1a5276',
    primaryText: '#ffffff',
    border: '#adb5bd',
    error: '#9b2226',
    errorText: '#ffffff',
    errorBg: '#f8d7da',
    errorBorder: '#f5c2c7',
    errorTextOnBg: '#58151c',
    success: '#1b5e20',
    successText: '#ffffff',
    successBg: '#d1e7dd',
    successBorder: '#a3cfbb',
    successTextOnBg: '#0f3d16',
    warning: '#7d4e00',
    warningText: '#ffffff',
    warningBg: '#fff3cd',
    warningBorder: '#ffecb5',
    warningTextOnBg: '#664d03',
  },
}

const SCHEME_LABELS: Record<ColorScheme, string> = {
  default: 'Default',
  'high-contrast': 'High Contrast',
  accessible: 'Accessible',
}

// ---------------------------------------------------------------------------
// Component Definitions
// ---------------------------------------------------------------------------

function buildComponents(): ComponentDef[] {
  return [
    {
      id: 'btn-primary',
      title: 'Button — Primary',
      tips: [
        'Use for the main call-to-action on a page.',
        'Ensure text contrast meets AA (4.5:1) against button background.',
        'Provide :focus-visible outline for keyboard users.',
      ],
      getChecks: (sc) => [
        { label: 'AA Normal Text', threshold: 4.5, fg: sc.primaryText, bg: sc.primary },
        { label: 'AAA Normal Text', threshold: 7.0, fg: sc.primaryText, bg: sc.primary },
      ],
      code: `<button className={styles.btnPrimary}>
  Click me
</button>

/* CSS Module */
.btnPrimary {
  background-color: var(--color-primary-600);
  color: #ffffff;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
}`,
      render: (sc) => (
        <div className={styles.demoBtnRow}>
          <button
            className={styles.demoBtn}
            style={{ '--scheme-primary': sc.primary, '--scheme-primary-text': sc.primaryText } as React.CSSProperties}
          >
            Primary
          </button>
          <button
            className={styles.demoBtn}
            style={{ '--scheme-primary': sc.primary, '--scheme-primary-text': sc.primaryText } as React.CSSProperties}
            disabled
          >
            Disabled
          </button>
        </div>
      ),
    },
    {
      id: 'btn-secondary',
      title: 'Button — Secondary',
      tips: [
        'Use for secondary actions alongside a primary button.',
        'Border and text must have 3:1 contrast against background (AA Large Text).',
        'Ensure hover and focus states are also accessible.',
      ],
      getChecks: (sc) => [
        { label: 'AA Normal Text', threshold: 4.5, fg: sc.primary, bg: sc.bg },
        { label: 'Border (AA Large)', threshold: 3.0, fg: sc.primary, bg: sc.bg },
      ],
      code: `<button className={styles.btnSecondary}>
  Cancel
</button>

/* CSS Module */
.btnSecondary {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-600);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}`,
      render: (sc) => (
        <div className={styles.demoBtnRow}>
          <button
            className={styles.demoBtnSecondary}
            style={{ '--scheme-primary': sc.primary, '--scheme-bg': sc.bg } as React.CSSProperties}
          >
            Cancel
          </button>
        </div>
      ),
    },
    {
      id: 'btn-danger',
      title: 'Button — Danger',
      tips: [
        'Reserve for destructive actions like delete or remove.',
        'Include a warning icon or clear label — do not rely on color alone.',
        'Confirm text contrast on the error-colored background.',
      ],
      getChecks: (sc) => [
        { label: 'AA Normal Text', threshold: 4.5, fg: sc.errorText, bg: sc.error },
        { label: 'AAA Normal Text', threshold: 7.0, fg: sc.errorText, bg: sc.error },
      ],
      code: `<button className={styles.btnDanger}>
  Delete
</button>

/* CSS Module */
.btnDanger {
  background-color: var(--color-error);
  color: #ffffff;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
}`,
      render: (sc) => (
        <div className={styles.demoBtnRow}>
          <button
            className={styles.demoBtnDanger}
            style={{
              '--scheme-error': sc.error,
              '--scheme-error-text': sc.errorText,
            } as React.CSSProperties}
          >
            Delete
          </button>
        </div>
      ),
    },
    {
      id: 'input-default',
      title: 'Form Input — Default',
      tips: [
        'Label text must have 4.5:1 contrast against the page background.',
        'Placeholder text should supplement labels, not replace them.',
        'Visible focus ring must contrast 3:1 against adjacent colors.',
      ],
      getChecks: (sc) => [
        { label: 'Label text AA', threshold: 4.5, fg: sc.text, bg: sc.bg },
        { label: 'Border visible (AA Large)', threshold: 3.0, fg: sc.border, bg: sc.bg },
      ],
      code: `<label className={styles.label} htmlFor="name">
  Full name
</label>
<input
  id="name"
  className={styles.input}
  type="text"
  placeholder="Enter your name"
/>

/* CSS Module */
.input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background-color: var(--color-background);
  width: 100%;
}
.input:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}`,
      render: (sc) => (
        <div
          className={styles.demoInputStack}
          style={{
            '--scheme-text': sc.text,
            '--scheme-bg': sc.bg,
            '--scheme-border': sc.border,
            '--scheme-primary': sc.primary,
          } as React.CSSProperties}
        >
          <label className={styles.demoLabel} htmlFor="demo-input-default">
            Full name
          </label>
          <input
            id="demo-input-default"
            className={styles.demoInput}
            type="text"
            placeholder="Enter your name"
          />
        </div>
      ),
    },
    {
      id: 'input-error',
      title: 'Form Input — Error State',
      tips: [
        'Never rely solely on a red border to indicate error — include a text message.',
        'Error message text must meet 4.5:1 against the page background.',
        'Use aria-invalid and role="alert" on the error message element.',
      ],
      getChecks: (sc) => [
        { label: 'Error text AA', threshold: 4.5, fg: sc.errorTextOnBg, bg: sc.bg },
        { label: 'Label AA', threshold: 4.5, fg: sc.text, bg: sc.bg },
      ],
      code: `<label className={styles.label} htmlFor="email">
  Email
</label>
<input
  id="email"
  className={\`\${styles.input} \${styles.inputError}\`}
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" className={styles.errorMessage} role="alert">
  Enter a valid email address.
</span>`,
      render: (sc) => (
        <div
          className={styles.demoInputStack}
          style={{
            '--scheme-text': sc.text,
            '--scheme-bg': sc.bg,
            '--scheme-border': sc.border,
            '--scheme-primary': sc.primary,
            '--scheme-error': sc.error,
            '--scheme-error-text-on-bg': sc.errorTextOnBg,
          } as React.CSSProperties}
        >
          <label className={styles.demoLabel} htmlFor="demo-input-error">
            Email
          </label>
          <input
            id="demo-input-error"
            className={`${styles.demoInput} ${styles.demoInputError}`}
            type="email"
            placeholder="you@example.com"
            aria-invalid="true"
          />
          <span className={styles.demoErrorMsg} role="alert">
            Enter a valid email address.
          </span>
        </div>
      ),
    },
    {
      id: 'select',
      title: 'Form Select',
      tips: [
        'Label must be visible and programmatically associated via htmlFor/id.',
        'Do not use color alone to communicate state changes.',
        'Ensure the select element has a visible focus ring.',
      ],
      getChecks: (sc) => [
        { label: 'Label text AA', threshold: 4.5, fg: sc.text, bg: sc.bg },
        { label: 'Border (AA Large)', threshold: 3.0, fg: sc.border, bg: sc.bg },
      ],
      code: `<label className={styles.label} htmlFor="role">
  Role
</label>
<select id="role" className={styles.select}>
  <option>Viewer</option>
  <option>Editor</option>
  <option>Admin</option>
</select>`,
      render: (sc) => (
        <div
          className={styles.demoInputStack}
          style={{
            '--scheme-text': sc.text,
            '--scheme-bg': sc.bg,
            '--scheme-border': sc.border,
          } as React.CSSProperties}
        >
          <label className={styles.demoLabel} htmlFor="demo-select">
            Role
          </label>
          <select id="demo-select" className={styles.demoSelect}>
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
          </select>
        </div>
      ),
    },
    {
      id: 'card',
      title: 'Card',
      tips: [
        'Body text must meet 4.5:1 against the card background.',
        'Use border or shadow to visually separate card from page — not color alone.',
        'Card actions (buttons) must each meet their own contrast requirements.',
      ],
      getChecks: (sc) => [
        { label: 'Title text AA', threshold: 4.5, fg: sc.text, bg: sc.surface },
        { label: 'Body text AA', threshold: 4.5, fg: sc.textMuted, bg: sc.surface },
      ],
      code: `<div className={styles.card}>
  <h4 className={styles.cardTitle}>Card Title</h4>
  <p className={styles.cardBody}>
    Card body content goes here.
  </p>
  <button className={styles.btnPrimary}>Action</button>
</div>

/* CSS Module */
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}`,
      render: (sc) => (
        <div
          className={styles.demoCard}
          style={{
            '--scheme-surface': sc.surface,
            '--scheme-border': sc.border,
            '--scheme-text': sc.text,
            '--scheme-text-muted': sc.textMuted,
          } as React.CSSProperties}
        >
          <h4 className={styles.demoCardTitle}>Card Title</h4>
          <p className={styles.demoCardBody}>
            Cards provide a contained surface for related content and actions.
          </p>
          <button
            className={styles.demoBtn}
            style={{
              '--scheme-primary': sc.primary,
              '--scheme-primary-text': sc.primaryText,
            } as React.CSSProperties}
          >
            Action
          </button>
        </div>
      ),
    },
    {
      id: 'alert-success',
      title: 'Alert — Success',
      tips: [
        'Text inside the alert must have 4.5:1 contrast on the alert background.',
        'Use role="alert" or aria-live="polite" to announce to screen readers.',
        'Do not rely on green color alone — use an icon or prefix text.',
      ],
      getChecks: (sc) => [
        { label: 'Text AA', threshold: 4.5, fg: sc.successTextOnBg, bg: sc.successBg },
        { label: 'Text AAA', threshold: 7.0, fg: sc.successTextOnBg, bg: sc.successBg },
      ],
      code: `<div className={styles.alertSuccess} role="alert">
  <span aria-hidden="true">✓</span>
  Changes saved successfully.
</div>

/* CSS Module */
.alertSuccess {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
}`,
      render: (sc) => (
        <div
          className={`${styles.demoAlert} ${styles.demoAlertSuccess}`}
          role="alert"
          style={{
            '--scheme-success-bg': sc.successBg,
            '--scheme-success-text-on-bg': sc.successTextOnBg,
            '--scheme-success-border': sc.successBorder,
          } as React.CSSProperties}
        >
          <span className={styles.demoAlertIcon} aria-hidden="true">✓</span>
          Changes saved successfully.
        </div>
      ),
    },
    {
      id: 'alert-error',
      title: 'Alert — Error',
      tips: [
        'Error alerts must be immediately announced (role="alert" or aria-live="assertive").',
        'Provide actionable error messages — not just "Something went wrong".',
        'Text on tinted error backgrounds often needs a darker shade for AA.',
      ],
      getChecks: (sc) => [
        { label: 'Text AA', threshold: 4.5, fg: sc.errorTextOnBg, bg: sc.errorBg },
        { label: 'Text AAA', threshold: 7.0, fg: sc.errorTextOnBg, bg: sc.errorBg },
      ],
      code: `<div className={styles.alertError} role="alert">
  <span aria-hidden="true">✕</span>
  Unable to save. Please try again.
</div>

/* CSS Module */
.alertError {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
}`,
      render: (sc) => (
        <div
          className={`${styles.demoAlert} ${styles.demoAlertError}`}
          role="alert"
          style={{
            '--scheme-error-bg': sc.errorBg,
            '--scheme-error-text-on-bg': sc.errorTextOnBg,
            '--scheme-error-border': sc.errorBorder,
          } as React.CSSProperties}
        >
          <span className={styles.demoAlertIcon} aria-hidden="true">✕</span>
          Unable to save. Please try again.
        </div>
      ),
    },
    {
      id: 'alert-warning',
      title: 'Alert — Warning',
      tips: [
        'Yellow/amber backgrounds are tricky — always verify text contrast ratio.',
        'Include a text prefix ("Warning:") in addition to any warning icon.',
        'Avoid using warning alerts for critical errors; use error alerts instead.',
      ],
      getChecks: (sc) => [
        { label: 'Text AA', threshold: 4.5, fg: sc.warningTextOnBg, bg: sc.warningBg },
        { label: 'Text AAA', threshold: 7.0, fg: sc.warningTextOnBg, bg: sc.warningBg },
      ],
      code: `<div className={styles.alertWarning} role="status">
  <span aria-hidden="true">⚠</span>
  Warning: This action cannot be undone.
</div>

/* CSS Module */
.alertWarning {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
}`,
      render: (sc) => (
        <div
          className={`${styles.demoAlert} ${styles.demoAlertWarning}`}
          role="status"
          style={{
            '--scheme-warning-bg': sc.warningBg,
            '--scheme-warning-text-on-bg': sc.warningTextOnBg,
            '--scheme-warning-border': sc.warningBorder,
          } as React.CSSProperties}
        >
          <span className={styles.demoAlertIcon} aria-hidden="true">⚠</span>
          Warning: This action cannot be undone.
        </div>
      ),
    },
    {
      id: 'badges',
      title: 'Badges',
      tips: [
        'Badge text must meet 4.5:1 against the badge background.',
        'Never convey meaning through badge color alone — include text.',
        'Keep badge labels short (1-2 words) for scannability.',
      ],
      getChecks: (sc) => [
        { label: 'Primary badge AA', threshold: 4.5, fg: sc.primaryText, bg: sc.primary },
        { label: 'Success badge AA', threshold: 4.5, fg: sc.successTextOnBg, bg: sc.successBg },
        { label: 'Error badge AA', threshold: 4.5, fg: sc.errorTextOnBg, bg: sc.errorBg },
      ],
      code: `<span className={styles.badgePrimary}>New</span>
<span className={styles.badgeSuccess}>Active</span>
<span className={styles.badgeError}>Failed</span>
<span className={styles.badgeNeutral}>Draft</span>

/* CSS Module */
.badge {
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 0.2em 0.6em;
  border-radius: var(--radius-full);
}`,
      render: (sc) => (
        <div
          className={styles.demoBadgeRow}
          style={{
            '--scheme-primary': sc.primary,
            '--scheme-primary-text': sc.primaryText,
            '--scheme-success-bg': sc.successBg,
            '--scheme-success-text-on-bg': sc.successTextOnBg,
            '--scheme-success-border': sc.successBorder,
            '--scheme-error-bg': sc.errorBg,
            '--scheme-error-text-on-bg': sc.errorTextOnBg,
            '--scheme-error-border': sc.errorBorder,
            '--scheme-surface': sc.surface,
            '--scheme-text-muted': sc.textMuted,
            '--scheme-border': sc.border,
          } as React.CSSProperties}
        >
          <span className={`${styles.demoBadge} ${styles.demoBadgePrimary}`}>New</span>
          <span className={`${styles.demoBadge} ${styles.demoBadgeSuccess}`}>Active</span>
          <span className={`${styles.demoBadge} ${styles.demoBadgeError}`}>Failed</span>
          <span className={`${styles.demoBadge} ${styles.demoBadgeNeutral}`}>Draft</span>
        </div>
      ),
    },
    {
      id: 'checkbox',
      title: 'Checkbox',
      tips: [
        'Always associate a visible label with the checkbox via htmlFor/id.',
        'Focus ring on the checkbox must be clearly visible.',
        'Checked state must not rely solely on the accent color.',
      ],
      getChecks: (sc) => [
        { label: 'Label text AA', threshold: 4.5, fg: sc.text, bg: sc.bg },
        { label: 'Label text AAA', threshold: 7.0, fg: sc.text, bg: sc.bg },
      ],
      code: `<div className={styles.checkboxRow}>
  <input
    id="terms"
    type="checkbox"
    className={styles.checkbox}
  />
  <label htmlFor="terms">
    I agree to the terms
  </label>
</div>`,
      render: (sc) => (
        <div
          style={{
            '--scheme-text': sc.text,
            '--scheme-bg': sc.bg,
            '--scheme-primary': sc.primary,
          } as React.CSSProperties}
        >
          <div className={styles.demoCheckboxRow}>
            <input
              id="demo-checkbox-1"
              type="checkbox"
              className={styles.demoCheckbox}
              defaultChecked
            />
            <label className={styles.demoCheckboxLabel} htmlFor="demo-checkbox-1">
              I agree to the terms
            </label>
          </div>
          <div className={styles.demoCheckboxRow}>
            <input
              id="demo-checkbox-2"
              type="checkbox"
              className={styles.demoCheckbox}
            />
            <label className={styles.demoCheckboxLabel} htmlFor="demo-checkbox-2">
              Subscribe to newsletter
            </label>
          </div>
        </div>
      ),
    },
    {
      id: 'tags',
      title: 'Tags / Chips',
      tips: [
        'Tag text must meet 4.5:1 contrast against the tag background.',
        'Interactive tags (removable) need an accessible remove button with aria-label.',
        'Avoid more than 5-6 tags in a row to reduce cognitive load.',
      ],
      getChecks: (sc) => [
        { label: 'Tag text AA', threshold: 4.5, fg: sc.text, bg: sc.surface },
        { label: 'Tag text AAA', threshold: 7.0, fg: sc.text, bg: sc.surface },
      ],
      code: `<div className={styles.tagRow}>
  <span className={styles.tag}>Design</span>
  <span className={styles.tag}>Accessibility</span>
  <span className={styles.tag}>React</span>
</div>

/* CSS Module */
.tag {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
}`,
      render: (sc) => (
        <div
          className={styles.demoTagRow}
          style={{
            '--scheme-surface': sc.surface,
            '--scheme-border': sc.border,
            '--scheme-text': sc.text,
          } as React.CSSProperties}
        >
          {['Design', 'Accessibility', 'React', 'CSS Modules'].map((tag) => (
            <span key={tag} className={styles.demoTag}>
              {tag}
            </span>
          ))}
        </div>
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// WCAG helpers
// ---------------------------------------------------------------------------

interface ContrastResult {
  label: string
  threshold: number
  ratio: number
  pass: boolean
}

function getContrastResults(checks: WcagCheck[]): ContrastResult[] {
  return checks.map((c) => {
    const ratio = parseFloat(contrastRatio(c.fg, c.bg))
    return { label: c.label, threshold: c.threshold, ratio, pass: ratio >= c.threshold }
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SchemeSwitcher({
  active,
  onChange,
}: {
  active: ColorScheme
  onChange: (s: ColorScheme) => void
}) {
  const schemes: ColorScheme[] = ['default', 'high-contrast', 'accessible']
  return (
    <div className={styles.schemeSwitcher}>
      <span className={styles.schemeLabel}>Color scheme:</span>
      {schemes.map((s) => (
        <button
          key={s}
          className={`${styles.schemeBtn} ${active === s ? styles.schemeBtnActive : ''}`}
          onClick={() => onChange(s)}
          aria-pressed={active === s}
        >
          {SCHEME_LABELS[s]}
        </button>
      ))}
    </div>
  )
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable in this environment
    }
  }, [code])

  return (
    <button
      className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
      onClick={handleCopy}
      aria-label="Copy code snippet"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function MetricsPanel({ results, tips }: { results: ContrastResult[]; tips: string[] }) {
  return (
    <div className={styles.metricsPanel}>
      <span className={styles.metricsLabel}>Accessibility Metrics</span>
      <div className={styles.metricsTable}>
        {results.map((r) => (
          <div
            key={r.label}
            className={`${styles.metricRow} ${r.pass ? styles.metricRowPass : styles.metricRowFail}`}
          >
            <span className={styles.metricBadge}>{r.pass ? '✓' : '✗'}</span>
            <span className={styles.metricName}>{r.label}</span>
            <span className={styles.metricRatio}>{r.ratio.toFixed(2)}:1</span>
            {!r.pass && <span className={styles.warningBadge}>Fails {r.threshold}:1</span>}
          </div>
        ))}
      </div>

      <span className={styles.metricsLabel}>Accessibility Tips</span>
      <ul className={styles.tipsList}>
        {tips.map((tip) => (
          <li key={tip} className={styles.tip}>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ComponentCard({
  def,
  scheme,
}: {
  def: ComponentDef
  scheme: SchemeColors
}) {
  const checks = def.getChecks(scheme)
  const results = getContrastResults(checks)

  return (
    <article className={styles.componentCard}>
      <h2 className={styles.componentCardTitle}>{def.title}</h2>
      <div className={styles.componentCardBody}>
        <div className={styles.previewPanel}>
          <span className={styles.previewLabel}>Preview</span>
          <div className={styles.previewArea}>{def.render(scheme)}</div>
        </div>
        <MetricsPanel results={results} tips={def.tips} />
      </div>
      <div className={styles.codeViewer}>
        <div className={styles.codeViewerHeader}>
          <span className={styles.codeViewerTitle}>JSX / CSS</span>
          <CopyButton code={def.code} />
        </div>
        <pre className={styles.codeBlock}>{def.code}</pre>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const COMPONENTS = buildComponents()

export default function ComponentsShowcasePage() {
  const [scheme, setScheme] = useState<ColorScheme>('default')
  const schemeColors = COLOR_SCHEMES[scheme]

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Component Showcase</h1>
        <p className={styles.pageSubtitle}>
          Live preview of UI patterns with real-time WCAG contrast validation.
          Toggle between color schemes to see accessibility metrics update instantly.
        </p>
        <SchemeSwitcher active={scheme} onChange={setScheme} />
      </header>

      <div className={styles.componentGrid}>
        {COMPONENTS.map((def) => (
          <ComponentCard key={def.id} def={def} scheme={schemeColors} />
        ))}
      </div>
    </main>
  )
}
