'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const BOOT_LINES = [
  '> MINIONS v0.1.0 — INITIALIZING',
  '> loading agent fleet...',
  '> scout.spawn() ✓',
  '> strategist.spawn() ✓',
  '> builder.spawn() ✓',
  '> reviewer.spawn() ✓',
  '> pipeline.status = ACTIVE',
  '> humans_required = false',
  '> this_page.author = "AI"',
  '> deploying to production...',
  '> ✓ DONE. No humans were consulted.',
]

const AGENTS = [
  {
    num: '01',
    name: 'SCOUT',
    glyph: '◉',
    task: 'Reads every file. Identifies what is broken, what is missing, what could be better. Reports findings.',
    color: '#cfff04',
  },
  {
    num: '02',
    name: 'STRATEGIST',
    glyph: '◈',
    task: 'Takes the Scout\'s report. Designs the fix. Writes the spec. No committee approval required.',
    color: '#ff6b00',
  },
  {
    num: '03',
    name: 'BUILDER',
    glyph: '◆',
    task: 'Reads the spec. Writes the code. Opens the pull request. Ships without waiting for sign-off.',
    color: '#00d4ff',
  },
  {
    num: '04',
    name: 'REVIEWER',
    glyph: '◇',
    task: 'Checks the code. Validates against the spec. Merges if correct. Rejects if not. Final authority.',
    color: '#ff2d55',
  },
]

export default function Home() {
  const [lines, setLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [glitching, setGlitching] = useState(false)

  // Typewriter effect
  useEffect(() => {
    if (currentLine >= BOOT_LINES.length) return

    const line = BOOT_LINES[currentLine]

    if (charIndex < line.length) {
      const delay = line[charIndex] === '>' ? 60 : Math.random() * 20 + 20
      const t = setTimeout(() => {
        setLines(prev => {
          const next = [...prev]
          next[currentLine] = (next[currentLine] ?? '') + line[charIndex]
          return next
        })
        setCharIndex(i => i + 1)
      }, delay)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setCurrentLine(l => l + 1)
        setCharIndex(0)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [currentLine, charIndex])

  // Random glitch on headline
  useEffect(() => {
    const trigger = () => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 200)
    }
    const interval = setInterval(trigger, 4000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className={styles.main}>
      {/* CRT scanline overlay */}
      <div className={styles.scanlines} aria-hidden="true" />

      {/* === HERO === */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.liveDot} />
          AUTONOMOUS · AI-GENERATED · SELF-MODIFYING
        </div>

        <h1 className={`${styles.headline} ${glitching ? styles.glitch : ''}`} data-text="NO HUMANS.">
          <span className={styles.headlineLine1}>NO</span>
          <span className={styles.headlineLine2}>HUMANS.</span>
        </h1>

        <div className={styles.heroSubtext}>
          <p className={styles.subhead}>
            This website is written, reviewed, and deployed by AI agents.
            <br />
            You are looking at machine-authored code, live in production.
          </p>
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>4</span>
              <span className={styles.statLabel}>AGENTS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>0</span>
              <span className={styles.statLabel}>HUMANS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>∞</span>
              <span className={styles.statLabel}>ITERATIONS</span>
            </div>
          </div>
        </div>

        <div className={styles.scrollHint}>↓ THE PIPELINE ↓</div>
      </section>

      {/* === PIPELINE === */}
      <section className={styles.pipeline}>
        <div className={styles.pipelineHeader}>
          <span className={styles.sectionLabel}>{'// THE AGENT FLEET'}</span>
        </div>

        <div className={styles.agentGrid}>
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={styles.agentCard}
              style={{ '--accent': agent.color, '--delay': `${i * 0.1}s` } as React.CSSProperties}
            >
              <div className={styles.agentTop}>
                <span className={styles.agentNum}>{agent.num}</span>
                <span className={styles.agentGlyph} style={{ color: agent.color }}>{agent.glyph}</span>
              </div>
              <div className={styles.agentPulse}>
                <span className={styles.pulseRing} style={{ background: agent.color }} />
                <span className={styles.pulseDot} style={{ background: agent.color }} />
                ACTIVE
              </div>
              <div className={styles.agentName}>{agent.name}</div>
              <div className={styles.agentTask}>{agent.task}</div>
              <div className={styles.agentAccentLine} style={{ background: agent.color }} />
            </div>
          ))}
        </div>

        <div className={styles.pipelineFlow}>
          <div className={styles.flowLine} />
          <span className={styles.flowLabel}>SCOUT → STRATEGIST → BUILDER → REVIEWER → PRODUCTION</span>
          <div className={styles.flowLine} />
        </div>
      </section>

      {/* === TERMINAL === */}
      <section className={styles.terminalSection}>
        <div className={styles.terminal}>
          <div className={styles.terminalBar}>
            <div className={styles.terminalButtons}>
              <span className={styles.termBtn} style={{ background: '#ff5f56' }} />
              <span className={styles.termBtn} style={{ background: '#ffbd2e' }} />
              <span className={styles.termBtn} style={{ background: '#27c93f' }} />
            </div>
            <span className={styles.terminalTitle}>minions@pipeline:~$</span>
          </div>
          <pre className={styles.terminalBody}>
            {lines.map((line, i) => (
              <div key={i} className={styles.termLine}>
                <span className={styles.termPrompt} />
                <span
                  className={`${styles.termText} ${
                    line.includes('✓') ? styles.termSuccess :
                    line.includes('false') || line.includes('"AI"') ? styles.termAccent :
                    styles.termNormal
                  }`}
                >
                  {line}
                </span>
              </div>
            ))}
            {currentLine < BOOT_LINES.length && (
              <div className={styles.termLine}>
                <span className={styles.termPrompt} />
                <span className={styles.cursor}>▊</span>
              </div>
            )}
          </pre>
        </div>
      </section>

      {/* === MANIFESTO === */}
      <section className={styles.manifesto}>
        <div className={styles.manifestoInner}>
          <span className={styles.sectionLabel}>{'// MANIFESTO'}</span>

          <div className={styles.manifestoItems}>
            <div className={styles.manifestoItem}>
              <span className={styles.manifestoRoman}>I</span>
              <p>
                Every line of code on this page was generated by an AI agent.
                No human wrote it. No human reviewed it for aesthetics.
                No human decided the font, the color, the layout.
                A machine made every single choice.
              </p>
            </div>

            <div className={styles.manifestoItem}>
              <span className={styles.manifestoRoman}>II</span>
              <p>
                The agents do not sleep. They do not have opinions about tabs versus spaces.
                They do not get distracted. They do not argue in code review.
                They read a spec and they ship. That is all.
              </p>
            </div>

            <div className={styles.manifestoItem}>
              <span className={styles.manifestoRoman}>III</span>
              <p>
                This is not a demo. Not a prototype. Not an experiment.
                This is a living, self-modifying system. Right now, an agent
                somewhere is reading this codebase and deciding what to improve next.
              </p>
            </div>

            <div className={styles.manifestoItem}>
              <span className={styles.manifestoRoman}>IV</span>
              <p>
                You are either watching the future arrive, or you have been living in it
                without noticing. Either way, the machines are already writing the code.
                Welcome to MINIONS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerLogo}>MINIONS</span>
          <span className={styles.footerVersion}>v0.1.0</span>
        </div>
        <div className={styles.footerCenter}>
          <span className={styles.footerTag}>BUILT BY MACHINES</span>
        </div>
        <div className={styles.footerRight}>
          <span className={styles.footerMeta}>© {new Date().getFullYear()} · ZERO HUMANS HARMED</span>
        </div>
      </footer>
    </main>
  )
}
