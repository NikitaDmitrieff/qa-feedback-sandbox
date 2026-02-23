import { hslToHex } from './tokenGenerator'

export type TempAnswer = 'warm' | 'cool' | 'neutral'
export type DensityAnswer = 'airy' | 'balanced' | 'compact'
export type EdgeAnswer = 'sharp' | 'rounded' | 'pillowy'
export type CharacterAnswer = 'bold' | 'elegant' | 'friendly'
export type SurfaceAnswer = 'white' | 'parchment' | 'dimensional'
export type AccentAnswer = 'electric' | 'muted' | 'earthy'

export interface VibeAnswers {
  temp: TempAnswer
  density: DensityAnswer
  edge: EdgeAnswer
  character: CharacterAnswer
  surface: SurfaceAnswer
  accent: AccentAnswer
}

export interface VibeTheme {
  name: string
  tagline: string
  primaryHex: string
  accentHex: string
  archetype: string
  cssVariables: Record<string, string>
}

interface ThemeData {
  name: string
  tagline: string
  archetype: string
}

// 81 deterministic theme name/tagline/archetype combos keyed by temp-edge-character-accent
const THEME_MAP: Record<string, ThemeData> = {
  // warm + sharp
  'warm-sharp-bold-electric': { name: 'Neo Brutalist Amber', tagline: 'Power made visible. No apologies.', archetype: 'Provocateur' },
  'warm-sharp-bold-muted': { name: 'Raw Ochre', tagline: 'Unfiltered craft, honest materials.', archetype: 'Maker' },
  'warm-sharp-bold-earthy': { name: 'Desert Brutalist', tagline: 'Built to last, built to be felt.', archetype: 'Architect' },
  'warm-sharp-elegant-electric': { name: 'Gilded Edge', tagline: 'Precision with a golden touch.', archetype: 'Curator' },
  'warm-sharp-elegant-muted': { name: 'Oxidized Gold', tagline: 'Refined restraint, aged with care.', archetype: 'Connoisseur' },
  'warm-sharp-elegant-earthy': { name: 'Terracotta Minimal', tagline: 'Earth tones stripped to their essence.', archetype: 'Purist' },
  'warm-sharp-friendly-electric': { name: 'Tangerine Studio', tagline: 'Sharp angles, warm welcome.', archetype: 'Host' },
  'warm-sharp-friendly-muted': { name: 'Warm Industrial', tagline: 'Function first, warmth always.', archetype: 'Builder' },
  'warm-sharp-friendly-earthy': { name: 'Clay Workshop', tagline: 'Hands in the earth, eyes on the work.', archetype: 'Artisan' },
  // warm + rounded
  'warm-rounded-bold-electric': { name: 'Ember Pop', tagline: 'Warmth cranked to full volume.', archetype: 'Energizer' },
  'warm-rounded-bold-muted': { name: 'Aged Copper', tagline: 'Bold presence, patina-rich character.', archetype: 'Elder' },
  'warm-rounded-bold-earthy': { name: 'Harvest Dark', tagline: 'Abundance distilled into form.', archetype: 'Steward' },
  'warm-rounded-elegant-electric': { name: 'Sunset Refined', tagline: 'Where warmth meets precision.', archetype: 'Aesthete' },
  'warm-rounded-elegant-muted': { name: 'Cashmere Amber', tagline: 'Soft luxury, effortless warmth.', archetype: 'Luxurist' },
  'warm-rounded-elegant-earthy': { name: 'Studio Craft', tagline: 'Thoughtful making, beautiful results.', archetype: 'Craftsperson' },
  'warm-rounded-friendly-electric': { name: 'Papaya Summer', tagline: 'Open, bright, impossible to ignore.', archetype: 'Optimist' },
  'warm-rounded-friendly-muted': { name: 'Beeswax UI', tagline: 'Sweet simplicity, natural warmth.', archetype: 'Nurturer' },
  'warm-rounded-friendly-earthy': { name: 'Terracotta Friends', tagline: 'Community, warmth, and good taste.', archetype: 'Connector' },
  // warm + pillowy
  'warm-pillowy-bold-electric': { name: 'Volcano Pop', tagline: 'Soft shapes hiding serious power.', archetype: 'Paradox' },
  'warm-pillowy-bold-muted': { name: 'Sandalwood Bold', tagline: 'Plush surfaces, strong foundations.', archetype: 'Grounded' },
  'warm-pillowy-bold-earthy': { name: 'Forest Fire', tagline: 'Wild softness, untamed warmth.', archetype: 'Wild' },
  'warm-pillowy-elegant-electric': { name: 'Peach Cloud', tagline: 'Delicate brilliance, ethereal warmth.', archetype: 'Dreamer' },
  'warm-pillowy-elegant-muted': { name: 'Linen Luxury', tagline: 'Unhurried, tactile, quietly expensive.', archetype: 'Slow' },
  'warm-pillowy-elegant-earthy': { name: 'Soft Pueblo', tagline: 'Ancient curves, modern calm.', archetype: 'Timeless' },
  'warm-pillowy-friendly-electric': { name: 'Warm Candy', tagline: 'Playful softness with a sugar rush.', archetype: 'Playful' },
  'warm-pillowy-friendly-muted': { name: 'Cozy Lounge', tagline: 'Settle in. Stay a while.', archetype: 'Welcomer' },
  'warm-pillowy-friendly-earthy': { name: 'Desert Bloom', tagline: 'Unexpected softness in warm places.', archetype: 'Tender' },
  // cool + sharp
  'cool-sharp-bold-electric': { name: 'Arctic Neon', tagline: 'Cold precision, electric charge.', archetype: 'Futurist' },
  'cool-sharp-bold-muted': { name: 'Steel Minimal', tagline: 'Stripped, cold, uncompromising.', archetype: 'Absolutist' },
  'cool-sharp-bold-earthy': { name: 'Deep Fjord', tagline: 'Ancient depths, modern clarity.', archetype: 'Explorer' },
  'cool-sharp-elegant-electric': { name: 'Crystal Sharp', tagline: 'Clarity so precise it cuts.', archetype: 'Visionary' },
  'cool-sharp-elegant-muted': { name: 'Arctic Glass', tagline: 'Whisper-thin, diamond clear.', archetype: 'Minimalist' },
  'cool-sharp-elegant-earthy': { name: 'Nordic Slate', tagline: 'Functional beauty from the far north.', archetype: 'Nordic' },
  'cool-sharp-friendly-electric': { name: 'Cyan Edge', tagline: 'Cool precision with a human pulse.', archetype: 'Humanist' },
  'cool-sharp-friendly-muted': { name: 'Blueprint', tagline: 'Technical clarity meets open warmth.', archetype: 'Engineer' },
  'cool-sharp-friendly-earthy': { name: 'Forest Minimal', tagline: 'Nature reduced to its essentials.', archetype: 'Naturalist' },
  // cool + rounded
  'cool-rounded-bold-electric': { name: 'Blue Thunder', tagline: 'Soft shapes charged with energy.', archetype: 'Dynamo' },
  'cool-rounded-bold-muted': { name: 'Abyss Round', tagline: 'Deep and rounded, quietly powerful.', archetype: 'Depth' },
  'cool-rounded-bold-earthy': { name: 'Ocean Depth', tagline: 'Below the surface, everything is rich.', archetype: 'Diver' },
  'cool-rounded-elegant-electric': { name: 'Sapphire Soft', tagline: 'Gemstone precision, pillow-soft delivery.', archetype: 'Jeweler' },
  'cool-rounded-elegant-muted': { name: 'Winter Linen', tagline: 'Quiet cool, restrained perfection.', archetype: 'Stoic' },
  'cool-rounded-elegant-earthy': { name: 'Sea Glass', tagline: 'Worn smooth by time, beautiful by accident.', archetype: 'Wanderer' },
  'cool-rounded-friendly-electric': { name: 'Sky Pop', tagline: 'Open sky, full of energy.', archetype: 'Free Spirit' },
  'cool-rounded-friendly-muted': { name: 'Cloud Nine', tagline: 'Effortlessly light, always pleasant.', archetype: 'Breezy' },
  'cool-rounded-friendly-earthy': { name: 'Rain Garden', tagline: 'Growth, cool light, gentle presence.', archetype: 'Grower' },
  // cool + pillowy
  'cool-pillowy-bold-electric': { name: 'Neon Fog', tagline: 'Electric signals through cool clouds.', archetype: 'Phantom' },
  'cool-pillowy-bold-muted': { name: 'Storm Cloud', tagline: 'Power building quietly inside.', archetype: 'Tension' },
  'cool-pillowy-bold-earthy': { name: 'Mossy Slate', tagline: 'Hard surfaces made soft by time.', archetype: 'Patient' },
  'cool-pillowy-elegant-electric': { name: 'Ice Palace', tagline: 'Crystalline perfection, cool forever.', archetype: 'Eternal' },
  'cool-pillowy-elegant-muted': { name: 'Pewter Mist', tagline: 'Soft silver, understated luxury.', archetype: 'Subtle' },
  'cool-pillowy-elegant-earthy': { name: 'Driftwood', tagline: 'Found beauty, worn and wise.', archetype: 'Sage' },
  'cool-pillowy-friendly-electric': { name: 'Aqua Soft', tagline: 'Cool and bubbly, always refreshing.', archetype: 'Fresh' },
  'cool-pillowy-friendly-muted': { name: 'Winter Soft', tagline: 'Gentle cold, endlessly cozy.', archetype: 'Cozy' },
  'cool-pillowy-friendly-earthy': { name: 'Coastal Calm', tagline: 'Horizon-wide, steadily peaceful.', archetype: 'Stillness' },
  // neutral + sharp
  'neutral-sharp-bold-electric': { name: 'Grid Shock', tagline: 'Neutral ground, electric charge.', archetype: 'Disruptor' },
  'neutral-sharp-bold-muted': { name: 'Graphite Raw', tagline: 'Unfinished, unstoppable, unapologetic.', archetype: 'Rawness' },
  'neutral-sharp-bold-earthy': { name: 'Concrete Earth', tagline: 'Urban bones, earthy soul.', archetype: 'Urban' },
  'neutral-sharp-elegant-electric': { name: 'Minimal Signal', tagline: 'Everything unnecessary removed.', archetype: 'Signal' },
  'neutral-sharp-elegant-muted': { name: 'Bone Precise', tagline: 'Stripped to structure, perfected.', archetype: 'Structure' },
  'neutral-sharp-elegant-earthy': { name: 'Ash Elegance', tagline: 'What remains when all is burned away.', archetype: 'Essence' },
  'neutral-sharp-friendly-electric': { name: 'Studio Grid', tagline: 'Working space, creative charge.', archetype: 'Creator' },
  'neutral-sharp-friendly-muted': { name: 'Swiss Neutral', tagline: 'Nothing wasted. Everything considered.', archetype: 'Rationalist' },
  'neutral-sharp-friendly-earthy': { name: 'Paper Workshop', tagline: 'Ideas, materials, honest labor.', archetype: 'Maker' },
  // neutral + rounded
  'neutral-rounded-bold-electric': { name: 'Bold Cement', tagline: 'Industrial form with vivid energy.', archetype: 'Hybrid' },
  'neutral-rounded-bold-muted': { name: 'Stone Quiet', tagline: 'Massive presence, minimal noise.', archetype: 'Monument' },
  'neutral-rounded-bold-earthy': { name: 'Pebble Strong', tagline: 'Smooth, heavy, satisfying.', archetype: 'Solid' },
  'neutral-rounded-elegant-electric': { name: 'Pearl Accent', tagline: 'Neutral base, unexpected light.', archetype: 'Surprise' },
  'neutral-rounded-elegant-muted': { name: 'Stone Refined', tagline: 'Time-worn grace, modern ease.', archetype: 'Grace' },
  'neutral-rounded-elegant-earthy': { name: 'Oatmeal Luxe', tagline: 'Simple ingredients, elevated form.', archetype: 'Elevated' },
  'neutral-rounded-friendly-electric': { name: 'Warm Noise', tagline: 'Busy, friendly, full of life.', archetype: 'Community' },
  'neutral-rounded-friendly-muted': { name: 'Gray Friendly', tagline: 'Unassuming and approachable.', archetype: 'Approachable' },
  'neutral-rounded-friendly-earthy': { name: 'Birch Studio', tagline: 'Natural grain, creative flow.', archetype: 'Flow' },
  // neutral + pillowy
  'neutral-pillowy-bold-electric': { name: 'Cotton Punch', tagline: 'Soft shell, serious punch.', archetype: 'Surprise' },
  'neutral-pillowy-bold-muted': { name: 'Fog Heavy', tagline: 'Obscured weight, hidden power.', archetype: 'Mystery' },
  'neutral-pillowy-bold-earthy': { name: 'Cement Garden', tagline: 'Hard surfaces, growing things.', archetype: 'Growth' },
  'neutral-pillowy-elegant-electric': { name: 'Cloud Precise', tagline: 'Soft edges, sharp mind.', archetype: 'Clarity' },
  'neutral-pillowy-elegant-muted': { name: 'Milk Glass', tagline: 'Translucent simplicity, enduring form.', archetype: 'Form' },
  'neutral-pillowy-elegant-earthy': { name: 'Parchment Soft', tagline: 'Pages worn thin by gentle hands.', archetype: 'Archive' },
  'neutral-pillowy-friendly-electric': { name: 'Soft Noise', tagline: 'Comfortable chaos, friendly mess.', archetype: 'Playful' },
  'neutral-pillowy-friendly-muted': { name: 'Sunday Morning', tagline: 'Nothing urgent. Everything gentle.', archetype: 'Rest' },
  'neutral-pillowy-friendly-earthy': { name: 'Harvest Neutral', tagline: 'Quiet abundance, soft gratitude.', archetype: 'Grateful' },
}

