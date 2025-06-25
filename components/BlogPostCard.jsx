'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function BlogPostCard({ post }) {
  return (
    <ScrollReveal className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:border-white/20 transition-all duration-300" direction="up" duration={0.5}>
      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
          <time dateTime={post.date}>{post.date}</time>
          {post.category && (
            <>
              <span>•</span>
              <span className="text-blue-400">{post.category}</span>
            </>
          )}
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-white mb-3 hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
        
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
} 