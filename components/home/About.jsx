import Image from 'next/image';
import Link from 'next/link';

/**
 * About, in his own register.
 *
 * The previous copy said "crafting exceptional digital experiences at the
 * intersection of design and code", which described nobody, and contradicted
 * the paragraphs directly beneath it. This says what he works on and how.
 */
export default function About() {
  return (
    <section id="about" className="section" data-running-head="Notes">
      <div className="shell about-grid">
        <div className="about-head">
          <h2 className="about-title">Jains Yeah Yeah Yeah</h2>

          <figure className="portrait">
            <Image
              src="/avatar.png"
              alt="Blare"
              width={256}
              height={256}
              sizes="(max-width: 860px) 96px, 132px"
              priority={false}
            />
            <figcaption className="tag portrait-caption">blarer</figcaption>
          </figure>
        </div>

        <div className="about-body">
          <p>
            I write systems software and the tools around it. Most of what I
            build starts the same way: something on my own machine is slower,
            heavier, or more fragile than it should be, and the fix turns out
            to live a layer below where people usually look.
          </p>
          <p>
            The disk scanner was a syscall problem, not a UI problem. The
            video trimmer was a stream-copy problem, not an encoding problem.
            The voice dictation tool was a transport problem: recognition was
            already local and fast, and the latency was in how the text got
            into the field. The battery meter was a polling problem, so it
            reads the power sensors directly instead of waiting on the gauge.
            Each one got faster by removing work, not by adding threads.
          </p>
          <p>
            Right now I&apos;m reading into machine learning properly:
            transformer internals, self-attention, how inference actually spends
            its time, and where agents break down. I use AI daily and want to
            understand the machine underneath it rather than treat it as a box
            that returns answers.
          </p>

          <ul className="about-links">
            <li>
              <Link href="/work/" className="about-work-link">
                See the work, measured<span aria-hidden="true"> →</span>
              </Link>
            </li>
            <li>
              <a href="https://github.com/blarer">github.com/blarer</a>
            </li>
            <li>
              <a href="mailto:blare@louds.net">blare@louds.net</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
