import type { Metadata } from 'next'
import { BrandKitStudio } from '@/app/components/BrandKitStudio'

export const metadata: Metadata = {
  title: 'Brand Kit Studio — Design System',
  description: 'One-click design system generator from any brand color.',
}

export default function BrandKitPage() {
  return <BrandKitStudio />
}
