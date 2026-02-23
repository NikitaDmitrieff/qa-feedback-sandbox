'use client'

import { useRef } from 'react'
import type { StylePersonality } from '@/app/lib/tokenGenerator'
import styles from './BrandKitInputPanel.module.css'

interface BrandKitInputPanelProps {
  primaryColor: string
  brandName: string
  personality: StylePersonality
  neutralTinted: boolean
  onColorChange: (hex: string) => void
  onBrandNameChange: (name: string) => void
  onPersonalityChange: (p: StylePersonality) => void
  onNeutralTintedChange: (tinted: boolean) => void
}

const PERSONALITIES: { value: StylePersonality; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Cooler hues, tight contrast' },
  { value: 'playful', label: 'Playful', description: 'Hue rotated +15°' },
  { value: 'bold', label: 'Bold', description: 'Saturation +15%' },
  { value: 'minimal', label: 'Minimal', description: 'Reduced saturation' },
]

export function BrandKitInputPanel({
  primaryColor,
  brandName,
  personality,
  neutralTinted,
  onColorChange,
  onBrandNameChange,
  onPersonalityChange,
  onNeutralTintedChange,
}: BrandKitInputPanelProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const hexInputRef = useRef<HTMLInputElement>(null)

  const handleSwatchClick = () => {
    colorInputRef.current?.click()
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onColorChange(val)
    }
  }

  const handleHexBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
      if (hexInputRef.current) hexInputRef.current.value = primaryColor
    }
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelLabel}>Brand Input</span>
      </div>

      <div className={styles.panelBody}>
        {/* Color Picker */}
        <section className={styles.section}>
          <span className={styles.sectionLabel}>Brand Color</span>
          <div className={styles.colorPickerRow}>
            <button
              className={styles.colorSwatch}
              style={{ '--swatch-color': primaryColor } as React.CSSProperties}
              onClick={handleSwatchClick}
              aria-label={`Current brand color: ${primaryColor}. Click to change.`}
              title="Click to open color picker"
            >
              <input
                ref={colorInputRef}
                type="color"
                className={styles.nativeColorInput}
                value={primaryColor}
                onChange={(e) => onColorChange(e.target.value)}
                aria-hidden="true"
                tabIndex={-1}
              />
            </button>
            <div className={styles.hexInputWrapper}>
              <span className={styles.hexPrefix}>#</span>
              <input
                ref={hexInputRef}
                type="text"
                className={styles.hexInput}
                defaultValue={primaryColor}
                key={primaryColor}
                maxLength={7}
                placeholder="2563eb"
                onChange={handleHexInput}
                onBlur={handleHexBlur}
                aria-label="Hex color code"
              />
            </div>
          </div>
        </section>

        {/* Brand Name */}
        <section className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="brand-name-input">
            Brand Name
          </label>
          <input
            id="brand-name-input"
            type="text"
            className={styles.textInput}
            value={brandName}
            onChange={(e) => onBrandNameChange(e.target.value)}
            placeholder="My Brand"
            maxLength={48}
          />
        </section>

        {/* Style Personality */}
        <section className={styles.section}>
          <span className={styles.sectionLabel}>Style Personality</span>
          <div className={styles.personalityGrid} role="group" aria-label="Style personality">
            {PERSONALITIES.map(({ value, label, description }) => (
              <button
                key={value}
                className={`${styles.personalityBtn} ${personality === value ? styles.personalityBtnActive : ''}`}
                onClick={() => onPersonalityChange(value)}
                aria-pressed={personality === value}
                title={description}
              >
                <span className={styles.personalityLabel}>{label}</span>
                <span className={styles.personalityDesc}>{description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Neutral Tint */}
        <section className={styles.section}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.sectionLabel}>Neutral Tint</span>
              <span className={styles.toggleDesc}>
                {neutralTinted ? 'Brand-tinted grays' : 'Pure gray scale'}
              </span>
            </div>
            <button
              className={`${styles.toggle} ${neutralTinted ? styles.toggleOn : ''}`}
              onClick={() => onNeutralTintedChange(!neutralTinted)}
              role="switch"
              aria-checked={neutralTinted}
              aria-label="Toggle neutral tint"
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </section>

        <div className={styles.divider} />

        <div className={styles.helpText}>
          Pick a primary brand color above to generate your full design token system instantly.
          All changes update the preview in real-time.
        </div>
      </div>
    </aside>
  )
}
