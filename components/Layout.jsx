import Navigation from './Navigation';
import Starfield from './Starfield';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <Starfield />
      <Navigation />
      {children}
    </div>
  );
}
