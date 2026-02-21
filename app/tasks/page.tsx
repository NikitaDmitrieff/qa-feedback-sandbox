'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  text: string
  completed: boolean
}

const STORAGE_KEY = 'demo_tasks'

const DEFAULT_TASKS: Task[] = [
  { id: '1', text: 'Try the feedback widget (bottom-right corner)', completed: false },
  { id: '2', text: 'Toggle dark mode in the navbar', completed: false },
  { id: '3', text: 'Add your own tasks below', completed: false },
]

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return DEFAULT_TASKS
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* fall through */ }
  }
  return DEFAULT_TASKS
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTasks(loadTasks())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, mounted])

  function addTask() {
    const text = input.trim()
    if (!text) return
    setTasks([...tasks, { id: Date.now().toString(), text, completed: false }])
    setInput('')
  }

  function toggleTask(id: string) {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to home
        </Link>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completed}/{total} completed
        </span>
      </nav>

      <main className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Task Manager</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          A simple demo — all data stored in localStorage. Try the feedback widget to suggest improvements!
        </p>

        {/* Add task form */}
        <form
          onSubmit={(e) => { e.preventDefault(); addTask() }}
          className="flex gap-3 mb-8"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Add
          </button>
        </form>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 group"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 py-12">
            No tasks yet. Add one above!
          </p>
        )}

        {/* Contextual feedback nudge — appears after completing at least one task */}
        {completed > 0 && (
          <div className="mt-8 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Nice work completing {completed} {completed === 1 ? 'task' : 'tasks'}!
              Have thoughts on how the task manager could be better?{' '}
              <button
                onClick={() => {
                  // Open the global feedback widget
                  const trigger = document.querySelector('[data-feedback-trigger]') as HTMLElement
                  if (trigger) {
                    trigger.click()
                  } else {
                    // Fallback: find the feedback panel trigger bar
                    const bar = document.querySelector('.feedback-panel button, .feedback-trigger') as HTMLElement
                    bar?.click()
                  }
                }}
                className="font-medium underline hover:text-blue-800 dark:hover:text-blue-200"
              >
                Share feedback
              </button>
            </p>
          </div>
        )}

        {/* Stats footer */}
        {total > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{total} {total === 1 ? 'task' : 'tasks'} total</span>
            <span>{Math.round((completed / total) * 100)}% complete</span>
          </div>
        )}
      </main>
    </div>
  )
}
