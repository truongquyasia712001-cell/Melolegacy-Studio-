export type MusicXmlTimelineItem =
  | { kind: 'note'; duration: number; chord?: boolean }
  | { kind: 'backup' | 'forward'; duration: number }

export declare function resolveNoteOnsets(items: readonly MusicXmlTimelineItem[]): number[]
