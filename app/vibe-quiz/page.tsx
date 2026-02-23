import type { Metadata } from 'next'
import { VibeQuiz } from './VibeQuiz'

export const metadata: Metadata = {
  title: 'Design Vibe Quiz — Aesthetic Personality Test',
  description: 'Answer 6 questions and discover your design personality. Get a custom generated design theme.',
}

export default function VibeQuizPage() {
  return <VibeQuiz />
}
