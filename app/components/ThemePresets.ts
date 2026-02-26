// [h, s%, l%] tuple representing an HSL color
export type HSLTuple = [number, number, number]

export interface TokenValues {
  primary: HSLTuple
  success: HSLTuple
  warning: HSLTuple
  error: HSLTuple
  surface: HSLTuple
  text: HSLTuple
}

export interface ThemePreset {
  name: string
  tokens: TokenValues
}

export const DEFAULT_TOKENS: TokenValues = {
  primary: [217, 91, 60],
  success: [142, 72, 45],
  warning: [38, 92, 50],
  error: [0, 72, 51],
  surface: [0, 0, 100],
  text: [220, 26, 14],
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Default',
    tokens: DEFAULT_TOKENS,
  },
  {
    name: 'Midnight',
    tokens: {
      primary: [220, 100, 60],
      success: [162, 80, 42],
      warning: [43, 100, 52],
      error: [351, 90, 58],
      surface: [222, 47, 11],
      text: [210, 100, 90],
    },
  },
  {
    name: 'Sunrise',
    tokens: {
      primary: [25, 88, 55],
      success: [142, 58, 38],
      warning: [35, 95, 52],
      error: [0, 84, 54],
      surface: [36, 42, 97],
      text: [22, 32, 18],
    },
  },
  {
    name: 'Forest',
    tokens: {
      primary: [138, 58, 33],
      success: [120, 48, 33],
      warning: [45, 82, 48],
      error: [0, 68, 48],
      surface: [82, 14, 95],
      text: [103, 24, 14],
    },
  },
  {
    name: 'Neon Pulse',
    tokens: {
      primary: [279, 100, 65],
      success: [122, 100, 50],
      warning: [48, 100, 55],
      error: [348, 100, 55],
      surface: [240, 20, 8],
      text: [0, 0, 95],
    },
  },
]
