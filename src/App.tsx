import { useRef, useState } from 'react'
import './App.css'

type Kind = 'musicxml' | 'midi' | 'image' | 'pdf' | 'audio'
type Result = { title: string; status: 'read' | 'pending'; lines: string[]; note: string }
const sources: { kind: Kind; title: string; detail: string; icon: string; accept: string }[] = [
  { kind: 'musicxml', title: 'MusicXML', detail: 'Đọc cấu trúc ký âm', icon: '♫', accept: '.musicxml,.xml' },
  { kind: 'midi', title: 'MIDI', detail: 'Kiểm tra dữ liệu MIDI', icon: '⌁', accept: '.mid,.midi' },
  { kind: 'image', title: 'Ảnh bản nhạc', detail: 'JPG, PNG, WEBP · OMR đang phát triển', icon: '▧', accept: 'image/*' },
  { kind: 'pdf', title: 'PDF bản nhạc', detail: 'PDF scan hoặc PDF xuất từ phần mềm', icon: '▤', accept: '.pdf,application/pdf' },
  { kind: 'audio', title: 'Âm thanh', detail: 'WAV, MP3, M4A · phân tích đang phát triển', icon: '◖', accept: 'audio/*,.wav,.mp3,.m4a' },
]

function parseMusicXml(source: string): Result {
  const xml = new DOMParser().parseFromString(source, 'application/xml')
  if (xml.querySelector('parsererror')) throw new Error('Tệp XML không hợp lệ.')
  const root = xml.documentElement.tagName
  if (root !== 'score-partwise' && root !== 'score-timewise') throw new Error('Đây không phải tài liệu MusicXML hợp lệ.')
  const title = xml.querySelector('work-title')?.textContent?.trim() || xml.querySelector('movement-title')?.textContent?.trim() || 'Tác phẩm chưa đặt tên'
  const parts = xml.querySelectorAll('part').length
  const measures = xml.querySelectorAll('measure').length
  const notes = xml.querySelectorAll('note').length
  const rests = xml.querySelectorAll('note rest').length
  return { title, status: 'read', lines: [
    'Cấu trúc: ' + root, 'Số bè: ' + parts, 'Số ô nhịp: ' + measures,
    'Số sự kiện nốt và dấu lặng: ' + notes, 'Số dấu lặng: ' + rests,
  ], note: 'Đã đọc cấu trúc MusicXML cơ bản. Bộ dựng khuông nhạc và phát lại trong Music Editor chưa được kết nối.' }
}

function parseMidi(buffer: ArrayBuffer): Result {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  const tag = String.fromCharCode(...bytes.slice(0, 4))
  if (tag !== 'MThd' || bytes.length < 14) throw new Error('Không tìm thấy MIDI header hợp lệ.')
  const headerSize = view.getUint32(4, false)
  if (headerSize < 6 || bytes.length < 8 + headerSize) throw new Error('MIDI header bị thiếu hoặc không hợp lệ.')
  const format = view.getUint16(8, false)
  const tracks = view.getUint16(10, false)
  const division = view.getUint16(12, false)
  return { title: 'Tệp MIDI', status: 'read', lines: [
    'Định dạng MIDI: ' + format, 'Số track: ' + tracks,
    division & 0x8000 ? 'Time division: SMPTE' : 'Ticks mỗi phách: ' + division,
    'Dung lượng: ' + Math.round(bytes.length / 1024) + ' KB',
  ], note: 'Đã kiểm tra header MIDI. Bộ đọc sự kiện track, tempo và chuyển đổi sang MusicXML sẽ được bổ sung tiếp theo.' }
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
      if (kind === 'musicxml') setResult(parseMusicXml(await file.text()))
      else if (kind === 'midi') setResult(parseMidi(await file.arrayBuffer()))
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
    {(result || error || busy) && <section className="section result"><div className="section-head"><div><span>02</span><h2>Kết quả tiếp nhận</h2></div>{result && <small className={result.status === 'read' ? 'tag ready' : 'tag pending'}>{result.status === 'read' ? 'ĐÃ ĐỌC CẤU TRÚC' : 'CHỜ BỘ NHẬN DẠNG'}</small>}</div>
      {busy && <p className="message">Đang đọc tệp...</p>}{error && <p className="error">{error}</p>}
      {result && <article className="result-card"><h3>{result.title}</h3><ul>{result.lines.map(line => <li key={line}>{line}</li>)}</ul><p>{result.note}</p></article>}
    </section>}
    <section className="section"><div className="section-head"><div><span>03</span><h2>Đường đi đến Music Editor</h2></div></div><div className="flow">
      <div><small>01</small><b>Nguồn đầu vào</b><span>Ảnh · PDF · XML · MIDI</span></div><i>→</i><div><small>02</small><b>Nhận dạng & chuẩn hóa</b><span>Music Data Engine</span></div><i>→</i><div><small>03</small><b>Music Editor</b><span>Đọc · Sửa · Phát · Lưu</span></div>
    </div><p className="footnote">Hiện đã có giao diện tiếp nhận và kiểm tra cấu trúc MusicXML/MIDI cơ bản. OMR, phân tích audio, đọc track MIDI đầy đủ và Music Editor sẽ được tích hợp theo từng giai đoạn.</p></section>
    <footer><span>MELO LEGACY STUDIO</span><span>MEMENTO OF MUSIC, LEGACY OF LEARNING</span></footer>
  </main>
}