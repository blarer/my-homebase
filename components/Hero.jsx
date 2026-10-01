import '@/app/motion.css';

/**
 * The title page.
 *
 * Two letters, one line about the person, and the Oxford rule. The work
 * used to open the page with a benchmark; it now lives at /work, so the
 * front page can be an introduction rather than an argument.
 */
export default function Hero() {
  return (
    <section className="hero">
      <div className="shell hero-inner">
        <header className="hero-head">
          <h1 className="display hero-name">JL</h1>
          <p className="hero-thesis">
            Systems programmer. I build the tools I wish I had, then measure
            whether they were worth building.
          </p>
        </header>
      </div>
    </section>
  );
}
