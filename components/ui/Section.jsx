/**
 * A numbered section of the monograph. `runningHead` is what the masthead
 * shows while this section is being read (see components/site/Masthead).
 */
export default function Section({ id, runningHead, className = '', children, ...rest }) {
  return (
    <section
      id={id}
      className={`section ${className}`.trim()}
      data-running-head={runningHead}
      {...rest}
    >
      <div className="shell">{children}</div>
    </section>
  );
}
