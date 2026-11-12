import { useRef, useState } from 'react'
import { parseMidi, parseMusicXml } from './music'
import type { ParseSummary, Score } from './music'
import { ScoreStaffPreview } from './music/ScoreStaffPreview'
import './App.css'

type Kind = 'musicxml' | 'midi' | 'image' | 'pdf' | 'audio'
type Result = { title: string; status: 'read' | 'pending'; lines: string[]; note: string; score?: Score }
const sources: { kind: Kind; title: string; detail: string; icon: string; accept: string }[] = [
  { kind: 'musicxml', title: 'MusicXML', detail: 'Đọc cấu trúc ký âm', icon: '♫', accept: '.musicxml,.xml' },
  { kind: 'midi', title: 'MIDI', detail: 'Đọc track và sự kiện nốt', icon: '⌁', accept: '.mid,.midi' },
  { kind: 'image', title: 'Ảnh bản nhạc', detail: 'JPG, PNG, WEBP · OMR đang phát triển', icon: '▧', accept: 'image/*' },
  { kind: 'pdf', title: 'PDF bản nhạc', detail: 'PDF scan hoặc PDF xuất từ phần mềm', icon: '▤', accept: '.pdf,application/pdf' },
  { kind: 'audio', title: 'Âm thanh', detail: 'WAV, MP3, M4A · phân tích đang phát triển', icon: '◖', accept: 'audio/*,.wav,.mp3,.m4a' },
]
function toResult(parsed: ParseSummary): Result {
  return { title: parsed.score.title, status: 'read', lines: parsed.lines, note: parsed.note, score: parsed.score }
}

export default function App() {
  const refs = useRef<Record<Kind, HTMLInputElement | null>>({ musicxml: null, midi: null, image: null, pdf: null, audio: null })
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [youtube, setYoutube] = useState('')

  async function selectFile(file: File, kind: Kind) {
    setBusy(true); setError(''); setResult(null)
    try {
      if (kind === 'musicxml') setResult(toResult(parseMusicXml(await file.text())))
      else if (kind === 'midi') setResult(toResult(parseMidi(await file.arrayBuffer())))
      else setResult({
        title: file.name, status: 'pending',
        lines: ['Loại tệp: ' + (file.type || 'không xác định'), 'Dung lượng: ' + (file.size / 1024 / 1024).toFixed(2) + ' MB'],
        note: kind === 'image' || kind === 'pdf'
          ? 'Đã tiếp nhận tệp. Bộ nhận dạng OMR ảnh/PDF chưa được tích hợp; ứng dụng chưa tạo ra bản nhạc nhận dạng.'
          : 'Đã tiếp nhận âm thanh. Bộ phân tích cao độ và chuyển âm thanh thành ký âm chưa được tích hợp.',
      })
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể đọc tệp.') }
    finally { setBusy(false) }
  }

  function checkYoutube() {
    setError(''); setResult(null)
    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(youtube.trim())) { setError('Đường dẫn YouTube chưa hợp lệ.'); return }
    setResult({ title: 'Nguồn YouTube', status: 'pending', lines: [youtube.trim()], note: 'Đã kiểm tra định dạng URL. Chưa truy cập hay tải video. Phân tích chỉ thực hiện khi có quyền truy cập và phương thức sử dụng hợp lệ.' })
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="/"><span className="seal">M</span><span><b>MELO LEGACY</b><small>STUDIO</small></span></a><span className="lab-status"><i /> MUSIC RECOGNITION LAB</span></header>
    <section className="hero"><div className="eyebrow">MELO AI · MUSIC RECOGNITION ENGINE</div><h1>Đưa bản nhạc của bạn<br /><em>vào không gian sáng tạo.</em></h1><p>Nhập bản nhạc từ nhiều nguồn. Đọc, phân tích và chuẩn bị dữ liệu để mở trực tiếp trong Music Editor.</p></section>
    <section className="section"><div className="section-head"><div><span>01</span><h2>Chọn nguồn âm nhạc</h2></div><small>IMPORT & RECOGNIZE</small></div>
      <div className="source-grid">{sources.map(s => <button className="source-card" key={s.kind} disabled={busy} onClick={() => refs.current[s.kind]?.click()}>
        <span className="source-icon">{s.icon}</span><b>{s.title}</b><small>{s.detail}</small><span className="choose">Chọn tệp <i>↗</i></span>
        <input ref={el => { refs.current[s.kind] = el }} hidden type="file" accept={s.accept} onChange={e => { const file = e.target.files?.[0]; if (file) void selectFile(file, s.kind); e.currentTarget.value = '' }} />
      </button>)}</div>
      <div className="youtube"><span className="play">▶</span><div className="youtube-label"><b>Nguồn YouTube</b><small>Chỉ phân tích nội dung có quyền truy cập hợp lệ.</small></div><div className="youtube-form"><input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="Dán đường dẫn YouTube..." aria-label="Đường dẫn YouTube" /><button disabled={!youtube.trim()} onClick={checkYoutube}>Kiểm tra</button></div></div>
    </section>
    {(result || error || busy) && <section className="section result"><div className="section-head"><div><span>02</span><h2>Kết quả tiếp nhận</h2></div>{result && <small className={result.status === 'read' ? 'tag ready' : 'tag pending'}>{result.status === 'read' ? 'ĐÃ ĐỌC DỮ LIỆU' : 'CHỜ BỘ NHẬN DẠNG'}</small>}</div>
      {busy && <p className="message">Đang đọc tệp...</p>}{error && <p className="error">{error}</p>}
      {result && <article className="result-card"><h3>{result.title}</h3><ul>{result.lines.map(line => <li key={line}>{line}</li>)}</ul>
        {result.score && <ScoreStaffPreview score={result.score} />}
        {result.score && <div className="event-preview"><div className="event-preview-head"><b>Dữ liệu ký âm đã chuẩn hóa</b><small>HIỂN THỊ MẪU · TỐI ĐA 16 SỰ KIỆN</small></div>
          {result.score.parts.map(part => <section className="part-preview" key={part.id}><b>{part.name}</b>
            {part.measures.map(measure => <div className="measure-preview" key={part.id + '-' + measure.number}><span>Ô nhịp {measure.number}</span>
              <div>{measure.events.slice(0, 16).map(event => <span className="event-chip" key={event.id}>{event.kind === 'rest' ? 'Dấu lặng' : event.pitch ? event.pitch.step + (event.pitch.alter > 0 ? '♯' : event.pitch.alter < 0 ? '♭' : '') + event.pitch.octave : 'Nốt chưa rõ'} · {event.duration} phách</span>)}</div>
            </div>)}
          </section>)}
        </div>}
        <p>{result.note}</p></article>}
    </section>}
    <section className="section"><div className="section-head"><div><span>03</span><h2>Đường đi đến Music Editor</h2></div></div><div className="flow">
      <div><small>01</small><b>Nguồn đầu vào</b><span>Ảnh · PDF · XML · MIDI</span></div><i>→</i><div><small>02</small><b>Nhận dạng & chuẩn hóa</b><span>Music Data Engine</span></div><i>→</i><div><small>03</small><b>Music Editor</b><span>Đọc · Sửa · Phát · Lưu</span></div>
    </div><p className="footnote">MusicXML và MIDI hiện đã có bộ phân tích đưa dữ liệu về Music Data Model dùng chung. OMR, phân tích audio và Music Editor sẽ được tích hợp theo từng giai đoạn.</p></section>
    <footer><span>MELO LEGACY STUDIO</span><span>MEMENTO OF MUSIC, LEGACY OF LEARNING</span></footer>
  </main>
}
