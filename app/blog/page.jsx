import BlurText from '@/components/BlurText';
import BlogPostCard from '@/components/BlogPostCard';
import Layout from '@/components/Layout';

export const metadata = {
  title: 'Blog - Blare: Homebase',
  description: 'Read my latest thoughts and tutorials',
};

// Sample blog posts data - replace with your actual posts
const posts = [
  {
    title: "Getting Started with Next.js and React Bits",
    excerpt: "Learn how to create beautiful animations and interactions using Next.js and the React Bits library...",
    date: "2024-03-20",
    category: "Tutorial",
    tags: ["Next.js", "React", "Animation"],
    slug: "getting-started-with-nextjs-and-react-bits"
  },
  {
    title: "Building a Modern Portfolio Website",
    excerpt: "A comprehensive guide to creating a stunning portfolio website that showcases your work effectively...",
    date: "2024-03-15",
    category: "Guide",
    tags: ["Web Development", "Portfolio", "Design"],
    slug: "building-a-modern-portfolio-website"
  },
  {
    title: "The Future of Web Development",
    excerpt: "Exploring upcoming trends and technologies that will shape the future of web development...",
    date: "2024-03-10",
    category: "Opinion",
    tags: ["Web Development", "Future", "Technology"],
    slug: "future-of-web-development"
  }
];

export default function Blog() {
  return (
    <Layout>
      {/* Blog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <BlurText 
            text="My Blog" 
            animateBy="words"
            direction="top"
            delay={200}
            className="text-3xl font-bold text-gray-900 mb-4"
          />
          <p className="text-lg text-gray-600">
            Welcome to my blog! Here I share my thoughts, tutorials, and insights about web development,
            programming, and technology.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <BlogPostCard key={index} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}