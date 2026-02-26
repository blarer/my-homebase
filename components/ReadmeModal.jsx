'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import SpotlightCard from '@/components/react-bits/Components/SpotlightCard/SpotlightCard';

export default function ReadmeModal({ isOpen, onClose, repoName }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch README when modal opens
  useEffect(() => {
    if (!isOpen || !repoName) return;

    setLoading(true);
    setError(null);
    setContent(null);

    fetch(`/api/readme?repo=${encodeURIComponent(repoName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'No README found for this repository.' : 'Failed to load README.');
        return res.json();
      })
      .then((data) => setContent(data.content))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen, repoName]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-3xl max-h-[85vh] z-10"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <SpotlightCard
              className="!bg-black/80 !border-white/10 backdrop-blur-xl !p-0 flex flex-col max-h-[85vh]"
              spotlightColor="rgba(255, 255, 255, 0.08)"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <h2 className="text-lg font-semibold text-white truncate pr-4">{repoName}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10"
                  aria-label="Close modal"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-6 py-6 flex-1 min-h-0">
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                {error && (
                  <div className="text-center py-16">
                    <p className="text-gray-400">{error}</p>
                  </div>
                )}

                {content && (
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                    prose-headings:text-white prose-headings:font-semibold
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white
                    prose-code:text-gray-200 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
                    prose-pre:!p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0
                    prose-img:rounded-lg prose-img:border prose-img:border-white/10
                    prose-blockquote:border-white/20 prose-blockquote:text-gray-400
                    prose-li:text-gray-300
                    prose-th:text-white prose-td:text-gray-300
                    prose-hr:border-white/10"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
