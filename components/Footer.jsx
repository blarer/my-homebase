export default function Footer() {
  return (
    <footer className="py-10 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="label">© 2025 Blare. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="https://github.com/blarer" className="label hover:text-white/60 transition-colors duration-200">
            GitHub
          </a>
          <a href="#" className="label hover:text-white/60 transition-colors duration-200">
            Twitter
          </a>
          <a href="mailto:hi@blare.lol" className="label hover:text-white/60 transition-colors duration-200">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
