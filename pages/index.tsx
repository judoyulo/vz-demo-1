export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8', padding: '2rem', color: 'white', background: '#121212', minHeight: '100vh' }}>
      <h1>Deployment Test: It Works!</h1>
      <p>This is a minimal test page to diagnose the Vercel deployment issue.</p>
      <p>If you can see this message, the core Next.js routing and Vercel's serving configuration are correct.</p>
    </div>
  );
}
