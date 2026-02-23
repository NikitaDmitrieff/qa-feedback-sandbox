'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { BrandKitInputPanel } from './BrandKitInputPanel'
import { BrandKitPreviewCanvas } from './BrandKitPreviewCanvas'
import { BrandKitTokenPanel } from './BrandKitTokenPanel'
import { generateAllTokens, buildCanvasVars } from '@/app/lib/tokenGenerator'
import type { StylePersonality } from '@/app/lib/tokenGenerator'
import styles from './BrandKitStudio.module.css'

export function BrandKitStudio() {
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [brandName, setBrandName] = useState('My Brand')
  const [personality, setPersonality] = useState<StylePersonality>('professional')
  const [neutralTinted, setNeutralTinted] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [canvasPulse, setCanvasPulse] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseOnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseOffTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tokens = useMemo(
    () => generateAllTokens(primaryColor, personality, neutralTinted),
    [primaryColor, personality, neutralTinted],
  )

  const canvasVars = useMemo(() => buildCanvasVars(tokens), [tokens])

  // Ripple pulse on the canvas when any token changes (deferred to avoid sync setState in effect)
  useEffect(() => {
    if (pulseOnTimer.current) clearTimeout(pulseOnTimer.current)
    if (pulseOffTimer.current) clearTimeout(pulseOffTimer.current)
    pulseOnTimer.current = setTimeout(() => {
      setCanvasPulse(true)
      pulseOffTimer.current = setTimeout(() => setCanvasPulse(false), 600)
    }, 0)
    return () => {
      if (pulseOnTimer.current) clearTimeout(pulseOnTimer.current)
      if (pulseOffTimer.current) clearTimeout(pulseOffTimer.current)
    }
  }, [tokens])

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className={styles.studio}>
      <BrandKitInputPanel
        primaryColor={primaryColor}
        brandName={brandName}
        personality={personality}
        neutralTinted={neutralTinted}
        onColorChange={setPrimaryColor}
        onBrandNameChange={setBrandName}
        onPersonalityChange={setPersonality}
        onNeutralTintedChange={setNeutralTinted}
      />
      <BrandKitPreviewCanvas
        tokens={tokens}
        canvasVars={canvasVars}
        brandName={brandName}
        animKey={primaryColor}
        pulse={canvasPulse}
      />
      <BrandKitTokenPanel
        tokens={tokens}
        brandName={brandName}
        onToast={showToast}
      />

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}