export function generateVibeTheme(answers: VibeAnswers): VibeTheme {
  // --- Primary hue from temperature ---
  let primaryHue: number
  let primarySat: number

  if (answers.temp === 'warm') {
    primaryHue = answers.character === 'bold' ? 22 : answers.character === 'elegant' ? 30 : 37
    primarySat = 65
  } else if (answers.temp === 'cool') {
    primaryHue = answers.character === 'bold' ? 210 : answers.character === 'elegant' ? 230 : 200
    primarySat = 60
  } else {
    // neutral — very low saturation warm gray
    primaryHue = 30
    primarySat = 8
  }

  // Adjust saturation based on accent energy
  if (answers.accent === 'electric') primarySat = Math.min(primarySat + 20, 100)
  else if (answers.accent === 'muted') primarySat = Math.max(primarySat - 20, 0)

  // Adjust saturation based on character
  if (answers.character === 'bold') primarySat = Math.min(primarySat + 10, 100)
  else if (answers.character === 'elegant') primarySat = Math.max(primarySat - 8, 0)

  const primaryL = answers.character === 'bold' ? 35 : answers.character === 'elegant' ? 42 : 45
  const primaryHex = hslToHex(primaryHue, primarySat, primaryL)

  // --- Accent hue ---
  let accentHue: number
  let accentSat: number

  if (answers.accent === 'electric') {
    accentHue = (primaryHue + 210) % 360
    accentSat = 85
  } else if (answers.accent === 'earthy') {
    accentHue = answers.temp === 'cool' ? 120 : 20
    accentSat = 55
  } else {
    // muted — complementary but desaturated
    accentHue = (primaryHue + 180) % 360
    accentSat = 18
  }
  const accentL = answers.character === 'bold' ? 42 : 48
  const accentHex = hslToHex(accentHue, accentSat, accentL)

  // --- Border radius ---
  const radiusMap: Record<EdgeAnswer, string> = {
    sharp: '0px',
    rounded: '6px',
    pillowy: '16px',
  }
  const radiusLgMap: Record<EdgeAnswer, string> = {
    sharp: '0px',
    rounded: '12px',
    pillowy: '24px',
  }
  const radius = radiusMap[answers.edge]
  const radiusLg = radiusLgMap[answers.edge]

  // --- Spacing multiplier ---
  const spacingMap: Record<DensityAnswer, number> = {
    airy: 1.5,
    balanced: 1.0,
    compact: 0.6,
  }
  const spacingUnit = spacingMap[answers.density]

  // --- Font weights ---
  const weightMap: Record<CharacterAnswer, { display: string; body: string }> = {
    bold: { display: '800', body: '500' },
    elegant: { display: '300', body: '300' },
    friendly: { display: '600', body: '400' },
  }
  const weights = weightMap[answers.character]

  // --- Background & surface ---
  let bgHex: string
  let surfaceHex: string
  if (answers.surface === 'white') {
    bgHex = '#ffffff'
    surfaceHex = hslToHex(0, 0, 97)
  } else if (answers.surface === 'parchment') {
    bgHex = hslToHex(36, 35, 97)
    surfaceHex = hslToHex(36, 28, 93)
  } else {
    // dimensional
    bgHex = hslToHex(primaryHue, 12, 97)
    surfaceHex = hslToHex(primaryHue, 8, 93)
  }

  const shadowValue =
    answers.surface === 'dimensional'
      ? '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)'
      : answers.surface === 'white'
        ? '0 1px 3px rgba(0,0,0,0.06)'
        : '0 2px 12px rgba(0,0,0,0.08)'

  // --- Text colors ---
  const textHue = answers.temp === 'warm' ? primaryHue : answers.temp === 'cool' ? primaryHue : 30
  const textHex = hslToHex(textHue, answers.character === 'bold' ? 18 : 8, 12)
  const textMutedHex = hslToHex(textHue, 6, 48)
  const borderHex =
    answers.surface === 'dimensional'
      ? hslToHex(primaryHue, 10, 84)
      : hslToHex(0, 0, 87)

  // --- Primary button text ---
  const primaryTextHex = '#ffffff'

  const cssVariables: Record<string, string> = {
    '--vibe-primary': primaryHex,
    '--vibe-primary-text': primaryTextHex,
    '--vibe-accent': accentHex,
    '--vibe-bg': bgHex,
    '--vibe-surface': surfaceHex,
    '--vibe-border': borderHex,
    '--vibe-text': textHex,
    '--vibe-text-muted': textMutedHex,
    '--vibe-radius': radius,
    '--vibe-radius-lg': radiusLg,
    '--vibe-spacing': `${spacingUnit}rem`,
    '--vibe-font-weight-display': weights.display,
    '--vibe-font-weight-body': weights.body,
    '--vibe-shadow': shadowValue,
  }

  const key = `${answers.temp}-${answers.edge}-${answers.character}-${answers.accent}`
  const themeData: ThemeData = THEME_MAP[key] ?? {
    name: 'Custom Vibe',
    tagline: 'Your unique design personality.',
    archetype: 'Original',
  }

  return {
    name: themeData.name,
    tagline: themeData.tagline,
    archetype: themeData.archetype,
    primaryHex,
    accentHex,
    cssVariables,
  }
}
