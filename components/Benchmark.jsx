import Race from '@/components/Race';

/**
 * The measured figures, one per repository. Every number here was measured
 * on the machine named in the lede and is quoted from that repository's
 * README; nothing is estimated. Each is a Race: a shared axis, lanes that
 * advance in real time, and the one lane that is mine drawn in the signal
 * colour.
 */

export function DiskScan() {
  return (
    <Race
      id="benchmark"
      figure="Fig. 1 — storage-manager-swift"
      title="The same scan, three ways"
      lede="296 GB, 956k files, one machine. The gap between the lanes is the whole argument for building the tool."
      unit="t / seconds"
      kind="seconds"
      ticks={[0, 5, 10, 15, 20]}
      runs={[
        { label: 'du -sk', value: 22.7, note: 'one lstat per file' },
        { label: 'parallel read_dir + lstat', value: 3.5, note: 'threads, same syscall' },
        { label: 'storage-manager', value: 2.2, note: 'getattrlistbulk, batched', mine: true },
      ]}
      caption={
        <>
          10.3&times; faster than <span className="num">du</span>, because batching
          directory attributes beats one syscall per file.
        </>
      }
      repo="https://github.com/blarer/storage-manager-swift"
    />
  );
}

export function Dictation() {
  return (
    <Race
      id="dictation"
      figure="Fig. 2 — outloud"
      title="Key release to text on screen"
      lede="Voice dictation, measured end to end on an M4 Pro: from letting go of the hotkey to the words appearing. The transport decides the spread."
      unit="t / milliseconds"
      kind="millis"
      ticks={[0, 100, 200, 300, 400]}
      runs={[
        { label: 'Aqua Voice', value: 450, note: 'advertised insert latency' },
        { label: 'outloud, clipboard fallback', value: 445, note: 'unfocused app, paste' },
        { label: 'outloud, dictation', value: 189, note: 'accessibility write, native field' },
        { label: 'outloud, edit-by-voice', value: 131, note: 'selection rewritten in place', mine: true },
      ]}
      caption={
        <>
          Fully local. Recognition is on-device, so the only latency left is
          the write into the field, and an accessibility write beats
          synthesized keystrokes.
        </>
      }
      repo="https://github.com/blarer/outloud"
    />
  );
}

export function Footprint() {
  return (
    <Race
      id="footprint"
      figure="Fig. 3 — wattsbar"
      title="A menu bar app, before and after"
      lede="The same battery meter rewritten from Python and rumps into native Swift against IOKit. Memory at rest, measured in Activity Monitor."
      unit="resident memory / MB"
      kind="megabytes"
      ticks={[0, 20, 40, 60]}
      runs={[
        { label: 'Python + rumps', value: 70, note: '41 MB bundle, py2app' },
        { label: 'Swift + IOKit', value: 12, note: '165 KB bundle', mine: true },
      ]}
      caption={
        <>
          5.8&times; less memory and a bundle 250&times; smaller, for the same
          number in the menu bar: live watts read from the SMC every second.
        </>
      }
      repo="https://github.com/blarer/wattsbar"
    />
  );
}

export function Clip() {
  return (
    <Race
      id="clip"
      figure="Fig. 4 — mp4trim"
      title="One clip, every Discord tier"
      lede="A 51.5 s, 1440p60 AV1 OBS recording, 415 MB lossless. The same selection encoded to fit each upload limit; the budget is computed first and the result is measured after."
      unit="output size / MB"
      kind="megabytes"
      ticks={[0, 100, 200, 300, 400]}
      runs={[
        { label: 'Nitro, 500 MB', value: 439, note: '1440p60, source bitrate' },
        { label: 'Lossless trim', value: 415, note: 'stream copy, Dolby Vision intact' },
        { label: 'Nitro Basic, 50 MB', value: 47.3, note: '1080p60, 7.0 Mbps' },
        { label: 'Free, 10 MB', value: 9.4, note: '540p30', mine: true },
      ]}
      caption={
        <>
          Budget is 93% of the limit minus audio, then encode, measure, and
          retry lower if it overshot. Under the limit every time, or it tells
          you to pick a shorter range.
        </>
      }
      repo="https://github.com/blarer/mp4trim"
    />
  );
}
