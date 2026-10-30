/**
 * A numbered datasheet section. The number is information: the sections
 * run across both pages and are cross-referenced in the text ("see 6.1"),
 * as in any datasheet.
 */
export default function Section({ id, n, title, className = '', children, ...rest }) {
  return (
    <section id={id} className={`ds-section ${className}`.trim()} aria-labelledby={`${id}-title`} {...rest}>
      <h2 id={`${id}-title`} className="ds-h2">
        <span className="ds-n num">{n}</span> {title}
      </h2>
      {children}
    </section>
  );
}

/** A figure or table caption in datasheet form: "Figure 1. Title". */
export function Caption({ kind = 'Figure', n, children, as: Tag = 'p' }) {
  return (
    <Tag className="ds-caption">
      <span className="ds-caption-n">
        {kind} {n}.
      </span>{' '}
      {children}
    </Tag>
  );
}
