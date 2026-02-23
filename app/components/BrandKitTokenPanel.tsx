'use client'

import { useState, useCallback } from 'react'
import { tokensToCSS, tokensToJSON, hexToHsl } from '@/app/lib/tokenGenerator'
import type { DesignTokens } from '@/app/lib/tokenGenerator'
import styles from './BrandKitTokenPanel.module.css'

interface BrandKitTokenPanelProps {
  tokens: DesignTokens
  brandName: string
  onToast: (msg: string) => void
}

interface EditPopoverProps {
  value: string
  tokenName: string
  onSave: (val: string) => void
  onClose: () => void
}

function EditPopover({ value, tokenName, onSave, onClose }: EditPopoverProps) {
  const [draft, setDraft] = useState(value)
  const isValid = /^#[0-9a-fA-F]{6}$/.test(draft)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      onSave(draft)
      onClose()
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.popover} role="dialog" aria-label={`Edit ${tokenName}`}>
      <div className={styles.popoverHeader}>
        <span className={styles.popoverTitle}>{tokenName}</span>
        <button className={styles.popoverClose} onClick={onClose} aria-label="Close editor">
          ✕
        </button>
      </div>
      <div className={styles.popoverRow}>
        <div
          className={styles.popoverSwatch}
          style={{ '--preview-color': isValid ? draft : value } as React.CSSProperties}
        />
        <input
          type="text"
          className={`${styles.popoverInput} ${!isValid ? styles.popoverInputError : ''}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={7}
          autoFocus
          spellCheck={false}
        />
      </div>
      <div className={styles.popoverActions}>
        <button
          className={styles.popoverCancel}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={styles.popoverSave}
          onClick={() => { if (isValid) { onSave(draft); onClose() } }}
          disabled={!isValid}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

interface TokenRowProps {
  name: string
  value: string
  onEdit: (name: string, newVal: string) => void
  isEditing: boolean
  onStartEdit: () => void
  onEndEdit: () => void
}

function TokenRow({ name, value, onEdit, isEditing, onStartEdit, onEndEdit }: TokenRowProps) {
  return (
    <div className={styles.tokenRow}>
      <button
        className={styles.tokenBtn}
        onClick={onStartEdit}
        title="Click to edit"
        aria-label={`Edit ${name}: ${value}`}
      >
        <div
          className={styles.tokenSwatch}
          style={{ '--token-color': value } as React.CSSProperties}
        />
        <span className={styles.tokenName}>{name}</span>
        <span className={styles.tokenValue}>{value}</span>
      </button>

      {isEditing && (
        <EditPopover
          value={value}
          tokenName={name}
          onSave={(newVal) => onEdit(name, newVal)}
          onClose={onEndEdit}
        />
      )}
    </div>
  )
}

interface TokenGroupProps {
  title: string
  tokens: Array<{ name: string; value: string }>
  editingToken: string | null
  onEdit: (name: string, newVal: string) => void
  onStartEdit: (name: string) => void
  onEndEdit: () => void
}

function TokenGroup({
  title,
  tokens: tokenList,
  editingToken,
  onEdit,
  onStartEdit,
  onEndEdit,
}: TokenGroupProps) {
  return (
    <div className={styles.tokenGroup}>
      <div className={styles.groupHeader}>{title}</div>
      {tokenList.map(({ name, value }) => (
        <TokenRow
          key={name}
          name={name}
          value={value}
          onEdit={onEdit}
          isEditing={editingToken === name}
          onStartEdit={() => onStartEdit(name)}
          onEndEdit={onEndEdit}
        />
      ))}
    </div>
  )
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

export function BrandKitTokenPanel({ tokens, brandName, onToast }: BrandKitTokenPanelProps) {
  const [editingToken, setEditingToken] = useState<string | null>(null)
  // Override map: token name → hex override
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  const resolveValue = useCallback(
    (name: string, base: string): string => overrides[name] ?? base,
    [overrides],
  )

  const handleEdit = useCallback((name: string, newVal: string) => {
    setOverrides((prev) => ({ ...prev, [name]: newVal }))
  }, [])

  const handleCopyCSS = useCallback(async () => {
    const css = tokensToCSS(tokens, brandName)
    try {
      await navigator.clipboard.writeText(css)
      onToast('CSS copied to clipboard!')
    } catch {
      onToast('Copy failed — try again')
    }
  }, [tokens, brandName, onToast])

  const handleDownloadJSON = useCallback(() => {
    const json = tokensToJSON(tokens, brandName)
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-tokens.json`
    a.click()
    URL.revokeObjectURL(url)
    onToast('Tokens downloaded!')
  }, [tokens, brandName, onToast])

  const handleShare = useCallback(async () => {
    try {
      const state = { primary: tokens.primary[500], brandName }
      const encoded = btoa(JSON.stringify(state))
      const url = `${window.location.origin}/brand-kit?state=${encoded}`
      await navigator.clipboard.writeText(url)
      onToast('Share link copied!')
    } catch {
      onToast('Could not copy share link')
    }
  }, [tokens, brandName, onToast])

  // Build flat token list grouped by category
  const primaryTokens = STEPS.map((step) => ({
    name: `--color-primary-${step}`,
    value: resolveValue(`--color-primary-${step}`, (tokens.primary as Record<number, string>)[step]),
  }))

  const accentTokens = STEPS.map((step) => ({
    name: `--color-accent-${step}`,
    value: resolveValue(`--color-accent-${step}`, (tokens.accent as Record<number, string>)[step]),
  }))

  const neutralTokens = STEPS.map((step) => ({
    name: `--color-neutral-${step}`,
    value: resolveValue(`--color-neutral-${step}`, (tokens.neutral as Record<number, string>)[step]),
  }))

  const semanticTokens = [
    { name: '--color-success', value: resolveValue('--color-success', tokens.semantic.success) },
    { name: '--color-warning', value: resolveValue('--color-warning', tokens.semantic.warning) },
    { name: '--color-error', value: resolveValue('--color-error', tokens.semantic.error) },
    { name: '--color-info', value: resolveValue('--color-info', tokens.semantic.info) },
  ]

  // Typography tokens (static)
  const typographyTokens = [
    { name: '--font-size-xs', value: '0.75rem' },
    { name: '--font-size-sm', value: '0.875rem' },
    { name: '--font-size-base', value: '1rem' },
    { name: '--font-size-lg', value: '1.125rem' },
    { name: '--font-size-xl', value: '1.25rem' },
    { name: '--font-size-2xl', value: '1.5rem' },
  ]

  // Spacing tokens (static)
  const spacingTokens = [
    { name: '--spacing-1', value: '0.25rem' },
    { name: '--spacing-2', value: '0.5rem' },
    { name: '--spacing-3', value: '0.75rem' },
    { name: '--spacing-4', value: '1rem' },
    { name: '--spacing-6', value: '1.5rem' },
    { name: '--spacing-8', value: '2rem' },
  ]

  // Radius tokens (static)
  const radiusTokens = [
    { name: '--radius-sm', value: '0.25rem' },
    { name: '--radius-md', value: '0.375rem' },
    { name: '--radius-lg', value: '0.5rem' },
    { name: '--radius-xl', value: '0.75rem' },
    { name: '--radius-full', value: '9999px' },
  ]

  // Determine HSL info for primary
  const p500 = tokens.primary[500]
  const [h, s, l] = hexToHsl(p500)

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelLabel}>Token Inspector</span>
      </div>

      {/* HSL info bar */}
      <div className={styles.hslBar}>
        <span className={styles.hslItem}>
          <span className={styles.hslKey}>H</span>
          <span className={styles.hslVal}>{Math.round(h)}°</span>
        </span>
        <span className={styles.hslItem}>
          <span className={styles.hslKey}>S</span>
          <span className={styles.hslVal}>{Math.round(s)}%</span>
        </span>
        <span className={styles.hslItem}>
          <span className={styles.hslKey}>L</span>
          <span className={styles.hslVal}>{Math.round(l)}%</span>
        </span>
        <span className={styles.hslItem}>
          <span className={styles.hslKey}>500</span>
          <span className={styles.hslVal}>{p500}</span>
        </span>
      </div>

      {/* Token list */}
      <div className={styles.tokenList}>
        <TokenGroup
          title="Colors — Primary"
          tokens={primaryTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
        <TokenGroup
          title="Colors — Accent"
          tokens={accentTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
        <TokenGroup
          title="Colors — Neutral"
          tokens={neutralTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
        <TokenGroup
          title="Colors — Semantic"
          tokens={semanticTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
        <TokenGroup
          title="Typography"
          tokens={typographyTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
        <TokenGroup
          title="Spacing"
          tokens={spacingTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
        <TokenGroup
          title="Border Radius"
          tokens={radiusTokens}
          editingToken={editingToken}
          onEdit={handleEdit}
          onStartEdit={setEditingToken}
          onEndEdit={() => setEditingToken(null)}
        />
      </div>

      {/* Export actions */}
      <div className={styles.exportActions}>
        <button className={styles.actionBtn} onClick={handleCopyCSS} title="Copy :root CSS block">
          <span className={styles.actionIcon}>⌗</span>
          Copy CSS
        </button>
        <button className={styles.actionBtn} onClick={handleDownloadJSON} title="Download token JSON">
          <span className={styles.actionIcon}>↓</span>
          Download JSON
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnShare}`}
          onClick={handleShare}
          title="Copy shareable URL"
        >
          <span className={styles.actionIcon}>⟳</span>
          Share
        </button>
      </div>
    </aside>
  )
}
