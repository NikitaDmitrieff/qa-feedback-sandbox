'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { DesignColors } from './useDesignTokenColors'
import type { SceneModule, SceneContext } from './scenes/types'
import { scene as flowFieldScene } from './scenes/flowField'
import { scene as constellationScene } from './scenes/constellation'
import { scene as auroraScene } from './scenes/aurora'
import { scene as crystalGrowthScene } from './scenes/crystalGrowth'
import { scene as gradientMeshScene } from './scenes/gradientMesh'
import { scene as typographyStormScene } from './scenes/typographyStorm'
import styles from './MotionCanvas.module.css'

export type SceneId =
  | 'flowField'
  | 'constellation'
  | 'aurora'
  | 'crystalGrowth'
  | 'gradientMesh'
  | 'typographyStorm'

const SCENES: Record<SceneId, SceneModule> = {
  flowField: flowFieldScene,
  constellation: constellationScene,
  aurora: auroraScene,
  crystalGrowth: crystalGrowthScene,
  gradientMesh: gradientMeshScene,
  typographyStorm: typographyStormScene,
}

export interface MotionCanvasProps {
  sceneId: SceneId
  speed: number
  density: number
  colors: DesignColors
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function MotionCanvas({ sceneId, speed, density, colors, canvasRef }: MotionCanvasProps) {
  const currentSceneRef = useRef<SceneModule | null>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const speedRef = useRef(speed)
  const densityRef = useRef(density)
  const colorsRef = useRef(colors)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { densityRef.current = density }, [density])
  useEffect(() => { colorsRef.current = colors }, [colors])

  const getSceneContext = useCallback((): SceneContext | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    return {
      canvas,
      ctx,
      colors: colorsRef.current,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      density: densityRef.current,
    }
  }, [canvasRef])

  // Set up animation loop and resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setupSize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    setupSize()

    const ro = new ResizeObserver(() => {
      setupSize()
      const sceneCtx = getSceneContext()
      if (sceneCtx && currentSceneRef.current) {
        currentSceneRef.current.init(sceneCtx)
      }
    })
    ro.observe(canvas)

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp
      const raw = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp
      // Cap delta at 50ms (handles tab unfocus) and apply speed multiplier
      const delta = Math.min(raw, 50) * speedRef.current

      // Reapply DPR transform each frame in case it changed
      const dpr = window.devicePixelRatio || 1
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const sceneCtx = getSceneContext()
      if (sceneCtx && currentSceneRef.current) {
        currentSceneRef.current.update(sceneCtx, delta)
        currentSceneRef.current.draw(sceneCtx)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      lastTimeRef.current = 0
    }
  }, [canvasRef, getSceneContext])

  // Handle scene switching
  useEffect(() => {
    const next = SCENES[sceneId]
    if (!next) return
    if (currentSceneRef.current && currentSceneRef.current !== next) {
      currentSceneRef.current.destroy()
    }
    currentSceneRef.current = next
    const sceneCtx = getSceneContext()
    if (sceneCtx) next.init(sceneCtx)
  }, [sceneId, getSceneContext])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      currentSceneRef.current?.onMouseMove?.(e.clientX - rect.left, e.clientY - rect.top)
    },
    [canvasRef]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      currentSceneRef.current?.onClick?.(e.clientX - rect.left, e.clientY - rect.top)
    },
    [canvasRef]
  )

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ willChange: 'transform' }}
    />
  )
}
