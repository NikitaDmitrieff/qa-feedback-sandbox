'use client'

import { useState, useEffect } from 'react'

function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      setDark(stored === 'dark')
    } else {
      setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

const features = [
  {
    title: 'Quick Add Tasks',
    description: 'Create and manage tasks with a simple, intuitive interface. No signup required.',
    icon: '⚡',
  },
  {
    title: 'Organize Notes',
    description: 'Keep your thoughts organized with tags, categories, and smart filtering.',
    icon: '📝',
  },
  {
    title: 'Real-time Feedback',
    description: 'Built-in AI feedback widget lets you report issues and suggest improvements instantly.',
    icon: '💬',
  },
  {
    title: 'AI Insights',
    description: 'Get intelligent suggestions powered by AI that learns from your usage patterns.',
    icon: '🤖',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">QA Sandbox</span>
        <DarkModeToggle />
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Your AI-powered{' '}
          <span className="text-blue-600 dark:text-blue-400">feedback companion</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
          A minimal sandbox app for testing the feedback-chat pipeline end-to-end.
          Try the feedback widget in the bottom-right corner.
        </p>
        <a
          href="#features"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors shadow-lg shadow-blue-600/25"
        >
          Explore Features
        </a>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What you can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
        QA Sandbox — Built for testing the{' '}
        <a href="https://github.com/NikitaDmitrieff/feedback-chat" className="text-blue-600 dark:text-blue-400 hover:underline">
          feedback-chat
        </a>{' '}
        pipeline
      </footer>
    </div>
  )
}
