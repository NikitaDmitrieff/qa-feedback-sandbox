'use client'

import styles from './DownloadTokensButton.module.css'

interface DesignTokensData {
  colors: Record<string, Record<string, string>>
  typography: {
    fontSizes: Record<string, string>
    fontWeights: Record<string, string>
    lineHeights: Record<string, string>
  }
  spacing: Record<string, string>
}

interface DownloadTokensButtonProps {
  tokens: DesignTokensData
}

export function DownloadTokensButton({ tokens }: DownloadTokensButtonProps) {
  const handleDownload = () => {
    const json = JSON.stringify(tokens, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-tokens.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className={styles.btn} onClick={handleDownload}>
      Download Design Token JSON
    </button>
  )
}
