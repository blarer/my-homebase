'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function BlogPostCard({ post }) {
  return (
    <ScrollReveal>
      <div
        className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:border-white/20 transition-all duration-300"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
          <p className="text-gray-300 mb-4">{post.excerpt}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{post.date}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="text-blue-400">{post.category}</span>
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <a
                href={`/blog/${post.slug}`}
                className="text-gray-400 hover:text-white transition-colors font-bold"
              >
                Read More
              </a>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
} 