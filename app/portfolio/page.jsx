import BlurText from '@/components/BlurText';
import ProjectCard from '@/components/ProjectCard';
import Layout from '@/components/Layout';
import { fetchGitHubRepos } from '@/lib/github';

export const metadata = {
  title: 'Portfolio - Blare: Homebase',
  description: 'Explore my coding projects',
};

export const revalidate = 60; // Regenerate this page every 60 seconds (ISR)

export default async function Portfolio() {
  // Fetch GitHub repos and map to project cards
  const repos = (await fetchGitHubRepos()).slice(0, 9); // Only show top 9 most recently updated repos
  const projects = repos.map((repo) => ({
    title: repo.name,
    description: repo.description || '',
    technologies: repo.language ? [repo.language] : [],
    lastUpdated: repo.updated_at.slice(0, 10),
    githubUrl: repo.html_url,
    demoUrl: repo.homepage || undefined,
  }));

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
            className="text-3xl font-bold text-white mb-4"
          />
          <p className="text-lg text-gray-600">
            Welcome to my portfolio! Here you'll find a collection of my projects,
            showcasing my skills and experience in web development.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.githubUrl} project={project} />
          ))}
        </div>
      </div>
    </Layout>
  );
}