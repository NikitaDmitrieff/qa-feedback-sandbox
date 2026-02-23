'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateVibeTheme } from '@/app/lib/vibeThemeGenerator'
import type {
  VibeTheme,
  TempAnswer,
  DensityAnswer,
  EdgeAnswer,
  CharacterAnswer,
  SurfaceAnswer,
  AccentAnswer,
} from '@/app/lib/vibeThemeGenerator'
import styles from './VibeQuiz.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MockupConfig {
  bg: string
  cardBg: string
  swatches: string[]
  headingColor: string
  bodyColor: string
  buttonBg: string
  buttonText: string
  radius: string
  padding: string
  gap: string
  fontWeight: number
  fontSize: number
  shadow: string
  border: string
}

interface AnswerOption {
  id: string
  label: string
  sublabel: string
  previewBg: string
  mockup: MockupConfig
}

interface QuizQuestion {
  number: string
  question: string
  answers: AnswerOption[]
}

// ─── Questions ───────────────────────────────────────────────────────────────

const QUESTIONS: QuizQuestion[] = [
  {
    number: '01',
    question: 'What temperature does your space radiate?',
    answers: [
      {
        id: 'warm',
        label: 'Warm & Earthy',
        sublabel: 'Terracotta, ochre, amber',
        previewBg: '#2a1a0e',
        mockup: {
          bg: '#faf3ec',
          cardBg: '#fff8f0',
          swatches: ['#C4622D', '#D4845A', '#E8B49A'],
          headingColor: '#3d1f0a',
          bodyColor: '#7a4f36',
          buttonBg: '#C4622D',
          buttonText: '#ffffff',
          radius: '6px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 4px rgba(100,40,0,0.12)',
          border: '1px solid #e8d5c4',
        },
      },
      {
        id: 'cool',
        label: 'Cool & Crisp',
        sublabel: 'Slate, ice, deep blue',
        previewBg: '#0a121e',
        mockup: {
          bg: '#f0f4f8',
          cardBg: '#f8fafc',
          swatches: ['#2D5B8A', '#4A7FA8', '#7AAAC9'],
          headingColor: '#0f2942',
          bodyColor: '#4a6a8a',
          buttonBg: '#2D5B8A',
          buttonText: '#ffffff',
          radius: '6px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 4px rgba(0,40,100,0.10)',
          border: '1px solid #c8d9ea',
        },
      },
      {
        id: 'neutral',
        label: 'Neutral & Balanced',
        sublabel: 'Stone, ash, warm gray',
        previewBg: '#141210',
        mockup: {
          bg: '#f5f4f2',
          cardBg: '#fafaf9',
          swatches: ['#8B8078', '#B3ADA8', '#D4D0CC'],
          headingColor: '#2a2620',
          bodyColor: '#706a64',
          buttonBg: '#6B645D',
          buttonText: '#ffffff',
          radius: '6px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #ddd9d4',
        },
      },
    ],
  },
  {
    number: '02',
    question: 'How much breathing room do you prefer?',
    answers: [
      {
        id: 'airy',
        label: 'Airy & Spacious',
        sublabel: 'Generous margins, open layouts',
        previewBg: '#10160e',
        mockup: {
          bg: '#f8faf8',
          cardBg: '#ffffff',
          swatches: ['#5a9e6e', '#8cbfa0', '#c4e0cd'],
          headingColor: '#1a2e20',
          bodyColor: '#5a7a64',
          buttonBg: '#5a9e6e',
          buttonText: '#ffffff',
          radius: '8px',
          padding: '22px',
          gap: '18px',
          fontWeight: 400,
          fontSize: 10,
          shadow: 'none',
          border: '1px solid #d4e8db',
        },
      },
      {
        id: 'balanced',
        label: 'Balanced',
        sublabel: 'Standard density, comfortable',
        previewBg: '#0e1018',
        mockup: {
          bg: '#f4f5f7',
          cardBg: '#ffffff',
          swatches: ['#4a6cf7', '#7a93f9', '#b8c7fc'],
          headingColor: '#1a1d2e',
          bodyColor: '#5a6080',
          buttonBg: '#4a6cf7',
          buttonText: '#ffffff',
          radius: '8px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e0e3f0',
        },
      },
      {
        id: 'compact',
        label: 'Compact & Dense',
        sublabel: 'Information-rich, efficient',
        previewBg: '#0a0c14',
        mockup: {
          bg: '#f0f1f5',
          cardBg: '#ffffff',
          swatches: ['#7c3aed', '#a668f8', '#d4b4fc'],
          headingColor: '#1e1135',
          bodyColor: '#5a4578',
          buttonBg: '#7c3aed',
          buttonText: '#ffffff',
          radius: '4px',
          padding: '7px',
          gap: '5px',
          fontWeight: 600,
          fontSize: 9,
          shadow: 'none',
          border: '1px solid #d4ceea',
        },
      },
    ],
  },
  {
    number: '03',
    question: 'What kind of edges define your world?',
    answers: [
      {
        id: 'sharp',
        label: 'Sharp & Direct',
        sublabel: 'Zero radius, precise corners',
        previewBg: '#0a0a0a',
        mockup: {
          bg: '#f2f2f2',
          cardBg: '#ffffff',
          swatches: ['#1a1a1a', '#4a4a4a', '#8a8a8a'],
          headingColor: '#0a0a0a',
          bodyColor: '#4a4a4a',
          buttonBg: '#1a1a1a',
          buttonText: '#ffffff',
          radius: '0px',
          padding: '14px',
          gap: '10px',
          fontWeight: 700,
          fontSize: 10,
          shadow: 'none',
          border: '1px solid #cccccc',
        },
      },
      {
        id: 'rounded',
        label: 'Slightly Rounded',
        sublabel: '6px radius, approachable',
        previewBg: '#0e1420',
        mockup: {
          bg: '#f0f4f8',
          cardBg: '#ffffff',
          swatches: ['#2563eb', '#60a5fa', '#bfdbfe'],
          headingColor: '#0f172a',
          bodyColor: '#475569',
          buttonBg: '#2563eb',
          buttonText: '#ffffff',
          radius: '6px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #dde5f0',
        },
      },
      {
        id: 'pillowy',
        label: 'Soft & Pillowy',
        sublabel: '16px radius, cushioned',
        previewBg: '#160e1a',
        mockup: {
          bg: '#faf4ff',
          cardBg: '#ffffff',
          swatches: ['#9333ea', '#c084fc', '#e9d5ff'],
          headingColor: '#3b0764',
          bodyColor: '#7e22ce',
          buttonBg: '#9333ea',
          buttonText: '#ffffff',
          radius: '16px',
          padding: '16px',
          gap: '12px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 4px 16px rgba(147,51,234,0.15)',
          border: '1px solid #e9d5ff',
        },
      },
    ],
  },
  {
    number: '04',
    question: 'What character does your typography carry?',
    answers: [
      {
        id: 'bold',
        label: 'Bold Statement',
        sublabel: 'Heavy weights, strong contrast',
        previewBg: '#08060a',
        mockup: {
          bg: '#f0edf5',
          cardBg: '#ffffff',
          swatches: ['#1a0a2e', '#5c35a8', '#c4a8f8'],
          headingColor: '#0a0514',
          bodyColor: '#2a1550',
          buttonBg: '#1a0a2e',
          buttonText: '#ffffff',
          radius: '4px',
          padding: '14px',
          gap: '8px',
          fontWeight: 900,
          fontSize: 12,
          shadow: '0 2px 8px rgba(0,0,0,0.18)',
          border: '2px solid #1a0a2e',
        },
      },
      {
        id: 'elegant',
        label: 'Refined Elegance',
        sublabel: 'Light weights, subtle contrast',
        previewBg: '#12100e',
        mockup: {
          bg: '#faf9f7',
          cardBg: '#ffffff',
          swatches: ['#c9a86c', '#e0c898', '#f5ecd8'],
          headingColor: '#2c2416',
          bodyColor: '#9a8870',
          buttonBg: '#c9a86c',
          buttonText: '#ffffff',
          radius: '2px',
          padding: '18px',
          gap: '14px',
          fontWeight: 300,
          fontSize: 10,
          shadow: 'none',
          border: '1px solid #e8deca',
        },
      },
      {
        id: 'friendly',
        label: 'Friendly & Open',
        sublabel: 'Medium weights, colorful accents',
        previewBg: '#0e1210',
        mockup: {
          bg: '#f2faf4',
          cardBg: '#ffffff',
          swatches: ['#16a34a', '#4ade80', '#dcfce7'],
          headingColor: '#0f2814',
          bodyColor: '#3a6a44',
          buttonBg: '#16a34a',
          buttonText: '#ffffff',
          radius: '8px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 4px rgba(22,163,74,0.12)',
          border: '1px solid #bbf7d0',
        },
      },
    ],
  },
  {
    number: '05',
    question: 'What surface does your canvas rest on?',
    answers: [
      {
        id: 'white',
        label: 'Pure White',
        sublabel: 'Clean, flat, minimal',
        previewBg: '#080808',
        mockup: {
          bg: '#ffffff',
          cardBg: '#ffffff',
          swatches: ['#111111', '#555555', '#bbbbbb'],
          headingColor: '#111111',
          bodyColor: '#555555',
          buttonBg: '#111111',
          buttonText: '#ffffff',
          radius: '4px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
      {
        id: 'parchment',
        label: 'Soft Parchment',
        sublabel: 'Warm off-white, organic',
        previewBg: '#1a1208',
        mockup: {
          bg: '#faf6ee',
          cardBg: '#fff9f0',
          swatches: ['#8b5e3c', '#c49b74', '#e8d4b8'],
          headingColor: '#2e1d0a',
          bodyColor: '#6e4e32',
          buttonBg: '#8b5e3c',
          buttonText: '#ffffff',
          radius: '4px',
          padding: '14px',
          gap: '10px',
          fontWeight: 400,
          fontSize: 10,
          shadow: '0 1px 4px rgba(80,40,0,0.08)',
          border: '1px solid #e0cdb0',
        },
      },
      {
        id: 'dimensional',
        label: 'Dimensional',
        sublabel: 'Subtle shadows, depth layers',
        previewBg: '#0c1220',
        mockup: {
          bg: '#eef2f8',
          cardBg: '#f8fafc',
          swatches: ['#1e40af', '#3b82f6', '#93c5fd'],
          headingColor: '#0f172a',
          bodyColor: '#334155',
          buttonBg: '#1e40af',
          buttonText: '#ffffff',
          radius: '8px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 4px 16px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
          border: 'none',
        },
      },
    ],
  },
  {
    number: '06',
    question: 'What energy does your accent color carry?',
    answers: [
      {
        id: 'electric',
        label: 'Electric & Vivid',
        sublabel: 'Saturated, neon, intense',
        previewBg: '#060d14',
        mockup: {
          bg: '#f0f8ff',
          cardBg: '#ffffff',
          swatches: ['#00d4ff', '#ff2d78', '#c8ff00'],
          headingColor: '#050e1a',
          bodyColor: '#0a3050',
          buttonBg: '#00d4ff',
          buttonText: '#000000',
          radius: '4px',
          padding: '14px',
          gap: '10px',
          fontWeight: 700,
          fontSize: 10,
          shadow: '0 0 16px rgba(0,212,255,0.25)',
          border: '1px solid #00d4ff',
        },
      },
      {
        id: 'muted',
        label: 'Muted & Sophisticated',
        sublabel: 'Desaturated, restrained',
        previewBg: '#101010',
        mockup: {
          bg: '#f4f4f3',
          cardBg: '#fafafa',
          swatches: ['#6b6b6b', '#9e9e9e', '#d4d4d4'],
          headingColor: '#1a1a1a',
          bodyColor: '#5a5a5a',
          buttonBg: '#5a5a5a',
          buttonText: '#ffffff',
          radius: '4px',
          padding: '14px',
          gap: '10px',
          fontWeight: 400,
          fontSize: 10,
          shadow: 'none',
          border: '1px solid #d8d8d8',
        },
      },
      {
        id: 'earthy',
        label: 'Earthy & Grounded',
        sublabel: 'Terracotta, sage, clay',
        previewBg: '#0e1208',
        mockup: {
          bg: '#f5f5ee',
          cardBg: '#fafaf5',
          swatches: ['#8b5f3c', '#6b8c54', '#c8a86e'],
          headingColor: '#1e1608',
          bodyColor: '#5a4a30',
          buttonBg: '#6b8c54',
          buttonText: '#ffffff',
          radius: '4px',
          padding: '14px',
          gap: '10px',
          fontWeight: 500,
          fontSize: 10,
          shadow: '0 1px 4px rgba(40,30,0,0.10)',
          border: '1px solid #d8d0b8',
        },
      },
    ],
  },
]

// ─── MiniMockup ──────────────────────────────────────────────────────────────

function MiniMockup({ cfg }: { cfg: MockupConfig }) {
  return (
    <div
      style={{
        width: '100%',
        height: 140,
        background: cfg.bg,
        borderRadius: cfg.radius,
        padding: cfg.padding,
        display: 'flex',
        flexDirection: 'column',
        gap: cfg.gap,
        boxShadow: cfg.shadow,
        border: cfg.border,
        overflow: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* Swatches */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {cfg.swatches.map((color) => (
          <div
            key={color}
            style={{
              width: 14,
              height: 14,
              background: color,
              borderRadius: cfg.radius === '0px' ? '0' : '3px',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      {/* Heading */}
      <div
        style={{
          fontWeight: cfg.fontWeight,
          fontSize: cfg.fontSize,
          color: cfg.headingColor,
          fontFamily: 'sans-serif',
          lineHeight: 1.2,
          letterSpacing: cfg.fontWeight >= 700 ? '0.02em' : '0',
          flexShrink: 0,
        }}
      >
        Heading text here
      </div>
      {/* Body */}
      <div
        style={{
          fontSize: 8,
          color: cfg.bodyColor,
          fontFamily: 'sans-serif',
          lineHeight: 1.4,
          flexShrink: 0,
        }}
      >
        Short description of the component
      </div>
      {/* Button */}
      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            display: 'inline-block',
            background: cfg.buttonBg,
            color: cfg.buttonText,
            borderRadius: cfg.radius,
            padding: '4px 10px',
            fontSize: 8,
            fontWeight: 600,
            fontFamily: 'sans-serif',
            letterSpacing: '0.02em',
            boxShadow: cfg.shadow !== 'none' ? cfg.shadow : undefined,
            boxSizing: 'border-box',
          }}
        >
          Action
        </div>
      </div>
    </div>
  )
}

// ─── VibeResult ──────────────────────────────────────────────────────────────

function VibeResult({
  theme,
  onRetake,
}: {
  theme: VibeTheme
  onRetake: () => void
}) {
  const router = useRouter()

  const applyToSite = () => {
    localStorage.setItem('vibeTheme', JSON.stringify(theme))
    localStorage.setItem('vibeThemeName', theme.name)
  }

  const openInBrandKit = () => {
    router.push(`/brand-kit?color=${encodeURIComponent(theme.primaryHex.slice(1))}`)
  }

  // Inject all CSS variables inline on the result container
  const themeStyle = theme.cssVariables as React.CSSProperties & Record<string, string>

  // Palette swatches from primaryHex (simulate a simple 5-stop gradient)
  const paletteColors = [
    theme.cssVariables['--vibe-bg'],
    theme.cssVariables['--vibe-surface'],
    theme.cssVariables['--vibe-border'],
    theme.primaryHex,
    theme.accentHex,
    theme.cssVariables['--vibe-text'],
  ]

  return (
    <div className={styles.resultWrapper} style={themeStyle}>
      <div className={styles.resultInner}>
        {/* Archetype badge */}
        <div className={styles.archetypeBadge}>{theme.archetype}</div>

        {/* Theme name reveal */}
        <h1 className={styles.revealTitle}>{theme.name}</h1>
        <p className={styles.tagline}>{theme.tagline}</p>

        {/* Live specimen */}
        <div className={`${styles.specimenPreview}`}>
          <div className={styles.specimenGrid}>
            {/* Button specimen */}
            <div className={styles.specimenItem}>
              <div className={styles.specimenLabel}>Button</div>
              <button className={styles.specimenButton}>Get started</button>
              <button className={styles.specimenButtonOutline}>Learn more</button>
            </div>
            {/* Card specimen */}
            <div className={styles.specimenItem}>
              <div className={styles.specimenLabel}>Card</div>
              <div className={styles.specimenCard}>
                <div className={styles.specimenCardHeading}>Card title</div>
                <div className={styles.specimenCardBody}>
                  A surface element with your theme&apos;s spacing and radius.
                </div>
                <span className={styles.specimenBadge}>Badge</span>
              </div>
            </div>
            {/* Input specimen */}
            <div className={styles.specimenItem}>
              <div className={styles.specimenLabel}>Input</div>
              <div className={styles.specimenInputGroup}>
                <label className={styles.specimenInputLabel}>Label</label>
                <input
                  className={styles.specimenInput}
                  type="text"
                  placeholder="Your text here..."
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Palette swatches */}
        <div className={styles.paletteStrip}>
          {paletteColors.map((color, i) => (
            <div
              key={i}
              className={styles.paletteSwatch}
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>

        {/* Actions */}
        <div className={styles.resultActions}>
          <button className={styles.actionPrimary} onClick={applyToSite}>
            Apply to Site
          </button>
          <button className={styles.actionSecondary} onClick={openInBrandKit}>
            Open in Brand Kit
          </button>
          <button className={styles.actionGhost} onClick={onRetake}>
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── VibeQuiz (main) ─────────────────────────────────────────────────────────

export function VibeQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz')
  const [generatedTheme, setGeneratedTheme] = useState<VibeTheme | null>(null)
  const [hoverPreview, setHoverPreview] = useState<string | null>(null)
  const [slideKey, setSlideKey] = useState(0)

  const question = QUESTIONS[currentQuestion]

  const handleAnswer = (answerId: string) => {
    const newAnswers = { ...answers, [currentQuestion]: answerId }
    setAnswers(newAnswers)

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((q) => q + 1)
      setSlideKey((k) => k + 1)
      setHoverPreview(null)
    } else {
      // All answered — generate theme
      const vibeAnswers = {
        temp: newAnswers[0] as TempAnswer,
        density: newAnswers[1] as DensityAnswer,
        edge: newAnswers[2] as EdgeAnswer,
        character: newAnswers[3] as CharacterAnswer,
        surface: newAnswers[4] as SurfaceAnswer,
        accent: newAnswers[5] as AccentAnswer,
      }
      const theme = generateVibeTheme(vibeAnswers)
      setGeneratedTheme(theme)
      setPhase('result')
    }
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setPhase('quiz')
    setGeneratedTheme(null)
    setHoverPreview(null)
    setSlideKey((k) => k + 1)
  }

  if (phase === 'result' && generatedTheme) {
    return <VibeResult theme={generatedTheme} onRetake={handleRetake} />
  }

  const bgStyle = hoverPreview
    ? ({ '--quiz-bg': hoverPreview } as React.CSSProperties & Record<string, string>)
    : {}

  return (
    <div className={styles.quiz} style={bgStyle}>
      {/* Header wordmark */}
      <div className={styles.wordmark}>VIBE QUIZ</div>

      {/* Question slide */}
      <div key={slideKey} className={styles.slide}>
        {/* Question meta */}
        <div className={styles.questionMeta}>
          <span className={styles.questionNumber}>{question.number}</span>
          <span className={styles.questionCount}>of {QUESTIONS.length}</span>
        </div>

        {/* Question text */}
        <h2 className={styles.questionText}>{question.question}</h2>

        {/* Answer tiles */}
        <div className={styles.answersGrid}>
          {question.answers.map((answer) => (
            <button
              key={answer.id}
              className={styles.answerCard}
              style={
                {
                  '--card-glow': answer.mockup.swatches[0] + '66',
                } as React.CSSProperties & Record<string, string>
              }
              onMouseEnter={() => setHoverPreview(answer.previewBg)}
              onMouseLeave={() => setHoverPreview(null)}
              onClick={() => handleAnswer(answer.id)}
            >
              {/* Mini UI mockup */}
              <div className={styles.mockupWrapper}>
                <MiniMockup cfg={answer.mockup} />
              </div>

              {/* Label */}
              <div className={styles.answerLabel}>
                <span className={styles.answerLabelMain}>{answer.label}</span>
                <span className={styles.answerLabelSub}>{answer.sublabel}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`${styles.progressSegment} ${i < currentQuestion ? styles.progressDone : i === currentQuestion ? styles.progressActive : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
