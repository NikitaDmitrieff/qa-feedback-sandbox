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
