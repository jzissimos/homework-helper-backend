export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🎓 Homework Helper API</h1>
      <p>Voice tutor backend for Katie</p>

      <h2>API Endpoints:</h2>
      <ul>
        <li><code>POST /api/auth/register</code> - Create account</li>
        <li><code>POST /api/auth/login</code> - Login</li>
        <li><code>GET /api/auth/me</code> - Get current user</li>
        <li><code>GET /api/profile</code> - Get profile</li>
        <li><code>PATCH /api/profile</code> - Update profile</li>
        <li><code>GET /api/voices</code> - List available voices</li>
        <li><code>WS /api/conversation</code> - Voice conversation</li>
      </ul>

      <p style={{ marginTop: '2rem', color: '#666' }}>
        Status: <strong style={{ color: 'green' }}>Online</strong>
      </p>
    </main>
  )
}
