export default function Home() {
  return (
    <main>
      <h1>Minions Smoke Test</h1>
      <p>A minimal Next.js site used to test the minions autonomous pipeline.</p>
      <ul>
        <li>Scout analyzes this repo for findings</li>
        <li>Strategist proposes improvements</li>
        <li>Builder implements them in PRs</li>
        <li>Reviewer checks the code</li>
      </ul>
      <footer style={{ marginTop: '2rem', color: '#888', fontSize: '0.875rem' }}>
        <p>Version 0.1.0</p>
      </footer>
    </main>
  )
}
