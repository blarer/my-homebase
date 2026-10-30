import { FIGURES } from '@/lib/figures';
import { totals } from '@/lib/datasheet';
import { bytes } from '@/lib/format';
import { Caption } from '@/components/ui/Section';

/**
 * Table 4, Electrical Characteristics, in the form every datasheet prints:
 * parameter, test conditions, MIN / TYP / MAX, unit.
 *
 * Honesty rule for the columns: a benchmark that was run as one measurement
 * has one value, so it goes in TYP and MIN / MAX stay empty. Only the
 * repository rows have a real spread (smallest, median, largest repository),
 * so only they fill all three. Nothing is interpolated to make a row look
 * complete.
 */
const fig = (id) => FIGURES.find((f) => f.id === id);
const run = (id, label) => fig(id).runs.find((r) => r.label === label).value;

const mb = (v) => (v / 1_000_000).toFixed(2);
const kb = (v) => Math.round(v / 1_000);

export default function SpecTable({ repos }) {
  const t = totals(repos);

  const groups = [
    {
      title: 'Disk scan (storage-manager-swift)',
      ref: 'benchmark',
      rows: [
        { p: 'Scan time, getattrlistbulk', c: '296 GB, 956k files, one machine', typ: run('benchmark', 'storage-manager'), unit: 's', mine: true },
        { p: 'Scan time, parallel read_dir + lstat', c: 'Same tree', typ: run('benchmark', 'parallel read_dir + lstat'), unit: 's' },
        { p: 'Scan time, du -sk', c: 'Same tree', typ: run('benchmark', 'du -sk'), unit: 's' },
        { p: 'Speed-up over du', c: 'Ratio of the above', typ: '10.3', unit: '×', mine: true },
      ],
    },
    {
      title: 'Dictation latency (outloud)',
      ref: 'dictation',
      rows: [
        { p: 'Key release to text, edit-by-voice', c: 'M4 Pro, selection rewritten in place', typ: run('dictation', 'outloud, edit-by-voice'), unit: 'ms', mine: true },
        { p: 'Key release to text, dictation', c: 'Accessibility write, native field', typ: run('dictation', 'outloud, dictation'), unit: 'ms' },
        { p: 'Key release to text, clipboard fallback', c: 'Unfocused app, paste', typ: run('dictation', 'outloud, clipboard fallback'), unit: 'ms' },
        { p: 'Aqua Voice insert latency', c: 'Advertised, not measured here', typ: run('dictation', 'Aqua Voice'), unit: 'ms' },
      ],
    },
    {
      title: 'Menu bar meter (wattsbar)',
      ref: 'footprint',
      rows: [
        { p: 'Resident memory, Swift + IOKit', c: 'At rest, Activity Monitor', typ: run('footprint', 'Swift + IOKit'), unit: 'MB', mine: true },
        { p: 'Resident memory, Python + rumps', c: 'At rest, Activity Monitor', typ: run('footprint', 'Python + rumps'), unit: 'MB' },
        { p: 'Sensor read interval', c: 'SMC, live watts', typ: 1, unit: 's' },
      ],
    },
    {
      title: 'Clip encode (mp4trim)',
      ref: 'clip',
      rows: [
        { p: 'Output size, Free tier', c: '10 MB limit, 540p30', typ: run('clip', 'Free, 10 MB'), max: 10, unit: 'MB', mine: true },
        { p: 'Output size, Nitro Basic', c: '50 MB limit, 1080p60', typ: run('clip', 'Nitro Basic, 50 MB'), max: 50, unit: 'MB' },
        { p: 'Output size, lossless trim', c: 'Stream copy of 51.5 s source', typ: run('clip', 'Lossless trim'), unit: 'MB' },
        { p: 'Encode budget', c: 'Share of limit, before audio', typ: 93, unit: '%' },
      ],
    },
    {
      title: 'Source (all repositories, GitHub API)',
      ref: 'floorplan',
      rows: [
        { p: 'Source per repository', c: `${t.repos} repositories`, min: kb(t.min), typ: kb(t.median), max: kb(t.max), unit: 'KB' },
        { p: 'Total source', c: `Snapshot, ${t.publicRepos} public + ${t.privateRepos} private`, typ: mb(t.bytes), unit: 'MB', mine: true },
        { p: 'Languages', c: 'Distinct, as GitHub reports', typ: t.languages, unit: '' },
      ],
    },
  ];

  return (
    <div className="ds-table-wrap">
      <table className="ds-table spec-table">
        <caption>
          <Caption kind="Table" n={4} as="span">
            Electrical characteristics. Single measurements are listed as TYP;
            MIN and MAX are given only where a real spread or limit exists.
          </Caption>
        </caption>
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Test conditions</th>
            <th scope="col" className="ds-num">MIN</th>
            <th scope="col" className="ds-num">TYP</th>
            <th scope="col" className="ds-num">MAX</th>
            <th scope="col">UNIT</th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.title}>
            <tr className="spec-group">
              <th scope="rowgroup" colSpan={6}>
                <a href={`#${g.ref}`}>{g.title}</a>
              </th>
            </tr>
            {g.rows.map((r) => (
              <tr key={r.p} data-mine={r.mine || undefined}>
                <th scope="row">{r.p}</th>
                <td className="spec-cond">{r.c}</td>
                <td className="ds-num">{r.min ?? ''}</td>
                <td className="ds-num spec-typ">{r.typ}</td>
                <td className="ds-num">{r.max ?? ''}</td>
                <td className="num">{r.unit}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      <p className="ds-note">
        Total source {bytes(t.bytes, 2)}. Benchmark values are quoted from each
        repository&apos;s README, where the method is written up.
      </p>
    </div>
  );
}
