'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { relativeLuminance, contrastRatioValue } from '@/app/lib/contrast'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Category = 'primary' | 'gray' | 'semantic'

interface TokenData {
  name: string
  token: string
  hex: string
  category: Category
  luminance: number
  label: string
}

interface Particle {
  token: TokenData
  x: number
  y: number
  homeX: number
  homeY: number
  dx: number
  dy: number
  isAnchored: boolean
  isDragging: boolean
}

interface ExplodePart {
  x: number
  y: number
  dx: number
  dy: number
  alpha: number
  radius: number
}

interface ExplodeGroup {
  parts: ExplodePart[]
  homeX: number
  homeY: number
  timer: number
  hex: string
}

interface ContrastPair {
  a: number
  b: number
  ratio: number
}

// ─────────────────────────────────────────────────────────────
// Static Token Data
// ─────────────────────────────────────────────────────────────

const RAW: Array<{ name: string; token: string; hex: string; category: Category }> = [
  { name: 'primary-50',  token: '--color-primary-50',  hex: '#eff6ff', category: 'primary' },
  { name: 'primary-100', token: '--color-primary-100', hex: '#dbeafe', category: 'primary' },
  { name: 'primary-200', token: '--color-primary-200', hex: '#bfdbfe', category: 'primary' },
  { name: 'primary-300', token: '--color-primary-300', hex: '#93c5fd', category: 'primary' },
  { name: 'primary-400', token: '--color-primary-400', hex: '#60a5fa', category: 'primary' },
  { name: 'primary-500', token: '--color-primary-500', hex: '#3b82f6', category: 'primary' },
  { name: 'primary-600', token: '--color-primary-600', hex: '#2563eb', category: 'primary' },
  { name: 'primary-700', token: '--color-primary-700', hex: '#1d4ed8', category: 'primary' },
  { name: 'primary-800', token: '--color-primary-800', hex: '#1e40af', category: 'primary' },
  { name: 'primary-900', token: '--color-primary-900', hex: '#1e3a8a', category: 'primary' },
  { name: 'gray-50',  token: '--color-gray-50',  hex: '#f9fafb', category: 'gray' },
  { name: 'gray-100', token: '--color-gray-100', hex: '#f3f4f6', category: 'gray' },
  { name: 'gray-200', token: '--color-gray-200', hex: '#e5e7eb', category: 'gray' },
  { name: 'gray-300', token: '--color-gray-300', hex: '#d1d5db', category: 'gray' },
  { name: 'gray-400', token: '--color-gray-400', hex: '#9ca3af', category: 'gray' },
  { name: 'gray-500', token: '--color-gray-500', hex: '#6b7280', category: 'gray' },
  { name: 'gray-600', token: '--color-gray-600', hex: '#4b5563', category: 'gray' },
  { name: 'gray-700', token: '--color-gray-700', hex: '#374151', category: 'gray' },
  { name: 'gray-800', token: '--color-gray-800', hex: '#1f2937', category: 'gray' },
  { name: 'gray-900', token: '--color-gray-900', hex: '#111827', category: 'gray' },
  { name: 'success', token: '--color-success', hex: '#16a34a', category: 'semantic' },
  { name: 'warning', token: '--color-warning', hex: '#d97706', category: 'semantic' },
  { name: 'error',   token: '--color-error',   hex: '#dc2626', category: 'semantic' },
  { name: 'info',    token: '--color-info',    hex: '#0284c7', category: 'semantic' },
]

function tokenLabel(name: string, idxInCategory: number): string {
  if (name.startsWith('primary-')) return `P${idxInCategory}`
  if (name.startsWith('gray-'))    return `G${idxInCategory}`
  const map: Record<string, string> = { success: 'Su', warning: 'Wa', error: 'Er', info: 'In' }
  return map[name] ?? name.slice(0, 2)
}

const TOKENS: TokenData[] = (() => {
  const counts: Record<Category, number> = { primary: 0, gray: 0, semantic: 0 }
  return RAW.map((t) => {
    const idx = counts[t.category]++
    return { ...t, luminance: relativeLuminance(t.hex), label: tokenLabel(t.name, idx) }
  })
})()

