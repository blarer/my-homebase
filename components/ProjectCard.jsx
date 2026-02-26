'use client';

import { useState } from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import ScrollReveal from '@/components/ScrollReveal';
import GlareHover from '@/components/react-bits/Animations/GlareHover/GlareHover';
import DecryptedText from '@/components/react-bits/TextAnimations/DecryptedText/DecryptedText';
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
          <GlareHover
            borderRadius="12px"
            glareColor="#ffffff"
            glareOpacity={0.12}
            transitionDuration={700}
            className="h-full border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)' }}
          >
            <div className="p-6 relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">
                <DecryptedText
                  text={project.title}
                  speed={40}
                  maxIterations={8}
                  animateOn="view"
                  sequential={true}
                  revealDirection="start"
                  className="text-white"
                  encryptedClassName="text-gray-500"
                />
              </h3>
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
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaExternalLinkAlt className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </GlareHover>
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
