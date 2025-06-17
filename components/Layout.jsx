'use client';

import Navigation from './Navigation';
// import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="aurora-bg" />
      <div className="grid-motion" />
      <div className="waves" />
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
} 