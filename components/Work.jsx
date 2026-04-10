'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const projects = [
  {
    index: '01',
    title: 'Homebase',
    description: 'Personal digital space built as a living design system. Iterating on interactions, typography, and motion to find the limits of what a personal site can be.',
    tags: ['Next.js', 'Framer Motion', 'Tailwind'],
    year: '2025',
    href: '#',
  },
  {
    index: '02',
    title: 'Void',
    description: 'A dark-mode UI component library built for developers who care about the details. Zero-compromise on accessibility, animation, and visual precision.',
    tags: ['React', 'TypeScript', 'CSS'],
    year: '2024',
    href: '#',
  },
  {
    index: '03',
    title: 'Flux',
    description: 'Experimental motion design system exploring the boundaries of CSS and WebGL. A collection of reusable animation primitives for modern web products.',
    tags: ['WebGL', 'GSAP', 'Shaders'],
    year: '2024',
    href: '#',
  },
  {
    index: '04',
    title: 'Prism',
    description: 'Real-time collaborative design tool prototype. Exploring operational transforms, live cursors, and pixel-perfect canvas rendering in the browser.',
    tags: ['Canvas API', 'WebSockets', 'Node.js'],
    year: '2024',
    href: '#',
  },
];

function ProjectRow({ project, index: i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.a
      ref={ref}
      href={project.href}
      className="group block py-8 border-b border-white/[0.06] relative"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Hover background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -mx-4"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}
      />

      <div className="relative flex items-start gap-6 md:gap-10">
        {/* Index */}
        <span className="label pt-1 w-8 shrink-0">{project.index}</span>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors duration-200 tracking-tight">
              {project.title}
            </h3>
            <div className="flex items-center gap-3 shrink-0 pt-0.5">
              <span className="label hidden sm:block">{project.year}</span>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="text-white/20 group-hover:text-white/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <path d="M3 13L13 3M13 3H6M13 3v7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-4 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export default function Work() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="work" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-end justify-between mb-14 pb-6 border-b border-white/[0.06]"
        >
          <div>
            <p className="label mb-3">Selected Work</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Things I&apos;ve built
            </h2>
          </div>
          <span className="label hidden sm:block">{projects.length} projects</span>
        </motion.div>

        <div>
          {projects.map((p, i) => (
            <ProjectRow key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
