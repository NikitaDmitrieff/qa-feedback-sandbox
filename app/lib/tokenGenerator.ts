import { contrastRatioValue, meetsWcagAA, meetsWcagAAA } from './contrast'

export type StylePersonality = 'professional' | 'playful' | 'bold' | 'minimal'

export type ColorScale = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface SemanticTokens {
  success: string
  warning: string
  error: string
  info: string
}

export interface DesignTokens {
  primary: ColorScale
  accent: ColorScale
  neutral: ColorScale
  semantic: SemanticTokens
}

export interface TokenValidation {
  fg: string
  bg: string
  label: string
  ratio: number
  passesAA: boolean
  passesAAA: boolean
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

const LIGHTNESS_MAP: Record<number, number> = {
  50: 97, 100: 93, 200: 86, 300: 77, 400: 67,
  500: 56, 600: 44, 700: 33, 800: 22, 900: 12,
}

const SAT_SCALE: Record<number, number> = {
  50: 0.10, 100: 0.25, 200: 0.50, 300: 0.75, 400: 0.90,
  500: 1.00, 600: 1.00, 700: 0.95, 800: 0.90, 900: 0.85,
}

// Convert hex to HSL: h in [0,360], s and l in [0,100]
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return [0, 0, l * 100]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h /= 6

  return [h * 360, s * 100, l * 100]
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s))
  l = Math.max(0, Math.min(100, l))

  const hn = h / 360
  const sn = s / 100
  const ln = l / 100

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number
  if (sn === 0) {
    r = g = b = ln
  } else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3)
    g = hue2rgb(p, q, hn)
    b = hue2rgb(p, q, hn - 1 / 3)
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Generate 9-step (50–900) color scale from a hex input
export function generatePalette(
  hex: string,
  personality: StylePersonality = 'professional',
): ColorScale {
  let [h, s] = hexToHsl(hex)

  if (personality === 'playful') h = (h + 15) % 360
  if (personality === 'bold') s = Math.min(100, s + 15)
  if (personality === 'minimal') s = Math.max(0, s - 10)

  s = Math.max(s, 30)

  const scale: Partial<ColorScale> = {}
  for (const step of STEPS) {
    const stepL = LIGHTNESS_MAP[step]
    const stepS = s * SAT_SCALE[step]
    ;(scale as Record<number, string>)[step] = hslToHex(h, stepS, stepL)
  }

  return scale as ColorScale
}

// Generate split-complementary accent scale at +150°
export function generateAccent(primary: string): ColorScale {
  const [h, s, l] = hexToHsl(primary)
  const accentHex = hslToHex((h + 150) % 360, s, l)
  return generatePalette(accentHex)
}

// Generate neutral gray scale, optionally tinted with brand hue at 8%
export function generateNeutrals(primary: string, tinted: boolean): ColorScale {
  const [h, s] = hexToHsl(primary)
  const scale: Partial<ColorScale> = {}

  for (const step of STEPS) {
    const l = LIGHTNESS_MAP[step]
    const neutralS = tinted ? s * 0.08 : 0
    ;(scale as Record<number, string>)[step] = hslToHex(tinted ? h : 0, neutralS, l)
  }

  return scale as ColorScale
}

// Map success/warning/error/info to accessible shades derived from the palette
export function generateSemantics(palette: ColorScale): SemanticTokens {
  const [, baseSat, baseL] = hexToHsl(palette[600])
  const sat = Math.max(60, Math.min(80, baseSat))
  const safeL = Math.min(baseL, 40)

  return {
    success: hslToHex(142, sat, safeL),
    warning: hslToHex(38, sat + 5, Math.min(safeL + 5, 45)),
    error: hslToHex(4, sat, safeL),
    info: hslToHex(217, sat, safeL),
  }
}

