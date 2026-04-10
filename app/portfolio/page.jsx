import ProjectCard from '@/components/ProjectCard';
import Layout from '@/components/Layout';
import { fetchGitHubRepos } from '@/lib/github';

export const metadata = {
  title: 'Portfolio - Blare: Homebase',
  description: 'Explore my coding projects',
};

export const revalidate = 3600;

export default async function Portfolio() {
  const repos = await fetchGitHubRepos();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">My Portfolio</h1>
          <p className="text-gray-400">
            Here you&apos;ll find a collection of my projects. Click any card to read its README.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.githubUrl} project={project} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
