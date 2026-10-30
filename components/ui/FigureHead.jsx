/**
 * The head every figure on the site shares: the title, then the plate
 * caption beneath it carrying the figure designation, then a rule.
 *
 * `as` picks the element so the same head can sit inside a <summary>
 * (where a heading element would be invalid) or stand as a real h2.
 */
export default function FigureHead({ figure, title, as: Title = 'h2', className = '', children }) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <Title className="figure-title">{title}</Title>
      {children}
      <span className="tag">{figure}</span>
    </div>
  );
}
