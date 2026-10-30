/**
 * Sets the theme on <html> before first paint.
 *
 * This has to be a blocking inline script: if the theme were applied in an
 * effect, a visitor who chose dark would get a full-brightness flash of the
 * light page on every navigation.
 */
const script = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
