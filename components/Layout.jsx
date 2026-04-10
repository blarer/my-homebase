import Navigation from './Navigation';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="static-grid" />
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
