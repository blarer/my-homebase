/**
 * One-shot section reveals via IntersectionObserver.
 *
 * The mockup drove these with `animation-timeline: view()`, which some
 * browsers (and headless capture runs) never fire — sections sat ghosted at
 * their keyframe start forever. This replaces the scroll timeline with the
 * boring, universal pattern:
 *
 *   1. This inline script runs at the end of <body>, after the sections exist.
 *   2. Sections already in the viewport are marked `.in-view` synchronously,
 *      so first paint never shows a dimmed hero.
 *   3. Everything else gets an IntersectionObserver that adds `.in-view` once
 *      and unobserves. CSS transitions do the actual motion.
 *   4. Only then is `reveal-ready` added to <html>. The dimmed starting state
 *      in CSS is scoped to `html.reveal-ready`, so without JS (or if anything
 *      here throws) the page renders fully visible and static.
 *
 * prefers-reduced-motion bails out before any class is added: no dimming, no
 * observer, no motion.
 *
 * A section that ends up ABOVE the viewport also counts as revealed. The
 * observer's root is inflated 100000px upward so skipped-past sections still
 * intersect it: with a plain viewport root, an instant jump (End key, anchor
 * link, find-in-page) can move a section from below the viewport to above it
 * without a single intersecting frame, so no callback ever fires and the
 * section stays dimmed forever. The callback also treats a negative top as
 * revealed for belt-and-braces.
 */
const script = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(!('IntersectionObserver' in window))return;var els=document.querySelectorAll('.section');if(!els.length)return;var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){var e=es[i];if(e.isIntersecting||e.boundingClientRect.top<0){e.target.classList.add('in-view');io.unobserve(e.target)}}},{rootMargin:'100000px 0px -10% 0px'});for(var i=0;i<els.length;i++){var el=els[i];if(el.getBoundingClientRect().top<innerHeight*0.9){el.classList.add('in-view')}else{io.observe(el)}}document.documentElement.classList.add('reveal-ready')}catch(e){}})()`;

export default function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
