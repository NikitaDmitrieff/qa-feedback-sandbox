'use client'

import { useState, useEffect } from 'react'

export interface DesignColors {
  primary: string[]
  grays: string[]
  accent: string | null
}

export function useDesignTokenColors(): DesignColors {
  const [colors, setColors] = useState<DesignColors>({ primary: [], grays: [], accent: null })

  // CSS custom properties require DOM access; use rAF to ensure styles are computed before reading.
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const style = getComputedStyle(document.documentElement)
      const primary = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(w =>
        style.getPropertyValue(`--color-primary-${w}`).trim()
      )
      const grays = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(w =>
        style.getPropertyValue(`--color-gray-${w}`).trim()
      )
      const accent = style.getPropertyValue('--color-info').trim() || null
      setColors({ primary, grays, accent })
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

  return colors
}
