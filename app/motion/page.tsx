'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { Metadata } from 'next'
import { MotionCanvas } from './MotionCanvas'
import type { SceneId } from './MotionCanvas'
import { useDesignTokenColors } from './useDesignTokenColors'

// Metadata can't be exported from a 'use client' component; it's declared in a separate server wrapper
// (see: app/motion/layout.tsx). Page itself is client-only.

const SCENE_LABELS: { id: SceneId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'flowField',
    label: 'Flow Fields',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <path d="M3 12 Q7 6 12 12 Q17 18 21 12" strokeLinecap="round" />
        <path d="M3 7 Q7 1 12 7 Q17 13 21 7" strokeLinecap="round" opacity="0.5" />
        <path d="M3 17 Q7 11 12 17 Q17 23 21 17" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'constellation',
    label: 'Constellation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        <circle cx="19" cy="8" r="1.5" fill="currentColor" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        <circle cx="7" cy="19" r="1.5" fill="currentColor" />
        <circle cx="18" cy="18" r="1.5" fill="currentColor" />
        <line x1="5" y1="5" x2="19" y2="8" opacity="0.5" />
        <line x1="19" y1="8" x2="12" y2="15" opacity="0.5" />
        <line x1="12" y1="15" x2="7" y2="19" opacity="0.5" />
        <line x1="12" y1="15" x2="18" y2="18" opacity="0.5" />
        <line x1="5" y1="5" x2="12" y2="15" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'aurora',
    label: 'Aurora',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <path d="M2 9 Q6 5 12 9 Q18 13 22 9" strokeLinecap="round" />
        <path d="M2 13 Q6 9 12 13 Q18 17 22 13" strokeLinecap="round" opacity="0.6" />
        <path d="M2 17 Q6 13 12 17 Q18 21 22 17" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'crystalGrowth',
    label: 'Crystal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" />
        <line x1="12" y1="3" x2="12" y2="21" opacity="0.4" />
        <line x1="4" y1="8" x2="20" y2="16" opacity="0.4" />
        <line x1="4" y1="16" x2="20" y2="8" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'gradientMesh',
    label: 'Gradient',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <rect x="3" y="3" width="7" height="7" rx="1" opacity="0.9" />
        <rect x="14" y="3" width="7" height="7" rx="1" opacity="0.5" />
        <rect x="3" y="14" width="7" height="7" rx="1" opacity="0.5" />
        <rect x="14" y="14" width="7" height="7" rx="1" opacity="0.9" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'typographyStorm',
    label: 'Type Storm',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <text x="4" y="17" fontSize="14" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="monospace">Aa</text>
        <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.6" />
        <circle cx="20" cy="10" r="0.8" fill="currentColor" opacity="0.5" />
        <circle cx="16" cy="14" r="0.8" fill="currentColor" opacity="0.5" />
        <circle cx="19" cy="18" r="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
]

const SPEED_OPTIONS: { label: string; value: number }[] = [
  { label: '0.25×', value: 0.25 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
]

const DENSITY_OPTIONS: { label: string; value: number }[] = [
  { label: 'Low', value: 0.5 },
  { label: 'Med', value: 1 },
  { label: 'High', value: 1.5 },
]

export default function MotionPage() {
  const [sceneId, setSceneId] = useState<SceneId>('flowField')
  const [speed, setSpeed] = useState(1)
  const [density, setDensity] = useState(1)
  const [controlsVisible, setControlsVisible] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = useDesignTokenColors()
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  // Start initial inactivity timer on mount via a timeout callback (not synchronous setState)
  useEffect(() => {
    inactivityTimerRef.current = setTimeout(() => setControlsVisible(false), 3000)
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [])

  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `brand-motion-${sceneId}-${Date.now()}.png`
    a.click()
  }, [sceneId])

  const handleFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        // Break out of pageContent padding (var(--spacing-8) = 2rem)
        margin: 'calc(-1 * var(--spacing-8))',
        width: 'calc(100% + 2 * var(--spacing-8))',
        height: '100vh',
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
      onMouseMove={resetInactivityTimer}
      onPointerDown={resetInactivityTimer}
    >
      {/* Canvas */}
      <MotionCanvas
        sceneId={sceneId}
        speed={speed}
        density={density}
        colors={colors}
        canvasRef={canvasRef}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Controls overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          opacity: controlsVisible ? 1 : 0.2,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'all',
          zIndex: 10,
        }}
      >
        {/* Scene selector pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(15,15,25,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            padding: '0.35rem 0.5rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {SCENE_LABELS.map(s => (
            <button
              key={s.id}
              onClick={() => setSceneId(s.id)}
              title={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                background: sceneId === s.id ? 'var(--color-primary-500)' : 'transparent',
                color: sceneId === s.id ? '#ffffff' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* Speed selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15,15,25,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            padding: '0.35rem 0.5rem',
            gap: '0.15rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '0.7rem',
                background: speed === opt.value ? 'var(--color-primary-600)' : 'transparent',
                color: speed === opt.value ? '#ffffff' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Density selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15,15,25,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            padding: '0.35rem 0.5rem',
            gap: '0.15rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {DENSITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDensity(opt.value)}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '0.7rem',
                background: density === opt.value ? 'var(--color-primary-600)' : 'transparent',
                color: density === opt.value ? '#ffffff' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          title="Capture PNG"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            background: 'rgba(15,15,25,0.85)',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            transition: 'background 0.2s',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            background: 'rgba(15,15,25,0.85)',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            transition: 'background 0.2s',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      </div>

      {/* Scene label */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          opacity: controlsVisible ? 1 : 0.2,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Brand Motion Canvas
        </div>
        <div
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.65)',
            marginTop: '0.2rem',
          }}
        >
          {SCENE_LABELS.find(s => s.id === sceneId)?.label ?? sceneId}
        </div>
      </div>
    </div>
  )
}
