import './globals.css'
import { FeedbackButton } from '@/components/FeedbackButton'

export const metadata = { title: 'QA Sandbox', description: 'AI-powered feedback companion' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <FeedbackButton />
      </body>
    </html>
  )
}
