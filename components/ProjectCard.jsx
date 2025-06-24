'use client';

import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import ScrollReveal from '@/components/ScrollReveal';

export default function ProjectCard({ project }) {
  return (
    <ScrollReveal>
      <div
        className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:border-white/20 transition-all duration-300"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-gray-300 mb-4">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/20"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Last updated: {project.lastUpdated}</span>
            </div>
            <div className="flex space-x-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaExternalLinkAlt className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
} 