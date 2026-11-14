import type { Measure, Score, ScoreEvent, Step } from './model'

const stepOrder: Record<Step, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
const stepName: Record<Step, string> = { C: 'Đô', D: 'Rê', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }
const sharpOrder: Step[] = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const flatOrder: Step[] = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

function pitchY(event: ScoreEvent, clef: string, bottom: number): number | null {
  if (!event.pitch) return null
  const baseStep = clef === 'F' ? 4 : 2
  const baseOctave = clef === 'F' ? 2 : 4
  const diatonic = event.pitch.octave * 7 + stepOrder[event.pitch.step]
  return bottom - (diatonic - (baseOctave * 7 + baseStep)) * 5
}
function accidental(alter: number): string {
  return alter === 1 ? '♯' : alter === 2 ? '𝄪' : alter === -1 ? '♭' : alter === -2 ? '𝄫' : ''
}
function isDotted(duration: number): boolean {
  return [0.75, 1.5, 3, 6].some(value => Math.abs(duration - value) < 0.025)
}
function NoteGlyph({ event, x, y }: { event: ScoreEvent; x: number; y: number }) {
  if (event.kind === 'rest') {
    const glyph = event.duration >= 3.5 ? '𝄻' : event.duration >= 1.75 ? '𝄼' : event.duration >= 0.85 ? '𝄽' : event.duration >= 0.4 ? '𝄾' : '𝄿'
    return <g><text x={x} y={y + 5} className="staff-rest" textAnchor="middle">{glyph}</text>{isDotted(event.duration) && <circle cx={x + 12} cy={y - 3} r="1.8" className="staff-dot" />}</g>
  }
  if (!event.pitch) return null
  const open = event.duration >= 1.75
  const stemUp = y > 58
  const stemX = x + (stemUp ? 7 : -7)
  const stemEnd = y + (stemUp ? -32 : 32)
  const flagCount = event.duration < 0.4 ? 2 : event.duration < 0.85 ? 1 : 0
  const flagPath = stemUp
    ? Array.from({ length: flagCount }, (_, i) => `M ${stemX} ${stemEnd + i * 6} q 15 7 7 17`).join(' ')
    : Array.from({ length: flagCount }, (_, i) => `M ${stemX} ${stemEnd - i * 6} q -15 -7 -7 -17`).join(' ')
  return <g className="staff-note">
    {accidental(event.pitch.alter) && <text x={x - 17} y={y + 5} className="staff-accidental" textAnchor="middle">{accidental(event.pitch.alter)}</text>}
    <ellipse cx={x} cy={y} rx="6.5" ry="4.7" transform={`rotate(-18 ${x} ${y})`} className={open ? 'notehead notehead-open' : 'notehead'} />
    {event.duration < 3.5 && <line x1={stemX} y1={y} x2={stemX} y2={stemEnd} className="staff-stem" />}
    {flagCount > 0 && <path d={flagPath} className="staff-flag" />}
    {isDotted(event.duration) && <circle cx={x + 11} cy={y - 2} r="1.8" className="staff-dot" />}
    {event.tieStart && <path d={`M ${x + 6} ${y + 7} Q ${x + 19} ${y + 18} ${x + 31} ${y + 7}`} className="staff-tie" />}
    {event.tieStop && <path d={`M ${x - 31} ${y + 7} Q ${x - 19} ${y + 18} ${x - 6} ${y + 7}`} className="staff-tie" />}
    <title>{stepName[event.pitch.step]}{accidental(event.pitch.alter)}{event.pitch.octave}, {event.duration} phách</title>
  </g>
}
function MeasureStaff({ measure, index }: { measure: Measure; index: number }) {
  const top = 34
  const bottom = 74
  const clef = measure.clef?.sign || 'G'
  const maxEnd = Math.max(0, ...measure.events.map(event => event.onset + event.duration))
  const measureLength = Math.max(maxEnd, measure.time ? measure.time.beats * 4 / measure.time.beatType : 4, 1)
  const xFor = (event: ScoreEvent) => 130 + Math.min(1, Math.max(0, event.onset / measureLength)) * 540
  const staffLines = Array.from({ length: 5 }, (_, line) => top + line * 10)
  const ledgerLines: { x: number; y: number }[] = []
  for (const event of measure.events) {
    if (event.kind !== 'note' || !event.pitch) continue
    const y = pitchY(event, clef, bottom)
    if (y === null) continue
    for (let ledger = 0; ledger < 5; ledger++) {
      const lower = bottom + (ledger + 1) * 10
      const upper = top - (ledger + 1) * 10
      if (y >= lower - 2 && y <= lower + 2) ledgerLines.push({ x: xFor(event), y: lower })
      if (y >= upper - 2 && y <= upper + 2) ledgerLines.push({ x: xFor(event), y: upper })
    }
  }
  const keyFifths = measure.key?.fifths || 0
  const keySteps = keyFifths > 0 ? sharpOrder.slice(0, keyFifths) : flatOrder.slice(0, Math.abs(keyFifths))
  const keySymbol = keyFifths > 0 ? '♯' : '♭'
  const keyY: Record<Step, number> = clef === 'F'
    ? { C: 64, D: 54, E: 44, F: 34, G: 59, A: 49, B: 39 }
    : { C: 54, D: 44, E: 34, F: 59, G: 49, A: 39, B: 29 }
  const time = measure.time
  return <div className="staff-measure">
    <div className="staff-measure-label"><span>Ô nhịp {measure.number || index + 1}</span><small>{time ? `${time.beats}/${time.beatType}` : 'Nhịp chưa xác định'}</small></div>
    <svg className="staff-svg" viewBox="0 0 710 112" role="img" aria-label={`Khuông nhạc ô nhịp ${measure.number || index + 1}`}>
      {staffLines.map(y => <line key={y} x1="42" y1={y} x2="690" y2={y} className="staff-line" />)}
      <line x1="42" y1={top} x2="42" y2={bottom} className="staff-barline" />
      <line x1="690" y1={top} x2="690" y2={bottom} className="staff-barline" />
      <text x="57" y="71" className="staff-clef">{clef === 'F' ? '𝄢' : clef === 'C' ? '𝄡' : '𝄞'}</text>
      {keySteps.map((step, i) => <text key={step} x={82 + i * 8} y={keyY[step] + 5} className="staff-key-sign">{keySymbol}</text>)}
      {time && <g className="staff-time"><text x="112" y="49">{time.beats}</text><text x="112" y="68">{time.beatType}</text></g>}
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
    <p className="staff-disclaimer">Bản dựng thử nghiệm: đã bổ sung trường độ cơ bản, dấu chấm, dấu nối và hóa biểu. Chưa xử lý đầy đủ chùm ba, beam groups, nhiều bè độc lập, enharmonic spelling và quy tắc dàn trang chuyên nghiệp.</p>
  </section>
}
