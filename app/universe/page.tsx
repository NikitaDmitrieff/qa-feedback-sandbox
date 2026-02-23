import type { Metadata } from 'next'
import { TokenUniverse } from './TokenUniverse'

export const metadata: Metadata = {
  title: 'Token Universe — Design System',
  description: 'Interactive particle galaxy explorer for design tokens',
}

export default function UniversePage() {
  return <TokenUniverse />
}
