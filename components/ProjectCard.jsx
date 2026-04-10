'use client';

import { useState } from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import ScrollReveal from '@/components/ScrollReveal';
import ReadmeModal from '@/components/ReadmeModal';

export default function ProjectCard({ project }) {
  const [showReadme, setShowReadme] = useState(false);

  return (
    <>
      <ScrollReveal>
        <div
          className="cursor-pointer h-full"
          onClick={() => setShowReadme(true)}
        >
          <div className="h-full rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors duration-300 p-6">
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-full border border-white/10"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{project.lastUpdated}</span>
                <span className="text-white/30 border border-white/15 rounded px-1.5 py-0.5">README</span>
              </div>
              <div className="flex space-x-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaGithub className="w-4 h-4" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ReadmeModal
        isOpen={showReadme}
        onClose={() => setShowReadme(false)}
        repoName={project.title}
      />
    </>
  );
}