// Validate text/background pairs for WCAG compliance
export function validateAll(tokens: DesignTokens): TokenValidation[] {
  const results: TokenValidation[] = []
  const white = '#ffffff'
  const textDark = tokens.neutral[900]
  const textMid = tokens.neutral[600]

  for (const step of [500, 600, 700] as const) {
    const hex = tokens.primary[step]
    results.push({
      fg: hex,
      bg: white,
      label: `primary-${step} / white`,
      ratio: contrastRatioValue(hex, white),
      passesAA: meetsWcagAA(hex, white),
      passesAAA: meetsWcagAAA(hex, white),
    })
  }

  for (const bgStep of [50, 100, 200] as const) {
    const bg = tokens.neutral[bgStep]
    results.push({
      fg: textDark,
      bg,
      label: `text / neutral-${bgStep}`,
      ratio: contrastRatioValue(textDark, bg),
      passesAA: meetsWcagAA(textDark, bg),
      passesAAA: meetsWcagAAA(textDark, bg),
    })
    results.push({
      fg: textMid,
      bg,
      label: `text-muted / neutral-${bgStep}`,
      ratio: contrastRatioValue(textMid, bg),
      passesAA: meetsWcagAA(textMid, bg),
      passesAAA: meetsWcagAAA(textMid, bg),
    })
  }

  const semanticEntries = Object.entries(tokens.semantic) as Array<[string, string]>
  for (const [key, hex] of semanticEntries) {
    results.push({
      fg: hex,
      bg: white,
      label: `${key} / white`,
      ratio: contrastRatioValue(hex, white),
      passesAA: meetsWcagAA(hex, white),
      passesAAA: meetsWcagAAA(hex, white),
    })
  }

  return results
}

// Generate all tokens from a primary hex, personality, and neutral tint setting
export function generateAllTokens(
  primaryHex: string,
  personality: StylePersonality,
  tinted: boolean,
): DesignTokens {
  const primary = generatePalette(primaryHex, personality)
  const accent = generateAccent(primaryHex)
  const neutral = generateNeutrals(primaryHex, tinted)
  const semantic = generateSemantics(primary)

  return { primary, accent, neutral, semantic }
}

// Build CSS custom property vars for the preview canvas
export function buildCanvasVars(tokens: DesignTokens): Record<string, string> {
  const white = '#ffffff'
  const primaryText =
    contrastRatioValue(tokens.primary[600], white) >= 4.5 ? white : tokens.neutral[900]
  const accentText =
    contrastRatioValue(tokens.accent[500], white) >= 4.5 ? white : tokens.neutral[900]

  const tinted = (hex: string, targetL: number, sat = 0.3): string => {
    const [h, s] = hexToHsl(hex)
    return hslToHex(h, s * sat, targetL)
  }

  const darkText = (hex: string): string => {
    const [h, s] = hexToHsl(hex)
    return hslToHex(h, s * 0.8, 24)
  }

  return {
    '--bk-primary-50': tokens.primary[50],
    '--bk-primary-100': tokens.primary[100],
    '--bk-primary-200': tokens.primary[200],
    '--bk-primary-300': tokens.primary[300],
    '--bk-primary-400': tokens.primary[400],
    '--bk-primary-500': tokens.primary[500],
    '--bk-primary-600': tokens.primary[600],
    '--bk-primary-700': tokens.primary[700],
    '--bk-primary-800': tokens.primary[800],
    '--bk-primary-900': tokens.primary[900],

    '--bk-accent-50': tokens.accent[50],
    '--bk-accent-100': tokens.accent[100],
    '--bk-accent-200': tokens.accent[200],
    '--bk-accent-300': tokens.accent[300],
    '--bk-accent-400': tokens.accent[400],
    '--bk-accent-500': tokens.accent[500],
    '--bk-accent-600': tokens.accent[600],
    '--bk-accent-700': tokens.accent[700],
    '--bk-accent-800': tokens.accent[800],
    '--bk-accent-900': tokens.accent[900],

    '--bk-neutral-50': tokens.neutral[50],
    '--bk-neutral-100': tokens.neutral[100],
    '--bk-neutral-200': tokens.neutral[200],
    '--bk-neutral-300': tokens.neutral[300],
    '--bk-neutral-400': tokens.neutral[400],
    '--bk-neutral-500': tokens.neutral[500],
    '--bk-neutral-600': tokens.neutral[600],
    '--bk-neutral-700': tokens.neutral[700],
    '--bk-neutral-800': tokens.neutral[800],
    '--bk-neutral-900': tokens.neutral[900],

    '--bk-bg': tokens.neutral[50],
    '--bk-surface': tokens.neutral[100],
    '--bk-border': tokens.neutral[200],
    '--bk-text': tokens.neutral[900],
    '--bk-text-muted': tokens.neutral[500],

    '--bk-primary': tokens.primary[600],
    '--bk-primary-text': primaryText,
    '--bk-primary-hover': tokens.primary[700],

    '--bk-accent': tokens.accent[500],
    '--bk-accent-text': accentText,

    '--bk-success': tokens.semantic.success,
    '--bk-success-bg': tinted(tokens.semantic.success, 96, 0.25),
    '--bk-success-border': tinted(tokens.semantic.success, 85, 0.35),
    '--bk-success-text': darkText(tokens.semantic.success),

    '--bk-warning': tokens.semantic.warning,
    '--bk-warning-bg': tinted(tokens.semantic.warning, 96, 0.25),
    '--bk-warning-border': tinted(tokens.semantic.warning, 85, 0.35),
    '--bk-warning-text': darkText(tokens.semantic.warning),

    '--bk-error': tokens.semantic.error,
    '--bk-error-bg': tinted(tokens.semantic.error, 96, 0.25),
    '--bk-error-border': tinted(tokens.semantic.error, 85, 0.35),
    '--bk-error-text': darkText(tokens.semantic.error),

    '--bk-info': tokens.semantic.info,
    '--bk-info-bg': tinted(tokens.semantic.info, 96, 0.25),
    '--bk-info-border': tinted(tokens.semantic.info, 85, 0.35),
    '--bk-info-text': darkText(tokens.semantic.info),
  }
}

