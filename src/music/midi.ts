import type { Measure, ParseSummary, Score, ScoreEvent, ScorePart } from './model'

class MidiReader {
  offset = 0
  readonly bytes: Uint8Array
  constructor(bytes: Uint8Array) { this.bytes = bytes }
  ensure(size: number) {
    if (this.offset + size > this.bytes.length) throw new Error('Dữ liệu MIDI bị cắt hoặc thiếu.')
  }
  u8() { this.ensure(1); return this.bytes[this.offset++] }
  u16() { this.ensure(2); const n = (this.bytes[this.offset] << 8) | this.bytes[this.offset + 1]; this.offset += 2; return n }
  u32() { this.ensure(4); const n = new DataView(this.bytes.buffer, this.bytes.byteOffset + this.offset, 4).getUint32(0, false); this.offset += 4; return n }
  ascii(size: number) { this.ensure(size); const s = String.fromCharCode(...this.bytes.subarray(this.offset, this.offset + size)); this.offset += size; return s }
  vlq() {
    let value = 0
    for (let i = 0; i < 4; i++) {
      const byte = this.u8()
      value = (value << 7) | (byte & 0x7f)
      if ((byte & 0x80) === 0) return value
    }
    throw new Error('MIDI variable-length quantity vượt quá 4 byte.')
  }
}
interface RawTrack { name: string; events: ScoreEvent[]; channel?: number; program?: number; endTick: number }
function decodeText(bytes: number[]) { return new TextDecoder().decode(new Uint8Array(bytes)) }