// Precompute contrast pairs (token-to-token, not token-to-bg)
const CONTRAST_PAIRS: ContrastPair[] = (() => {
  const pairs: ContrastPair[] = []
  for (let i = 0; i < TOKENS.length; i++) {
    for (let j = i + 1; j < TOKENS.length; j++) {
      const ratio = contrastRatioValue(TOKENS[i].hex, TOKENS[j].hex)
      if (ratio >= 4.5) pairs.push({ a: i, b: j, ratio })
    }
  }
  return pairs
})()

const TOTAL_PAIRS   = (TOKENS.length * (TOKENS.length - 1)) / 2
const PASSING_PAIRS = CONTRAST_PAIRS.length
const HEALTH_SCORE  = Math.round((PASSING_PAIRS / TOTAL_PAIRS) * 100)

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function seededRandGen(seed: string): () => number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = (((h << 5) + h) ^ seed.charCodeAt(i)) >>> 0
  }
  return () => {
    h = ((h ^ (h << 13)) ^ ((h ^ (h << 13)) >>> 17)) >>> 0
    h = (h ^ (h << 5)) >>> 0
    return h / 4294967295
  }
}

function particleRadius(lum: number, hovered = false): number {
  if (hovered) return 24
  return 12 + lum * 8
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────────────────────
// Home position layout
// ─────────────────────────────────────────────────────────────

function computeHomePositions(W: number, H: number): Array<{ x: number; y: number }> {
  const centers: Record<Category, { x: number; y: number }> = {
    primary:  { x: W * 0.70, y: H * 0.26 },
    gray:     { x: W * 0.50, y: H * 0.72 },
    semantic: { x: W * 0.22, y: H * 0.68 },
  }
  const radii: Record<Category, number> = { primary: 115, gray: 120, semantic: 70 }
  const catIdx: Record<Category, number> = { primary: 0, gray: 0, semantic: 0 }
  const catTotal: Record<Category, number> = { primary: 10, gray: 10, semantic: 4 }

  return TOKENS.map((t) => {
    const c = centers[t.category]
    const total = catTotal[t.category]
    const idx   = catIdx[t.category]++
    const angle = (idx / total) * Math.PI * 2 - Math.PI / 2
    const ring  = radii[t.category] * (0.55 + (idx % 3) * 0.22)
    return { x: c.x + Math.cos(angle) * ring, y: c.y + Math.sin(angle) * ring }
  })
}

function initParticles(W: number, H: number): Particle[] {
  const homes = computeHomePositions(W, H)
  return TOKENS.map((t, i) => {
    const rand = seededRandGen(t.name)
    const jx = (rand() - 0.5) * 50
    const jy = (rand() - 0.5) * 50
    return {
      token:      t,
      x:          homes[i].x + jx,
      y:          homes[i].y + jy,
      homeX:      homes[i].x,
      homeY:      homes[i].y,
      dx:         (rand() - 0.5) * 0.4,
      dy:         (rand() - 0.5) * 0.4,
      isAnchored: false,
      isDragging: false,
    }
  })
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function TokenUniverse() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef      = useRef<number>(0)

  // Physics state (refs — live inside animation loop)
  const particlesRef     = useRef<Particle[]>([])
  const hoveredIdxRef    = useRef(-1)
  const selectedIdxRef   = useRef(-1)
  const dragRef          = useRef<{ idx: number; ox: number; oy: number } | null>(null)
  const explodeGroupsRef = useRef<Map<number, ExplodeGroup>>(new Map())
  const pulsesRef        = useRef<Map<number, { r: number; a: number }>>(new Map())

  // Control refs (synced from React state)
  const isAnimatingRef     = useRef(true)
  const showConnectionsRef = useRef(false)
  const showLabelsRef      = useRef(true)
  const categoryFilterRef  = useRef('all')

  // React state (drives UI)
  const [hoveredToken,    setHoveredToken]    = useState<TokenData | null>(null)
  const [tooltipPos,      setTooltipPos]      = useState({ x: 0, y: 0 })
  const [selectedToken,   setSelectedToken]   = useState<TokenData | null>(null)
  const [sidePanelOpen,   setSidePanelOpen]   = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [isAnimating,     setIsAnimating]     = useState(() => {
    if (typeof window === 'undefined') return true
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [showLabels,      setShowLabels]      = useState(true)
  const [categoryFilter,  setCategoryFilter]  = useState('all')
  const [palette,         setPalette]         = useState<TokenData[]>([])

  // Sync control refs
  useEffect(() => { isAnimatingRef.current     = isAnimating },     [isAnimating])
  useEffect(() => { showConnectionsRef.current = showConnections }, [showConnections])
  useEffect(() => { showLabelsRef.current      = showLabels },      [showLabels])
  useEffect(() => { categoryFilterRef.current  = categoryFilter },  [categoryFilter])

  // Compat list for selected token
  const compatTokens = useMemo<Array<{ token: TokenData; ratio: number }>>(() => {
    if (!selectedToken) return []
    const idx = TOKENS.findIndex((t) => t.name === selectedToken.name)
    if (idx < 0) return []
    return CONTRAST_PAIRS
      .filter((p) => p.a === idx || p.b === idx)
      .map((p) => ({
        token: TOKENS[p.a === idx ? p.b : p.a],
        ratio: p.ratio,
      }))
      .sort((a, b) => b.ratio - a.ratio)
  }, [selectedToken])

  // ── Animation loop ──────────────────────────────────────────

  const startLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function loop() {
      const W = canvas!.width
      const H = canvas!.height
      const particles = particlesRef.current
      const hIdx = hoveredIdxRef.current
      const sIdx = selectedIdxRef.current
      const filter = categoryFilterRef.current

      // ── Physics ──────────────────────────────────────────────
      if (isAnimatingRef.current) {
        const fx = new Float64Array(particles.length)
        const fy = new Float64Array(particles.length)

        // Spring to home
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          if (p.isAnchored || p.isDragging) continue
          fx[i] += (p.homeX - p.x) * 0.018
          fy[i] += (p.homeY - p.y) * 0.018
        }

        // Repulsion
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - particles[i].x
            const dy = particles[j].y - particles[i].y
            const dist = Math.hypot(dx, dy)
            if (dist < 80 && dist > 0.5) {
              const strength = 180 / (dist * dist)
              const nx = (dx / dist) * strength
              const ny = (dy / dist) * strength
              fx[i] -= nx; fy[i] -= ny
              fx[j] += nx; fy[j] += ny
            }
          }
        }

        // Contrast pair attraction (weaker pull toward 140px ideal)
        const anchoredStrength = 0.004
        const normalStrength   = 0.001
        for (const pair of CONTRAST_PAIRS) {
          const pi = particles[pair.a]
          const pj = particles[pair.b]
          const dx = pj.x - pi.x
          const dy = pj.y - pi.y
          const dist = Math.hypot(dx, dy)
          if (dist < 0.5) continue
          const ideal = 140
          const hasAnchor = pi.isAnchored || pj.isAnchored
          const str = (hasAnchor ? anchoredStrength : normalStrength) * (dist - ideal)
          const nx = (dx / dist) * str
          const ny = (dy / dist) * str
          if (!pi.isAnchored && !pi.isDragging) { fx[pair.a] += nx; fy[pair.a] += ny }
          if (!pj.isAnchored && !pj.isDragging) { fx[pair.b] -= nx; fy[pair.b] -= ny }
        }

        // Apply forces
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          if (p.isAnchored || p.isDragging) continue
          p.dx = (p.dx + fx[i]) * 0.97
          p.dy = (p.dy + fy[i]) * 0.97
          const speed = Math.hypot(p.dx, p.dy)
          if (speed > 1.5) { p.dx *= 1.5 / speed; p.dy *= 1.5 / speed }
          p.x += p.dx
          p.y += p.dy
          // Bounce
          const r = particleRadius(p.token.luminance)
          if (p.x < r) { p.x = r; p.dx = Math.abs(p.dx) * 0.6 }
          if (p.x > W - r) { p.x = W - r; p.dx = -Math.abs(p.dx) * 0.6 }
          if (p.y < r) { p.y = r; p.dy = Math.abs(p.dy) * 0.6 }
          if (p.y > H - r) { p.y = H - r; p.dy = -Math.abs(p.dy) * 0.6 }
        }
      }

      // ── Draw ──────────────────────────────────────────────────
      ctx!.clearRect(0, 0, W, H)

      // Category cluster rings
      const clusterInfo: Array<{ x: number; y: number; r: number; color: string; cat: Category }> = [
        { x: W * 0.70, y: H * 0.26, r: 160, color: '#3b82f6', cat: 'primary'  },
        { x: W * 0.50, y: H * 0.72, r: 165, color: '#9ca3af', cat: 'gray'     },
        { x: W * 0.22, y: H * 0.68, r: 95,  color: '#16a34a', cat: 'semantic' },
      ]
      for (const cl of clusterInfo) {
        const dimmed = filter !== 'all' && filter !== cl.cat
        ctx!.save()
        ctx!.globalAlpha = dimmed ? 0.02 : 0.06
        ctx!.strokeStyle = cl.color
        ctx!.lineWidth   = 1
        ctx!.beginPath()
        ctx!.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2)
        ctx!.stroke()
        ctx!.globalAlpha = dimmed ? 0.01 : 0.03
        ctx!.fillStyle   = cl.color
        ctx!.beginPath()
        ctx!.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      }

      // Connecting lines
      ctx!.lineWidth = 0.5
      for (const pair of CONTRAST_PAIRS) {
        const pa = particles[pair.a]
        const pb = particles[pair.b]
        const showAll  = showConnectionsRef.current
        const isHoverLine = hIdx === pair.a || hIdx === pair.b
        const isSelLine   = sIdx === pair.a || sIdx === pair.b
        if (!showAll && !isHoverLine && !isSelLine) continue
        const filterA = filter === 'all' || filter === pa.token.category
        const filterB = filter === 'all' || filter === pb.token.category
        if (!filterA && !filterB) continue
        const alphaBase = (pair.ratio - 4.5) / 7 * 0.4
        const alpha = (isHoverLine || isSelLine) ? Math.min(alphaBase * 3.5, 0.9) : alphaBase
        ctx!.save()
        ctx!.globalAlpha  = alpha
        ctx!.strokeStyle  = '#ffffff'
        ctx!.beginPath()
        ctx!.moveTo(pa.x, pa.y)
        ctx!.lineTo(pb.x, pb.y)
        ctx!.stroke()
        ctx!.restore()
      }

      // Explosion parts
      for (const [idx, group] of explodeGroupsRef.current) {
        group.timer--
        if (group.timer <= 0) { explodeGroupsRef.current.delete(idx); continue }
        for (const part of group.parts) {
          part.dx += (group.homeX - part.x) * 0.025
          part.dy += (group.homeY - part.y) * 0.025
          part.dx *= 0.93
          part.dy *= 0.93
          part.x += part.dx
          part.y += part.dy
          part.alpha = group.timer / 120
          ctx!.save()
          ctx!.globalAlpha = part.alpha * 0.8
          ctx!.shadowBlur  = 8
          ctx!.shadowColor = group.hex
          ctx!.fillStyle   = group.hex
          ctx!.beginPath()
          ctx!.arc(part.x, part.y, part.radius, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.restore()
        }
      }

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const isHov = hIdx === i
        const isSel = sIdx === i
        const inFilter = filter === 'all' || filter === p.token.category
        const r = particleRadius(p.token.luminance, isHov)

        ctx!.save()
        ctx!.globalAlpha = inFilter ? 1 : 0.2
        ctx!.shadowBlur   = isHov || isSel ? 32 : 18
        ctx!.shadowColor  = p.token.hex
        ctx!.fillStyle    = p.token.hex
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()

        // Label
        if (showLabelsRef.current) {
          ctx!.save()
          ctx!.globalAlpha   = inFilter ? (isHov ? 1 : 0.85) : 0.15
          ctx!.fillStyle     = p.token.luminance > 0.4 ? '#000000' : '#ffffff'
          ctx!.font          = `bold 9px system-ui, sans-serif`
          ctx!.textAlign     = 'center'
          ctx!.textBaseline  = 'middle'
          ctx!.fillText(p.token.label, p.x, p.y)
          ctx!.restore()
        }

        // Pulse ring for anchored
        if (isSel) {
          let pulse = pulsesRef.current.get(i)
          if (!pulse) { pulse = { r: r, a: 0.6 }; pulsesRef.current.set(i, pulse) }
          pulse.r += 0.8
          pulse.a -= 0.008
          if (pulse.a <= 0) { pulse.r = r; pulse.a = 0.6 }
          ctx!.save()
          ctx!.globalAlpha = pulse.a
          ctx!.strokeStyle = p.token.hex
          ctx!.lineWidth   = 1.5
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, pulse.r, 0, Math.PI * 2)
          ctx!.stroke()
          ctx!.restore()
        }
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // ── Resize + init ────────────────────────────────────────────

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const observer = new ResizeObserver(() => {
      const W = container.clientWidth
      const H = container.clientHeight
      canvas.width  = W
      canvas.height = H
      // Re-home particles on resize (only if empty)
      if (particlesRef.current.length === 0) {
        particlesRef.current = initParticles(W, H)
      } else {
        const homes = computeHomePositions(W, H)
        particlesRef.current.forEach((p, i) => {
          p.homeX = homes[i].x
          p.homeY = homes[i].y
        })
      }
    })
    observer.observe(container)

    // Initial size + particles
    const W = container.clientWidth
    const H = container.clientHeight
    canvas.width  = W
    canvas.height = H
    particlesRef.current = initParticles(W, H)

    // Sync initial reduced-motion preference to ref
    isAnimatingRef.current = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const cleanup = startLoop()
    return () => {
      observer.disconnect()
      if (cleanup) cleanup()
    }
  }, [startLoop])

  // ── Mouse events ────────────────────────────────────────────

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top }
  }

  function findParticleAt(mx: number, my: number): number {
    const particles = particlesRef.current
    let closest = -1, closestDist = Infinity
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const dist = Math.hypot(mx - p.x, my - p.y)
      if (dist <= particleRadius(p.token.luminance, true) + 4 && dist < closestDist) {
        closest = i; closestDist = dist
      }
    }
    return closest
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = getCanvasCoords(e)

    // Drag
    if (dragRef.current !== null) {
      const p = particlesRef.current[dragRef.current.idx]
      p.x = mx - dragRef.current.ox
      p.y = my - dragRef.current.oy
      return
    }

    const idx = findParticleAt(mx, my)
    hoveredIdxRef.current = idx
    if (idx >= 0) {
      const p = particlesRef.current[idx]
      setHoveredToken(p.token)
      setTooltipPos({ x: mx + 18, y: my - 12 })
      canvasRef.current!.style.cursor = 'pointer'
    } else {
      setHoveredToken(null)
      canvasRef.current!.style.cursor = 'crosshair'
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = getCanvasCoords(e)
    const idx = findParticleAt(mx, my)
    if (idx >= 0) {
      const p = particlesRef.current[idx]
      p.isDragging = true
      dragRef.current = { idx, ox: mx - p.x, oy: my - p.y }
    }
  }

  function handleMouseUp() {
    if (dragRef.current !== null) {
      const p = particlesRef.current[dragRef.current.idx]
      p.isDragging = false
      p.dx = 0; p.dy = 0
      dragRef.current = null
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    // Ignore if we just finished dragging
    if (dragRef.current !== null) return
    const { mx, my } = getCanvasCoords(e)
    const idx = findParticleAt(mx, my)
    const particles = particlesRef.current

    if (idx >= 0) {
      if (selectedIdxRef.current === idx) {
        // Unanchor
        particles[idx].isAnchored = false
        pulsesRef.current.delete(idx)
        selectedIdxRef.current = -1
        setSelectedToken(null)
        setSidePanelOpen(false)
      } else {
        // Unanchor previous
        if (selectedIdxRef.current >= 0) {
          particles[selectedIdxRef.current].isAnchored = false
          pulsesRef.current.delete(selectedIdxRef.current)
        }
        particles[idx].isAnchored = true
        selectedIdxRef.current = idx
        setSelectedToken(particles[idx].token)
        setSidePanelOpen(true)
      }
    } else {
      // Click empty — close panel
      if (selectedIdxRef.current >= 0) {
        particles[selectedIdxRef.current].isAnchored = false
        pulsesRef.current.delete(selectedIdxRef.current)
        selectedIdxRef.current = -1
        setSelectedToken(null)
        setSidePanelOpen(false)
      }
    }
  }

  function handleDblClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = getCanvasCoords(e)
    const idx = findParticleAt(mx, my)
    if (idx < 0) return
    const p = particlesRef.current[idx]
    const parts: ExplodePart[] = []
    for (let k = 0; k < 8; k++) {
      const angle = (k / 8) * Math.PI * 2
      const speed = 3 + Math.random() * 5
      parts.push({
        x: p.x, y: p.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        alpha: 1,
        radius: Math.max(5, particleRadius(p.token.luminance) * 0.45),
      })
    }
    explodeGroupsRef.current.set(idx, {
      parts, homeX: p.homeX, homeY: p.homeY, timer: 120, hex: p.token.hex,
    })
  }

  // ── Side panel actions ───────────────────────────────────────

  function handleAddToPalette() {
    if (!selectedToken) return
    setPalette((prev) =>
      prev.some((t) => t.name === selectedToken.name) ? prev : [...prev, selectedToken],
    )
  }

  function handleExportPalette() {
    downloadJSON(
      palette.map((t) => ({ name: t.name, token: t.token, hex: t.hex, category: t.category })),
      'design-token-palette.json',
    )
  }

  function closeSidePanel() {
    if (selectedIdxRef.current >= 0) {
      particlesRef.current[selectedIdxRef.current].isAnchored = false
      pulsesRef.current.delete(selectedIdxRef.current)
      selectedIdxRef.current = -1
    }
    setSelectedToken(null)
    setSidePanelOpen(false)
  }

  // ── Derived display values ───────────────────────────────────

  const selectedRgb = selectedToken ? hexToRgb(selectedToken.hex) : null
  const selectedHsl = selectedToken ? hexToHsl(selectedToken.hex) : null

  // ── Render ───────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Controls bar */}
      <div className={styles.controlsBar} role="toolbar" aria-label="Universe controls">
        <span className={styles.healthScore}>
          Universe Health: <span className={styles.healthValue}>{HEALTH_SCORE}%</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>
            {' '}({PASSING_PAIRS}/{TOTAL_PAIRS} pairs pass WCAG AA)
          </span>
        </span>

        <div className={styles.divider} aria-hidden="true" />

        <button
          className={`${styles.toggleBtn} ${showConnections ? styles.toggleBtnActive : ''}`}
          onClick={() => setShowConnections((v) => !v)}
          type="button"
          aria-pressed={showConnections}
        >
          {showConnections ? 'All Connections' : 'Hover Connections'}
        </button>

        <button
          className={`${styles.toggleBtn} ${!isAnimating ? styles.toggleBtnActive : ''}`}
          onClick={() => setIsAnimating((v) => !v)}
          type="button"
          aria-pressed={!isAnimating}
        >
          {isAnimating ? 'Animate' : 'Frozen'}
        </button>

        <button
          className={`${styles.toggleBtn} ${!showLabels ? styles.toggleBtnActive : ''}`}
          onClick={() => setShowLabels((v) => !v)}
          type="button"
          aria-pressed={!showLabels}
        >
          {showLabels ? 'Labels' : 'No Labels'}
        </button>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.pillGroup} role="group" aria-label="Filter by category">
          {(['all', 'primary', 'gray', 'semantic'] as const).map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${categoryFilter === cat ? styles.pillActive : ''}`}
              onClick={() => setCategoryFilter(cat)}
              type="button"
              aria-pressed={categoryFilter === cat}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Interactive visualization of design tokens as a particle galaxy"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp()
          hoveredIdxRef.current = -1
          setHoveredToken(null)
        }}
        onClick={handleClick}
        onDoubleClick={handleDblClick}
      />

      {/* Tooltip */}
      {hoveredToken && (
        <div
          className={styles.tooltip}
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          aria-hidden="true"
        >
          <div
            className={styles.tooltipSwatch}
            style={{ background: hoveredToken.hex }}
          />
          <div className={styles.tooltipName}>{hoveredToken.name}</div>
          <div className={styles.tooltipVar}>{hoveredToken.token}</div>
          <div className={styles.tooltipHex}>{hoveredToken.hex}</div>
          <div className={styles.tooltipLum}>
            Luminance: {hoveredToken.luminance.toFixed(3)}
          </div>
        </div>
      )}

      {/* Side panel */}
      <aside
        className={`${styles.sidePanel} ${sidePanelOpen ? styles.sidePanelOpen : ''}`}
        aria-label="Token details"
        aria-hidden={!sidePanelOpen}
      >
        {selectedToken && (
          <>
            <div className={styles.sidePanelHeader}>
              <button
                className={styles.closeBtn}
                onClick={closeSidePanel}
                type="button"
                aria-label="Close token details"
              >
                ×
              </button>
              <div
                className={styles.tokenSwatchLarge}
                style={{ background: selectedToken.hex }}
                aria-hidden="true"
              />
              <div className={styles.tokenTitle}>{selectedToken.name}</div>
              <div className={styles.tokenVarName}>{selectedToken.token}</div>
            </div>

            <div className={styles.tokenMeta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Hex</span>
                <span className={styles.metaValue}>{selectedToken.hex}</span>
              </div>
              {selectedRgb && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>RGB</span>
                  <span className={styles.metaValue}>
                    {selectedRgb.r}, {selectedRgb.g}, {selectedRgb.b}
                  </span>
                </div>
              )}
              {selectedHsl && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>HSL</span>
                  <span className={styles.metaValue}>
                    {selectedHsl.h}°, {selectedHsl.s}%, {selectedHsl.l}%
                  </span>
                </div>
              )}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Luminance</span>
                <span className={styles.metaValue}>
                  {selectedToken.luminance.toFixed(4)}
                </span>
              </div>
            </div>

            <div className={styles.wcagHealth}>
              <div className={styles.wcagHealthTitle}>WCAG AA Health</div>
              <div className={styles.wcagHealthValue}>
                {compatTokens.length} of {TOKENS.length} tokens pair for AA
              </div>
            </div>

            <div className={styles.compatSection}>
              <div className={styles.compatTitle}>
                Compatible tokens ({compatTokens.length})
              </div>
              {compatTokens.length === 0 && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.3)' }}>
                  No AA-passing pairs found.
                </p>
              )}
              {compatTokens.map(({ token: ct, ratio }) => (
                <button
                  key={ct.name}
                  className={styles.compatToken}
                  type="button"
                  onClick={() => {
                    const idx = TOKENS.findIndex((t) => t.name === ct.name)
                    if (idx >= 0) {
                      // Highlight by hovering
                      hoveredIdxRef.current = idx
                      setHoveredToken(ct)
                    }
                  }}
                >
                  <div
                    className={styles.compatSwatch}
                    style={{ background: ct.hex }}
                    aria-hidden="true"
                  />
                  <span className={styles.compatName}>{ct.name}</span>
                  <span className={styles.ratioBadge}>{ratio.toFixed(2)}:1</span>
                </button>
              ))}
            </div>

            <div className={styles.paletteArea}>
              <div className={styles.paletteTitle}>Palette</div>
              <div className={styles.paletteSwatches}>
                {palette.length === 0 && (
                  <span className={styles.paletteEmpty}>Empty — add tokens below</span>
                )}
                {palette.map((t) => (
                  <div
                    key={t.name}
                    className={styles.paletteSwatch}
                    style={{ background: t.hex }}
                    title={t.name}
                    aria-label={t.name}
                  />
                ))}
              </div>
              <div className={styles.paletteActions}>
                <button
                  className={styles.addBtn}
                  onClick={handleAddToPalette}
                  type="button"
                  disabled={palette.some((t) => t.name === selectedToken.name)}
                >
                  Add to palette
                </button>
                <button
                  className={styles.exportBtn}
                  onClick={handleExportPalette}
                  type="button"
                  disabled={palette.length === 0}
                >
                  Export JSON
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
