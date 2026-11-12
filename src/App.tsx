import { useRef, useState } from 'react'
import { parseMidi, parseMusicXml } from './music'
import type { ParseSummary, Score } from './music'
import { ScoreStaffPreview } from './music/ScoreStaffPreview'
import { PianoPlayback } from './music/PianoPlayback'
import { decodeMidiBase64, recognizeAudioFile, recognizeScoreFile } from './music/recognitionApi'
import './App.css'

type Kind = 'musicxml' | 'midi' | 'image' | 'pdf' | 'audio'
type Result = { title: string; status: 'read' | 'pending'; lines: string[]; note: string; score?: Score; exportText?: string; exportMidi?: string }
const sources: { kind: Kind; title: string; detail: string; icon: string; accept: string }[] = [
  { kind: 'musicxml', title: 'MusicXML', detail: 'Đọc cấu trúc ký âm', icon: '♫', accept: '.musicxml,.xml' },
  { kind: 'midi', title: 'MIDI', detail: 'Đọc track và sự kiện nốt', icon: '⌁', accept: '.mid,.midi' },
  { kind: 'image', title: 'Ảnh bản nhạc', detail: 'PNG, JPG, WEBP · nhận dạng OMR', icon: '▧', accept: 'image/*' },
  { kind: 'pdf', title: 'PDF bản nhạc', detail: 'PDF scan hoặc PDF xuất từ phần mềm', icon: '▤', accept: '.pdf,application/pdf' },
  { kind: 'audio', title: 'Âm thanh', detail: 'WAV, MP3, M4A · chuyển thành MIDI', icon: '◖', accept: 'audio/*,.wav,.mp3,.m4a,.flac' },
]
function toResult(parsed: ParseSummary): Result {
  return { title: parsed.score.title, status: 'read', lines: parsed.lines, note: parsed.note, score: parsed.score }
}
function downloadText(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = name; anchor.click()
  URL.revokeObjectURL(url)
}
function downloadMidi(name: string, content: string) {
  const bytes = decodeMidiBase64(content)
  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/midi' }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = name; anchor.click()
  URL.revokeObjectURL(url)
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
      else if (kind === 'image' || kind === 'pdf') {
        const response = await recognizeScoreFile(file)
        if (!response.musicxml) throw new Error('Engine OMR chưa trả về MusicXML.')
        const parsed = parseMusicXml(response.musicxml)
        setResult({
          ...toResult(parsed),
          title: parsed.score.title || file.name,
          lines: [...parsed.lines, 'Bộ nhận dạng: ' + response.engine, 'Nguồn: ' + file.name, ...(response.warnings || [])],
          note: 'Đã nhận dạng OMR và chuyển kết quả vào Music Data Model. Hãy kiểm tra lại bản nhạc trước khi sử dụng; nhận dạng tự động không bảo đảm đúng tuyệt đối.',
          exportText: response.musicxml,
          exportMidi: response.midi_base64 || undefined,
        })
      } else {
        const response = await recognizeAudioFile(file)
        if (!response.midi_base64) throw new Error('Engine audio chưa trả về MIDI.')
        const parsed = parseMidi(decodeMidiBase64(response.midi_base64))
        setResult({
          ...toResult(parsed),
          title: file.name,
          lines: [...parsed.lines, 'Bộ nhận dạng: ' + response.engine, 'Nguồn: ' + file.name, ...(response.warnings || [])],
          note: 'Đã chuyển âm thanh thành MIDI và nạp vào Music Data Model. Cần nghe lại, chỉnh nốt, trường độ và cách chia bè trước khi xuất bản nhạc chính thức.',
          exportMidi: response.midi_base64,
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể xử lý tệp. Hãy kiểm tra API nhận dạng đã chạy chưa.')
    } finally { setBusy(false) }
  }

  function checkYoutube() {
    setError(''); setResult(null)
    if (!/^https?:\/\/(www\\.)?(youtube\\.com|youtu\\.be)\//i.test(youtube.trim())) { setError('Đường dẫn YouTube chưa hợp lệ.'); return }
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
    {(result || error || busy) && <section className="section result"><div className="section-head"><div><span>02</span><h2>Kết quả nhận dạng</h2></div>{result && <small className={result.status === 'read' ? 'tag ready' : 'tag pending'}>{result.status === 'read' ? 'ĐÃ ĐỌC DỮ LIỆU' : 'CHỜ XỬ LÝ'}</small>}</div>
      {busy && <p className="message">Đang gửi tệp đến bộ nhận dạng cục bộ. Tệp được xử lý trong phiên tạm...</p>}{error && <p className="error">{error}</p>}
      {result && <article className="result-card"><h3>{result.title}</h3><ul>{result.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
        <div className="recognition-exports">
          {result.exportText && <button onClick={() => downloadText('MeloLegacy-Recognized.musicxml', result.exportText!, 'application/vnd.recordare.musicxml+xml')}>Tải MusicXML</button>}
          {result.exportMidi && <button onClick={() => downloadMidi('MeloLegacy-Recognized.mid', result.exportMidi!)}>Tải MIDI</button>}
        </div>
        {result.score && <PianoPlayback score={result.score} />}
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
      <div><small>01</small><b>Ảnh / PDF / Audio</b><span>OMR · Audio-to-MIDI</span></div><i>→</i><div><small>02</small><b>Nhận dạng & chuẩn hóa</b><span>Music Data Engine</span></div><i>→</i><div><small>03</small><b>Music Editor</b><span>Đọc · Sửa · Phát · Lưu</span></div>
    </div><p className="footnote">OMR và audio-to-MIDI đã có API xử lý cục bộ. Cần cài và khởi chạy dịch vụ nhận dạng theo hướng dẫn trong services/music-recognition/README.md. Music Editor chỉnh sửa đầy đủ sẽ được phát triển tiếp trên cùng Music Data Model.</p></section>
    <footer><span>MELO LEGACY STUDIO</span><span>MEMENTO OF MUSIC, LEGACY OF LEARNING</span></footer>
  </main>
}
