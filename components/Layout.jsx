import Navigation from './Navigation';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <Navigation />
      {children}
    </div>
  );
}
