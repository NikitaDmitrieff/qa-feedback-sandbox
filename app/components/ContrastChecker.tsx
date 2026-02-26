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
          <div className={styles.colorPreview} style={{ '--preview-color': fgHex } as React.CSSProperties} aria-hidden="true" />
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
          <div className={styles.colorPreview} style={{ '--preview-color': bgHex } as React.CSSProperties} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.preview} style={{ '--preview-bg': bgHex, '--preview-fg': fgHex } as React.CSSProperties}>
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
