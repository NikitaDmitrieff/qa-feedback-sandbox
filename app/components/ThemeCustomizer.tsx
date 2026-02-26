'use client'

import { useState, useEffect, useCallback } from 'react'
import { contrastRatio } from '@/app/lib/contrast'
import { THEME_PRESETS, DEFAULT_TOKENS, type TokenValues } from './ThemePresets'

type TokenKey = keyof TokenValues

const TOKEN_GROUPS: { key: TokenKey; label: string; cssVar: string }[] = [
  { key: 'primary', label: 'Primary', cssVar: '--color-primary-500' },
  { key: 'success', label: 'Success', cssVar: '--color-success' },
  { key: 'warning', label: 'Warning', cssVar: '--color-warning' },
  { key: 'error', label: 'Error', cssVar: '--color-error' },
  { key: 'surface', label: 'Surface', cssVar: '--color-background' },
  { key: 'text', label: 'Text', cssVar: '--color-text' },
]

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hslStr(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`
}

function wcagBadge(ratio: number): { label: string; bg: string; fg: string } {
  if (ratio >= 7) return { label: `AAA ${ratio.toFixed(1)}:1`, bg: 'rgba(74,222,128,0.08)', fg: '#4ade80' }
  if (ratio >= 4.5) return { label: `AA ${ratio.toFixed(1)}:1`, bg: 'rgba(96,165,250,0.08)', fg: '#60a5fa' }
  if (ratio >= 3) return { label: `AA+ ${ratio.toFixed(1)}:1`, bg: 'rgba(251,146,60,0.08)', fg: '#fb923c' }
  return { label: `Fail ${ratio.toFixed(1)}:1`, bg: 'rgba(248,113,113,0.08)', fg: '#f87171' }
}

const SLIDER_CSS = `
.tc-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 20px;
  background: transparent;
  cursor: pointer;
  outline: none;
  padding: 0;
  margin: 0;
  display: block;
}
.tc-slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: transparent;
}
.tc-slider::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: transparent;
}
.tc-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e0e7ff;
  border: 2px solid #0f0f1a;
  box-shadow: 0 0 0 1.5px #6366f1;
  margin-top: -5px;
  cursor: pointer;
}
.tc-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e0e7ff;
  border: 2px solid #0f0f1a;
  box-shadow: 0 0 0 1.5px #6366f1;
  cursor: pointer;
}
.tc-preset-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 10px 8px;
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms;
  font-family: ui-monospace, monospace;
}
.tc-preset-card:hover {
  background: rgba(99,102,241,0.08);
  border-color: rgba(99,102,241,0.35);
}
.tc-btn {
  background: rgba(99,102,241,0.08);
  color: #a5b4fc;
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 7px;
  padding: 9px 14px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  cursor: pointer;
  width: 100%;
  text-align: left;
  letter-spacing: 0.02em;
  transition: background 150ms, border-color 150ms;
}
.tc-btn:hover {
  background: rgba(99,102,241,0.16);
  border-color: rgba(99,102,241,0.5);
}
.tc-reset-btn {
  background: rgba(99,102,241,0.06);
  color: #818cf8;
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  cursor: pointer;
  width: 100%;
  letter-spacing: 0.04em;
  transition: background 150ms;
}
.tc-reset-btn:hover {
  background: rgba(99,102,241,0.14);
}
`

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  trackGradient: string
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, unit = '', trackGradient, onChange }: SliderRowProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr 38px', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
      <span style={{ color: '#475569', fontSize: '9px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ position: 'relative', height: '20px' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          transform: 'translateY(-50%)',
          borderRadius: '2px',
          background: trackGradient,
          pointerEvents: 'none',
        }} />
        <input
          type="range"
          className="tc-slider"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: 'relative', zIndex: 1 }}
        />
      </div>
      <span style={{ color: '#64748b', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {value}{unit}
      </span>
    </div>
  )
}

function applyTokensToDOM(t: TokenValues) {
  document.documentElement.classList.add('theme-transitioning')
  TOKEN_GROUPS.forEach(({ key, cssVar }) => {
    const [h, s, l] = t[key]
    document.documentElement.style.setProperty(cssVar, hslStr(h, s, l))
  })
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 220)
}

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false)
  const [tokens, setTokens] = useState<TokenValues>(DEFAULT_TOKENS)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#theme=')) {
      try {
        const parsed = JSON.parse(atob(hash.slice(7))) as TokenValues
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTokens(parsed)
        applyTokensToDOM(parsed)
      } catch {
        // invalid hash — silently ignore
      }
    }
  }, [])

  const updateToken = useCallback((key: TokenKey, hsl: [number, number, number]) => {
    const group = TOKEN_GROUPS.find((g) => g.key === key)!
    document.documentElement.classList.add('theme-transitioning')
    document.documentElement.style.setProperty(group.cssVar, hslStr(...hsl))
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 220)
    setTokens((prev) => ({ ...prev, [key]: hsl }))
  }, [])

  const applyPreset = useCallback((preset: (typeof THEME_PRESETS)[0]) => {
    setTokens(preset.tokens)
    applyTokensToDOM(preset.tokens)
  }, [])

  const reset = useCallback(() => {
    setTokens(DEFAULT_TOKENS)
    TOKEN_GROUPS.forEach(({ cssVar }) => {
      document.documentElement.style.removeProperty(cssVar)
    })
  }, [])

  const copyCss = useCallback(() => {
    const lines = TOKEN_GROUPS.map(({ cssVar, key }) => {
      const [h, s, l] = tokens[key]
      return `  ${cssVar}: hsl(${h}, ${s}%, ${l}%);`
    })
    navigator.clipboard.writeText(`:root {\n${lines.join('\n')}\n}`)
  }, [tokens])

  const shareUrl = useCallback(() => {
    const encoded = btoa(JSON.stringify(tokens))
    const base = window.location.href.split('#')[0]
    navigator.clipboard.writeText(`${base}#theme=${encoded}`)
  }, [tokens])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SLIDER_CSS }} />

      {/* FAB pill button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#c7d2fe',
          border: '1px solid rgba(99,102,241,0.45)',
          borderRadius: '50px',
          padding: '11px 20px',
          fontSize: '12px',
          fontWeight: '700',
          fontFamily: 'ui-monospace, monospace',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.25), 0 2px 8px rgba(0,0,0,0.35)',
          letterSpacing: '0.04em',
          transition: 'box-shadow 150ms, transform 150ms',
          textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.35)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.25), 0 2px 8px rgba(0,0,0,0.35)' }}
      >
        {isOpen ? '✕ Close' : '◈ Customize Theme'}
      </button>

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-320px',
          width: '300px',
          height: '100vh',
          background: '#0c0c18',
          borderLeft: '1px solid rgba(99,102,241,0.15)',
          zIndex: 9998,
          overflowY: 'auto',
          transition: 'right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '24px 16px 40px',
          boxSizing: 'border-box',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.5)',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <h2 style={{ color: '#e0e7ff', fontSize: '13px', fontWeight: '800', margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Theme Studio
            </h2>
            <span style={{ color: '#312e81', fontSize: '10px' }}>v1</span>
          </div>
          <p style={{ color: '#4338ca', fontSize: '10px', margin: '0 0 16px 0', letterSpacing: '0.02em' }}>
            Live CSS variable editor
          </p>
          <button className="tc-reset-btn" onClick={reset}>
            ↺ Reset to Defaults
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(99,102,241,0.1)', marginBottom: '22px' }} />

        {/* Preset Themes */}
        <section style={{ marginBottom: '26px' }}>
          <h3 style={{ color: '#334155', fontSize: '10px', fontWeight: '700', margin: '0 0 12px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Preset Themes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="tc-preset-card"
                onClick={() => applyPreset(preset)}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', marginBottom: '8px' }}>
                  {(Object.keys(preset.tokens) as TokenKey[]).map((k) => {
                    const [h, s, l] = preset.tokens[k]
                    return (
                      <div
                        key={k}
                        style={{
                          height: '12px',
                          borderRadius: '3px',
                          background: hslStr(h, s, l),
                        }}
                      />
                    )
                  })}
                </div>
                <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '700', letterSpacing: '0.04em' }}>
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(99,102,241,0.1)', marginBottom: '22px' }} />

        {/* Token Editor */}
        <section style={{ marginBottom: '26px' }}>
          <h3 style={{ color: '#334155', fontSize: '10px', fontWeight: '700', margin: '0 0 14px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Token Editor
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {TOKEN_GROUPS.map((group) => {
              const [h, s, l] = tokens[group.key]
              const hex = hslToHex(h, s, l)
              let ratio = 1
              try {
                const contrastAgainst =
                  group.key === 'surface'
                    ? hslToHex(...tokens.text)
                    : hslToHex(...tokens.surface)
                ratio = parseFloat(contrastRatio(hex, contrastAgainst))
              } catch {
                // fallback ratio if contrast calculation fails
              }
              const badge = wcagBadge(ratio)

              return (
                <div key={group.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: hslStr(h, s, l), flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                      <span style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em' }}>{group.label}</span>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      background: badge.bg,
                      color: badge.fg,
                      border: `1px solid ${badge.fg}33`,
                      letterSpacing: '0.04em',
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <SliderRow
                    label="H"
                    value={h}
                    min={0}
                    max={360}
                    onChange={(v) => updateToken(group.key, [v, s, l])}
                    trackGradient={`linear-gradient(to right, hsl(0,${s}%,${l}%), hsl(60,${s}%,${l}%), hsl(120,${s}%,${l}%), hsl(180,${s}%,${l}%), hsl(240,${s}%,${l}%), hsl(300,${s}%,${l}%), hsl(360,${s}%,${l}%))`}
                  />
                  <SliderRow
                    label="S"
                    value={s}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => updateToken(group.key, [h, v, l])}
                    trackGradient={`linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`}
                  />
                  <SliderRow
                    label="L"
                    value={l}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => updateToken(group.key, [h, s, v])}
                    trackGradient={`linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`}
                  />
                </div>
              )
            })}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(99,102,241,0.1)', marginBottom: '22px' }} />

        {/* Export & Share */}
        <section>
          <h3 style={{ color: '#334155', fontSize: '10px', fontWeight: '700', margin: '0 0 12px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Export & Share
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="tc-btn" onClick={copyCss}>
              ⬢ Copy CSS
            </button>
            <button className="tc-btn" onClick={shareUrl}>
              ⬡ Share URL
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
