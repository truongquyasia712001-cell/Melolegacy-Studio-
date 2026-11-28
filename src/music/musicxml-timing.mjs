/** Resolve MusicXML note onsets in quarter-note units. */
export function resolveNoteOnsets(items) {
  const onsets = []
  let cursor = 0
  let lastNoteOnset = 0
  let previousWasBaseNote = false

  for (const item of items) {
    const duration = Number.isFinite(item.duration) ? Math.max(0, item.duration) : 0
    if (item.kind === 'backup') {
      cursor = Math.max(0, cursor - duration)
      previousWasBaseNote = false
      continue
    }
    if (item.kind === 'forward') {
      cursor += duration
      previousWasBaseNote = false
      continue
    }

    const isChordTone = item.chord === true && previousWasBaseNote
    const onset = isChordTone ? lastNoteOnset : cursor
    onsets.push(onset)
    if (!isChordTone) {
      lastNoteOnset = cursor
      cursor += duration
      previousWasBaseNote = true
    }
  }

  return onsets
}
