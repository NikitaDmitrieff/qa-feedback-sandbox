import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Motion Canvas',
  description: 'Generative art powered by your design tokens',
}

export default function MotionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
