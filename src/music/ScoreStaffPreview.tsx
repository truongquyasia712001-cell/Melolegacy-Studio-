import type { Measure, Score, ScoreEvent, Step } from './model'

const stepOrder: Record<Step, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
const stepName: Record<Step, string> = { C: 'Đô', D: 'Rê', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }

function pitchY(event: ScoreEvent, clef: string, bottom: number): number | null {
  if (!event.pitch) return null
  const pitch = event.pitch
  const baseStep = clef === 'F' ? 4 : 2
  const baseOctave = clef === 'F' ? 2 : 4
  const diatonic = pitch.octave * 7 + stepOrder[pitch.step]
  const base = baseOctave * 7 + baseStep
  return bottom - (diatonic - base) * 5
}

function accidental(alter: number): string {
  if (alter === 1) return '♯'
  if (alter === 2) return '𝄪'
  if (alter === -1) return '♭'
  if (alter === -2) return '𝄫'
  return ''
}

function NoteGlyph({ event, x, y }: { event: ScoreEvent; x: number; y: number }) {
  if (event.kind === 'rest') {
    const restGlyph = event.duration >= 4 ? '𝄻' : event.duration >= 2 ? '𝄼' : '𝄽'
    return <text x={x} y={y + 5} className="staff-rest" textAnchor="middle">{restGlyph}</text>
  }
  if (!event.pitch) return null
  const open = event.duration >= 2
  const stemUp = y > 58
  const stemX = x + (stemUp ? 7 : -7)
  const stemEnd = y + (stemUp ? -32 : 32)
  return <g className="staff-note">
    {accidental(event.pitch.alter) && <text x={x - 17} y={y + 5} className="staff-accidental" textAnchor="middle">{accidental(event.pitch.alter)}</text>}
    <ellipse cx={x} cy={y} rx="6.5" ry="4.7" transform={`rotate(-18 ${x} ${y})`} className={open ? 'notehead notehead-open' : 'notehead'} />
    {event.duration < 4 && <line x1={stemX} y1={y} x2={stemX} y2={stemEnd} className="staff-stem" />}
    <title>{stepName[event.pitch.step]}{accidental(event.pitch.alter)}{event.pitch.octave}, {event.duration} phách</title>
  </g>
}

function MeasureStaff({ measure, index }: { measure: Measure; index: number }) {
  const top = 34
  const bottom = 74
  const clef = measure.clef?.sign || 'G'
  const maxEnd = Math.max(0, ...measure.events.map(event => event.onset + event.duration))
  const measureLength = Math.max(maxEnd, measure.time ? measure.time.beats * 4 / measure.time.beatType : 4, 1)
  const usableWidth = 590
  const xFor = (event: ScoreEvent) => 90 + Math.min(1, Math.max(0, event.onset / measureLength)) * usableWidth
  const staffLines = Array.from({ length: 5 }, (_, line) => top + line * 10)
  const ledgerLines: { x: number; y: number }[] = []
  for (const event of measure.events) {
    if (event.kind !== 'note' || !event.pitch) continue
    const y = pitchY(event, clef, bottom)
    if (y === null) continue
    for (let ledger = 0; ledger < 5; ledger++) {
      const ledgerY = bottom + (ledger + 1) * 10
      if (y >= ledgerY - 2 && y <= ledgerY + 2) ledgerLines.push({ x: xFor(event), y: ledgerY })
    }
    for (let ledger = 0; ledger < 5; ledger++) {
      const ledgerY = top - (ledger + 1) * 10
      if (y >= ledgerY - 2 && y <= ledgerY + 2) ledgerLines.push({ x: xFor(event), y: ledgerY })
    }
  }
  return <div className="staff-measure">
    <div className="staff-measure-label"><span>Ô nhịp {measure.number || index + 1}</span><small>{measure.time ? `${measure.time.beats}/${measure.time.beatType}` : 'Nhịp chưa xác định'}</small></div>
    <svg className="staff-svg" viewBox="0 0 710 112" role="img" aria-label={`Khuông nhạc ô nhịp ${measure.number || index + 1}`}>
      {staffLines.map(y => <line key={y} x1="42" y1={y} x2="690" y2={y} className="staff-line" />)}
      <line x1="42" y1={top} x2="42" y2={bottom} className="staff-barline" />
      <line x1="690" y1={top} x2="690" y2={bottom} className="staff-barline" />
      <text x="57" y="71" className="staff-clef">{clef === 'F' ? '𝄢' : clef === 'C' ? '𝄡' : '𝄞'}</text>
      {measure.key && <text x="78" y="22" className="staff-meta">{measure.key.fifths === 0 ? '♮' : `Hóa biểu ${measure.key.fifths > 0 ? '+' : ''}${measure.key.fifths}`}</text>}
      {ledgerLines.map((line, i) => <line key={i} x1={line.x - 11} y1={line.y} x2={line.x + 11} y2={line.y} className="staff-ledger" />)}
      {measure.events.map(event => {
        const x = xFor(event)
        const y = event.kind === 'rest' ? 54 : pitchY(event, clef, bottom)
        return y === null ? null : <NoteGlyph key={event.id} event={event} x={x} y={y} />
      })}
    </svg>
  </div>
}

export function ScoreStaffPreview({ score }: { score: Score }) {
  const measures = score.parts.reduce((sum, part) => sum + part.measures.length, 0)
  if (!measures) return <div className="staff-empty">Chưa có ô nhịp để dựng khuông nhạc.</div>
  return <section className="staff-renderer">
    <div className="staff-renderer-head"><div><b>Bản nhạc trên khuông</b><small>{score.parts.length} bè · {measures} ô nhịp</small></div><span>HIỂN THỊ THỬ NGHIỆM</span></div>
    {score.parts.map(part => <div className="staff-part" key={part.id}>
      <h4>{part.name}</h4>
      {part.measures.map((measure, index) => <MeasureStaff key={part.id + '-' + measure.number + '-' + index} measure={measure} index={index} />)}
    </div>)}
    <p className="staff-disclaimer">Bản dựng thử nghiệm để kiểm tra vị trí cao độ và nhịp. Chưa phải bản khắc nhạc hoàn chỉnh; chưa xử lý đầy đủ trường độ có dấu chấm, nối nốt, chùm ba, nhiều bè độc lập và quy tắc dàn trang.</p>
  </section>
}
