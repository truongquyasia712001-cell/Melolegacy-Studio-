import type { Measure, ParseSummary, Pitch, Score, ScoreEvent, ScorePart, Step } from './model'
import { pitchToMidi } from './model'

function text(parent: ParentNode, selector: string, fallback = ''): string {
  return parent.querySelector(selector)?.textContent?.trim() || fallback
}
function number(parent: ParentNode, selector: string, fallback = 0): number {
  const value = Number(text(parent, selector))
  return Number.isFinite(value) ? value : fallback
}
function children(parent: ParentNode, selector: string): Element[] {
  return Array.from(parent.querySelectorAll(':scope > ' + selector))
}
function parsePitch(note: Element): Pitch | undefined {
  const pitch = note.querySelector(':scope > pitch')
  if (!pitch) return undefined
  const step = text(pitch, 'step') as Step
  const octave = number(pitch, 'octave', -1)
  if (!'ABCDEFG'.includes(step) || octave < 0) return undefined
  const alter = number(pitch, 'alter', 0)
  return { step, alter, octave, midi: pitchToMidi(step, alter, octave) }
}
function parseMeasure(element: Element, fallbackNumber: number, inheritedDivisions: number): Measure {
  const attrs = children(element, 'attributes')[0]
  const time = attrs?.querySelector('time')
  const key = attrs?.querySelector('key')
  const clef = attrs?.querySelector('clef')
  const measure: Measure = {
    number: element.getAttribute('number') || String(fallbackNumber),
    events: [],
    divisions: attrs && number(attrs, 'divisions') > 0 ? number(attrs, 'divisions') : inheritedDivisions,
    ...(time ? { time: { beats: number(time, 'beats', 4), beatType: number(time, 'beat-type', 4) } } : {}),
    ...(key ? { key: { fifths: number(key, 'fifths'), mode: text(key, 'mode') || undefined } } : {}),
    ...(clef ? { clef: { sign: text(clef, 'sign', 'G'), line: number(clef, 'line', 2), octaveChange: number(clef, 'clef-octave-change') || undefined } } : {}),
  }
  let cursor = 0
  let divisions = measure.divisions || 1
  for (const item of children(element, 'note')) {
    if (item.querySelector('grace')) continue
    const durationTicks = number(item, 'duration')
    const duration = durationTicks > 0 ? durationTicks / divisions : 0
    const isChord = Boolean(item.querySelector('chord'))
    const onset = isChord ? Math.max(0, cursor - (measure.events.at(-1)?.duration || 0)) : cursor
    const isRest = Boolean(item.querySelector('rest'))
    const event: ScoreEvent = {
      id: `${measure.number}-${measure.events.length + 1}`,
      kind: isRest ? 'rest' : 'note',
      onset,
      duration,
      ...(parsePitch(item) ? { pitch: parsePitch(item) } : {}),
      ...(text(item, 'voice') ? { voice: text(item, 'voice') } : {}),
      ...(number(item, 'staff') ? { staff: number(item, 'staff') } : {}),
      tieStart: Boolean(item.querySelector('tie[type="start"]')),
      tieStop: Boolean(item.querySelector('tie[type="stop"]')),
      articulations: Array.from(item.querySelectorAll('articulations > *')).map(node => node.localName),
    }
    measure.events.push(event)
    if (!isChord) cursor += duration
  }
  return measure
}

export function parseMusicXml(source: string): ParseSummary {
  const xml = new DOMParser().parseFromString(source, 'application/xml')
  if (xml.querySelector('parsererror')) throw new Error('Tệp XML không hợp lệ.')
  const root = xml.documentElement
  if (!['score-partwise', 'score-timewise'].includes(root.localName)) throw new Error('Đây không phải tài liệu MusicXML hợp lệ.')
  if (root.localName === 'score-timewise') throw new Error('MusicXML score-timewise hiện chưa được chuẩn hóa; vui lòng xuất lại dưới dạng score-partwise.')
  const partNames = new Map<string, string>()
  for (const part of Array.from(xml.querySelectorAll('part-list > score-part'))) {
    const id = part.getAttribute('id') || `part-${partNames.size + 1}`
    partNames.set(id, text(part, 'part-name', id))
  }
  const parts: ScorePart[] = Array.from(root.querySelectorAll(':scope > part')).map((part, index) => {
    const id = part.getAttribute('id') || `part-${index + 1}`
    let inheritedDivisions = 1
    const measures = children(part, 'measure').map((measure, measureIndex) => {
      const attributes = children(measure, 'attributes')[0]
      const declaredDivisions = attributes ? number(attributes, 'divisions') : 0
      if (declaredDivisions > 0) inheritedDivisions = declaredDivisions
      return parseMeasure(measure, measureIndex + 1, inheritedDivisions)
    })
    return { id, name: partNames.get(id) || id, measures }
  })
  const events = parts.flatMap(part => part.measures.flatMap(measure => measure.events))
  const title = text(xml, 'work-title') || text(xml, 'movement-title') || 'Tác phẩm chưa đặt tên'
  const composer = text(xml, 'identification > creator[type="composer"]') || undefined
  const durationQuarterNotes = Math.max(0, ...parts.map(part => part.measures.reduce((sum, measure) => {
    const end = measure.events.reduce((max, event) => Math.max(max, event.onset + event.duration), 0)
    return sum + end
  }, 0)))
  const score: Score = {
    schemaVersion: '1.0', title, composer, sourceFormat: 'musicxml', parts,
    durationQuarterNotes, warnings: [],
  }
  if (events.length === 0) score.warnings.push('Không tìm thấy sự kiện nốt hoặc dấu lặng.')
  if (parts.length === 0) score.warnings.push('Tài liệu không có bè nhạc trong phần thân.')
  const noteCount = events.filter(event => event.kind === 'note').length
  const restCount = events.filter(event => event.kind === 'rest').length
  return {
    score,
    lines: [
      'Định dạng: MusicXML score-partwise',
      'Tác phẩm: ' + title,
      'Số bè: ' + parts.length,
      'Số ô nhịp: ' + parts.reduce((sum, part) => sum + part.measures.length, 0),
      'Số nốt: ' + noteCount,
      'Số dấu lặng: ' + restCount,
      'Số phách ước tính: ' + durationQuarterNotes,
    ],
    note: 'Đã chuẩn hóa nốt, dấu lặng, cao độ, trường độ, bè và một phần thuộc tính khuông nhạc vào Music Data Model. Các ký hiệu nâng cao chưa được ánh xạ đầy đủ sẽ cần được bổ sung theo từng nhóm.',
  }
}
