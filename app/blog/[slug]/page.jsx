import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';

export async function generateMetadata({ params }) {
  // In a real app, fetch the post data here
  const post = {
    title: "Getting Started with Next.js and React Bits",
    excerpt: "Learn how to create beautiful animations and interactions using Next.js and the React Bits library...",
  };

  return {
    title: `${post.title} - Blare: Homebase`,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }) {
  // In a real app, fetch the post data here based on params.slug
  const post = {
    title: "Getting Started with Next.js and React Bits",
    content: `
      # Getting Started with Next.js and React Bits

      Next.js and React Bits are powerful tools for creating modern web applications. In this tutorial, we'll explore how to use them together to create beautiful, interactive websites.

      ## Why Next.js?

      Next.js provides an excellent developer experience with features like:
      - Server-side rendering
      - Static site generation
      - API routes
      - Built-in routing

      ## Why React Bits?

      React Bits offers a collection of pre-built animations and components that make it easy to add polish to your applications.

      ## Getting Started

      1. Create a new Next.js project
      2. Install React Bits
      3. Start building!

      Stay tuned for more tutorials and guides!
    `,
    date: "2024-03-20",
    category: "Tutorial",
    tags: ["Next.js", "React", "Animation"],
  };

  if (!post) {
    notFound();
  }

  return (
    <Layout>
      {/* Blog Post Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <time dateTime={post.date}>{post.date}</time>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">{post.category}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {/* In a real app, use a markdown renderer here */}
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>
        </article>
      </div>
    </Layout>
  );
} 