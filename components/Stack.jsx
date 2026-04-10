const skills = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS',
  'Framer Motion', 'PostgreSQL', 'Python', 'WebGL', 'Figma',
  'Go', 'GraphQL', 'Docker', 'Rust', 'Vercel',
];

export default function Stack() {
  const doubled = [...skills, ...skills];

  return (
    <section id="stack" className="py-8 overflow-hidden border-t border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #080808, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #080808, transparent)' }} />

        <div className="flex gap-10 marquee-track w-max">
          {doubled.map((skill, i) => (
            <div key={i} className="flex items-center gap-10 shrink-0">
              <span className="text-sm font-medium tracking-wide whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                {skill}
              </span>
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
