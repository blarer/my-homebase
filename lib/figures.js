/**
 * The four measured figures on /work, as data.
 *
 * Every number here was measured on the machine named in the lede and is
 * quoted from that repository's README; nothing is estimated. The races
 * (components/work/Race) and the list of figures
 * (components/work/FigureIndex) both read from this one list, so a figure
 * cannot appear in one and not the other.
 *
 * runs: lower is better; `mine` marks the lane drawn in the spot colour.
 * kind: which formatter Race uses for the axis readout.
 */
export const FIGURES = [
  {
    id: 'benchmark',
    n: 1,
    repoName: 'storage-manager-swift',
    title: 'The same scan, three ways',
    lede: '296 GB, 956k files, one machine. The gap between the lanes is the whole argument for building the tool.',
    unit: 't / seconds',
    kind: 'seconds',
    ticks: [0, 5, 10, 15, 20],
    runs: [
      { label: 'du -sk', value: 22.7, note: 'one lstat per file' },
      { label: 'parallel read_dir + lstat', value: 3.5, note: 'threads, same syscall' },
      { label: 'storage-manager', value: 2.2, note: 'getattrlistbulk, batched', mine: true },
    ],
    headline: '10.3× faster',
    caption:
      '10.3× faster than du, because batching directory attributes beats one syscall per file.',
    repo: 'https://github.com/blarer/storage-manager-swift',
  },
  {
    id: 'dictation',
    n: 2,
    repoName: 'outloud',
    title: 'Key release to text on screen',
    lede: 'Voice dictation, measured end to end on an M4 Pro: from letting go of the hotkey to the words appearing. The transport decides the spread.',
    unit: 't / milliseconds',
    kind: 'millis',
    ticks: [0, 100, 200, 300, 400],
    runs: [
      { label: 'Aqua Voice', value: 450, note: 'advertised insert latency' },
      { label: 'outloud, clipboard fallback', value: 445, note: 'unfocused app, paste' },
      { label: 'outloud, dictation', value: 189, note: 'accessibility write, native field' },
      { label: 'outloud, edit-by-voice', value: 131, note: 'selection rewritten in place', mine: true },
    ],
    headline: '131 ms',
    caption:
      'Fully local. Recognition is on-device, so the only latency left is the write into the field, and an accessibility write beats synthesized keystrokes.',
    repo: 'https://github.com/blarer/outloud',
  },
  {
    id: 'footprint',
    n: 3,
    repoName: 'wattsbar',
    title: 'A menu bar app, before and after',
    lede: 'The same battery meter rewritten from Python and rumps into native Swift against IOKit. Memory at rest, measured in Activity Monitor.',
    unit: 'resident memory / MB',
    kind: 'megabytes',
    ticks: [0, 20, 40, 60],
    runs: [
      { label: 'Python + rumps', value: 70, note: '41 MB bundle, py2app' },
      { label: 'Swift + IOKit', value: 12, note: '165 KB bundle', mine: true },
    ],
    headline: '5.8× less memory',
    caption:
      '5.8× less memory and a bundle 250× smaller, for the same number in the menu bar: live watts read from the SMC every second.',
    repo: 'https://github.com/blarer/wattsbar',
  },
  {
    id: 'clip',
    n: 4,
    repoName: 'mp4trim',
    title: 'One clip, every Discord tier',
    lede: 'A 51.5 s, 1440p60 AV1 OBS recording, 415 MB lossless. The same selection encoded to fit each upload limit; the budget is computed first and the result is measured after.',
    unit: 'output size / MB',
    kind: 'megabytes',
    ticks: [0, 100, 200, 300, 400],
    runs: [
      { label: 'Nitro, 500 MB', value: 439, note: '1440p60, source bitrate' },
      { label: 'Lossless trim', value: 415, note: 'stream copy, Dolby Vision intact' },
      { label: 'Nitro Basic, 50 MB', value: 47.3, note: '1080p60, 7.0 Mbps' },
      { label: 'Free, 10 MB', value: 9.4, note: '540p30', mine: true },
    ],
    headline: 'Under 10 MB',
    caption:
      'Budget is 93% of the limit minus audio, then encode, measure, and retry lower if it overshot. Under the limit every time, or it tells you to pick a shorter range.',
    repo: 'https://github.com/blarer/mp4trim',
  },
];

/** The two figures drawn from the repositories themselves. */
export const LIVE_FIGURES = [
  { id: 'work', n: 5, title: 'Work', unit: 'source bytes by repository' },
  { id: 'languages', n: 6, title: 'Languages', unit: 'source bytes by language' },
];

export const figureLabel = (n, name) => `Fig. ${n} — ${name}`;