export function parseMidi(buffer: ArrayBuffer): ParseSummary {
  const reader = new MidiReader(new Uint8Array(buffer))
  if (reader.ascii(4) !== 'MThd') throw new Error('Không tìm thấy MIDI header hợp lệ.')
  const headerLength = reader.u32()
  if (headerLength < 6) throw new Error('MIDI header không hợp lệ.')
  const format = reader.u16()
  const trackCount = reader.u16()
  const division = reader.u16()
  reader.offset = 8 + headerLength
  if (format > 2 || trackCount === 0) throw new Error('Định dạng MIDI hoặc số track không được hỗ trợ.')
  if (division & 0x8000) throw new Error('MIDI dùng SMPTE time division; hiện chỉ hỗ trợ PPQ ticks.')
  if (division === 0) throw new Error('MIDI PPQ không hợp lệ.')
  const tracks: RawTrack[] = []
  const warnings: string[] = []
  let tempo = 120
  let timeSignature: { beats: number; beatType: number } | undefined
  let keySignature: { fifths: number; mode: string } | undefined

  for (let trackIndex = 0; trackIndex < trackCount; trackIndex++) {
    if (reader.ascii(4) !== 'MTrk') throw new Error('Không tìm thấy MIDI track chunk hợp lệ.')
    const length = reader.u32()
    reader.ensure(length)
    const end = reader.offset + length
    const rawEvents: { tick: number; status: number; a: number; b: number; meta?: { type: number; data: number[] } }[] = []
    let tick = 0
    let runningStatus = 0
    let trackName = `Track ${trackIndex + 1}`
    let channel: number | undefined
    let program: number | undefined
    while (reader.offset < end) {
      tick += reader.vlq()
      let status = reader.u8()
      let firstData: number | undefined
      if (status < 0x80) {
        if (!runningStatus) throw new Error('MIDI running status không hợp lệ.')
        firstData = status
        status = runningStatus
      }
      if (status === 0xff) {
        runningStatus = 0
        const type = reader.u8()
        const size = reader.vlq()
        const data = Array.from({ length: size }, () => reader.u8())
        if (type === 0x03) trackName = decodeText(data)
        if (type === 0x51 && data.length === 3) {
          const micros = (data[0] << 16) | (data[1] << 8) | data[2]
          if (micros > 0) tempo = 60000000 / micros
        }
        if (type === 0x58 && data.length >= 2) timeSignature = { beats: data[0], beatType: 2 ** data[1] }
        if (type === 0x59 && data.length >= 2) keySignature = { fifths: data[0] > 127 ? data[0] - 256 : data[0], mode: data[1] ? 'minor' : 'major' }
        rawEvents.push({ tick, status: 0xff, a: 0, b: 0, meta: { type, data } })
        continue
      }
      if (status === 0xf0 || status === 0xf7) {
        runningStatus = 0
        const size = reader.vlq()
        reader.offset += size
        if (reader.offset > end) throw new Error('MIDI SysEx event vượt khỏi track.')
        continue
      }
      if (status >= 0xf0) throw new Error('Gặp MIDI system event chưa hỗ trợ.')
      runningStatus = status
      const command = status & 0xf0
      const a = firstData ?? reader.u8()
      const b = command === 0xc0 || command === 0xd0 ? 0 : reader.u8()
      channel ??= status & 0x0f
      if (command === 0xc0) program = a
      rawEvents.push({ tick, status, a, b })
    }
    const active = new Map<string, { tick: number; velocity: number; channel: number; pitch: number }[]>()
    const events: ScoreEvent[] = []
    for (const event of rawEvents) {
      const command = event.status & 0xf0
      const ch = event.status & 0x0f
      if (command !== 0x90 && command !== 0x80) continue
      const key = ch + ':' + event.a
      if (command === 0x90 && event.b > 0) {
        const queue = active.get(key) || []
        queue.push({ tick: event.tick, velocity: event.b, channel: ch, pitch: event.a })
        active.set(key, queue)
      } else {
        const queue = active.get(key)
        const started = queue?.shift()
        if (!started) continue
        const midiPitch = started.pitch
        const pc = midiPitch % 12
        const stepMap: Array<{ step: 'C'|'D'|'E'|'F'|'G'|'A'|'B'; alter: number }> = [
          {step:'C',alter:0},{step:'C',alter:1},{step:'D',alter:0},{step:'D',alter:1},
          {step:'E',alter:0},{step:'F',alter:0},{step:'F',alter:1},{step:'G',alter:0},
          {step:'G',alter:1},{step:'A',alter:0},{step:'A',alter:1},{step:'B',alter:0},
        ]
        const pitchInfo = stepMap[pc]
        events.push({
          id: `${trackIndex}-${events.length + 1}`, kind: 'note',
          onset: started.tick / division, duration: Math.max(0, event.tick - started.tick) / division,
          pitch: { ...pitchInfo, octave: Math.floor(midiPitch / 12) - 1, midi: midiPitch },
          velocity: started.velocity, voice: String(started.channel + 1),
        })
      }
    }
    const dangling = Array.from(active.values()).reduce((sum, queue) => sum + queue.length, 0)
    if (dangling) warnings.push(`${trackName}: ${dangling} nốt không có note-off tương ứng.`)
    tracks.push({ name: trackName, events, channel, program, endTick: tick })
  }
  const beatsPerMeasure = timeSignature ? timeSignature.beats * 4 / timeSignature.beatType : 4
  const parts: ScorePart[] = tracks.map((track, index) => {
    const totalBeats = Math.max(track.endTick / division, ...track.events.map(event => event.onset + event.duration), 0)
    const measureCount = Math.max(1, Math.ceil(totalBeats / beatsPerMeasure))
    const measures: Measure[] = Array.from({ length: measureCount }, (_, measureIndex) => ({
      number: String(measureIndex + 1),
      events: [],
      ...(timeSignature ? { time: timeSignature } : {}),
      ...(keySignature ? { key: keySignature } : {}),
    }))
    for (const event of track.events) {
      const segments: { measureIndex: number; onset: number; duration: number }[] = []
      let absoluteOnset = event.onset
      let remaining = event.duration
      if (remaining <= 0) {
        const measureIndex = Math.min(measureCount - 1, Math.floor(absoluteOnset / beatsPerMeasure))
        segments.push({ measureIndex, onset: absoluteOnset - measureIndex * beatsPerMeasure, duration: 0 })
      } else {
        while (remaining > 1e-9) {
          const measureIndex = Math.min(measureCount - 1, Math.floor(absoluteOnset / beatsPerMeasure))
          const localOnset = absoluteOnset - measureIndex * beatsPerMeasure
          const segmentDuration = Math.min(remaining, beatsPerMeasure - localOnset)
          segments.push({ measureIndex, onset: localOnset, duration: segmentDuration })
          absoluteOnset += segmentDuration
          remaining -= segmentDuration
        }
      }
      segments.forEach((segment, segmentIndex) => {
        measures[segment.measureIndex].events.push({
          ...event,
          id: segmentIndex === 0 ? event.id : `${event.id}-tie-${segmentIndex}`,
          onset: segment.onset,
          duration: segment.duration,
          tieStart: segmentIndex < segments.length - 1,
          tieStop: segmentIndex > 0,
        })
      })
    }
    return { id: `midi-track-${index + 1}`, name: track.name, channel: track.channel, program: track.program, measures }
  })
  const score: Score = {
    schemaVersion: '1.0', title: 'Tệp MIDI', sourceFormat: 'midi', parts, tempo,
    timeDivision: division,
    durationQuarterNotes: Math.max(0, ...tracks.map(track => track.endTick / division)),
    warnings,
  }
  if (format === 2) score.warnings.push('MIDI format 2 chứa các sequence độc lập; hiện đang trình bày từng track như một phần riêng.')
  if (tracks.some(track => track.events.length === 0)) score.warnings.push('Có track không tạo được cặp note-on/note-off hoàn chỉnh.')
  const noteCount = tracks.reduce((sum, track) => sum + track.events.length, 0)
  return {
    score,
    lines: [
      'Định dạng MIDI: ' + format,
      'Số track: ' + tracks.length,
      'Ticks mỗi phách: ' + division,
      'Tempo đọc được: ' + tempo.toFixed(1) + ' BPM',
      'Tên bè: ' + tracks.map(track => track.name).join(', '),
      'Số nốt ghép cặp: ' + noteCount,
      'Thời lượng: ' + score.durationQuarterNotes.toFixed(2) + ' phách',
      ...warnings,
    ],
    note: 'Đã đọc note-on/note-off, velocity, tempo, time signature, key signature và tên track. Dữ liệu MIDI được quy đổi sang phách; việc viết lại thành khuông nhạc chuẩn vẫn cần bước phân bè, lượng tử hóa và chọn enharmonic spelling.',
  }
}
