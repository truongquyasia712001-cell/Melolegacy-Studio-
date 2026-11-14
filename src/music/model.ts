export type Step = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type EventKind = 'note' | 'rest'

export interface Pitch {
  step: Step
  alter: number
  octave: number
  midi: number
}

export interface ScoreEvent {
  id: string
  kind: EventKind
  onset: number
  duration: number
  pitch?: Pitch
  voice?: string
  staff?: number
  velocity?: number
  tieStart?: boolean
  tieStop?: boolean
  articulations?: string[]
}

export interface Measure {
  number: string
  events: ScoreEvent[]
  divisions?: number
  time?: { beats: number; beatType: number }
  key?: { fifths: number; mode?: string }
  clef?: { sign: string; line: number; octaveChange?: number }
}

export interface ScorePart {
  id: string
  name: string
  channel?: number
  program?: number
  measures: Measure[]
}

export interface Score {
  schemaVersion: '1.0'
  title: string
  composer?: string
  sourceFormat: 'musicxml' | 'midi'
  parts: ScorePart[]
  tempo?: number
  timeDivision?: number
  durationQuarterNotes: number
  warnings: string[]
}

export interface ParseSummary {
  score: Score
  lines: string[]
  note: string
}

export function pitchToMidi(step: Step, alter: number, octave: number): number {
  const semitones: Record<Step, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  return (octave + 1) * 12 + semitones[step] + alter
}
