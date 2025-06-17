import BlurText from '@/components/BlurText';
import ProjectCard from '@/components/ProjectCard';
import Layout from '@/components/Layout';

export const metadata = {
  title: 'Portfolio - Blare: Homebase',
  description: 'Explore my coding projects',
};

// Sample projects data - replace with your actual projects
const projects = [
  {
    title: "My Homebase",
    description: "A personal portfolio and blog website built with Next.js and React Bits animations.",
    technologies: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    lastUpdated: "2024-03-20",
    githubUrl: "https://github.com/yourusername/my-homebase",
    demoUrl: "https://my-homebase.vercel.app"
  },
  {
    title: "Project Two",
    description: "Description of your second project goes here.",
    technologies: ["React", "Node.js", "MongoDB"],
    lastUpdated: "2024-03-15",
    githubUrl: "https://github.com/yourusername/project-two"
  },
  {
    title: "Project Three",
    description: "Description of your third project goes here.",
    technologies: ["Python", "Django", "PostgreSQL"],
    lastUpdated: "2024-03-10",
    githubUrl: "https://github.com/yourusername/project-three",
    demoUrl: "https://project-three.vercel.app"
  }
];

export default function Portfolio() {
  return (
    <Layout>
      {/* Portfolio Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <BlurText 
            text="My Portfolio" 
            animateBy="words"
            direction="top"
            delay={200}
            className="text-3xl font-bold text-gray-900 mb-4"
          />
          <p className="text-lg text-gray-600">
            Welcome to my portfolio! Here you'll find a collection of my projects, 
            showcasing my skills and experience in web development.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </Layout>
  );
}