// Export: CSS :root block
export function tokensToCSS(tokens: DesignTokens, brandName: string): string {
  const lines: string[] = [`/* ${brandName} — Generated Design Tokens */`, ':root {']

  lines.push('  /* Primary Scale */')
  for (const step of STEPS) {
    lines.push(`  --color-primary-${step}: ${(tokens.primary as Record<number, string>)[step]};`)
  }

  lines.push('  /* Accent Scale */')
  for (const step of STEPS) {
    lines.push(`  --color-accent-${step}: ${(tokens.accent as Record<number, string>)[step]};`)
  }

  lines.push('  /* Neutral Scale */')
  for (const step of STEPS) {
    lines.push(`  --color-neutral-${step}: ${(tokens.neutral as Record<number, string>)[step]};`)
  }

  lines.push('  /* Semantic */')
  lines.push(`  --color-success: ${tokens.semantic.success};`)
  lines.push(`  --color-warning: ${tokens.semantic.warning};`)
  lines.push(`  --color-error: ${tokens.semantic.error};`)
  lines.push(`  --color-info: ${tokens.semantic.info};`)

  lines.push('}')
  return lines.join('\n')
}

// Export: design-tool compatible token JSON
export function tokensToJSON(tokens: DesignTokens, brandName: string): object {
  const formatScale = (scale: ColorScale) => {
    const out: Record<string, { value: string; type: string }> = {}
    for (const step of STEPS) {
      out[step] = { value: (scale as Record<number, string>)[step], type: 'color' }
    }
    return out
  }

  return {
    meta: {
      brandName,
      generatedAt: new Date().toISOString(),
      format: 'design-tokens',
    },
    color: {
      primary: formatScale(tokens.primary),
      accent: formatScale(tokens.accent),
      neutral: formatScale(tokens.neutral),
      semantic: {
        success: { value: tokens.semantic.success, type: 'color' },
        warning: { value: tokens.semantic.warning, type: 'color' },
        error: { value: tokens.semantic.error, type: 'color' },
        info: { value: tokens.semantic.info, type: 'color' },
      },
    },
  }
}
