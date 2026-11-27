import { useRef, useState } from 'react'
import { LocalLibrary } from './music/LocalLibrary'
import { DEVICE_LOCAL_OWNER_ID, saveLocalAsset, saveLocalScore, type LocalScoreDocument } from './music/localStore'
import { parseMidi, parseMusicXml } from './music'
import { recognizePdfWithMelobot } from './music/recognitionApi'
import type { Score } from './music'
import { PianoPlayback } from './music/PianoPlayback'
import { ScoreStaffPreview } from './music/ScoreStaffPreview'
import { ComposerToolBubbles } from './music/ComposerToolBubbles'
import './App.css'

type Tool = 'pen' | 'text' | 'select' | 'piano'
type Measure = { id: number; notes: number[] }
const initialMeasures: Measure[] = Array.from({ length: 60 }, (_, i) => ({ id: i + 1, notes: [] }))
const iconPaths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5M9 21v-7h6v7',
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15.5 8.5l-2 5-5 2 2-5z',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8',
  camera: 'M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  download: 'M12 3v12m-5-5 5 5 5-5M4 19v2h16v-2',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 13.5l2 1.2-2 3.5-2.2-1a8 8 0 0 1-2 .9L14.5 20h-5L9 18a8 8 0 0 1-2-.9l-2.2 1-2-3.5 2-1.2a8 8 0 0 1 0-2.3l-2-1.2 2-3.5L7 7.4a8 8 0 0 1 2-.9L9.5 4h5l.3 2.5a8 8 0 0 1 2 .9L19 6.5l2 3.5-2 1.2a8 8 0 0 1 0 2.3z',
  book: 'M4 5.5A3.5 3.5 0 0 1 7.5 2H21v18H7.5A3.5 3.5 0 0 0 4 23z M4 5.5V23 M8 6h9 M8 10h9',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5',
  share: 'M12 15V3m-5 5 5-5 5 5M5 13v7h14v-7',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2',
  redo: 'm15 14 5-5-5-5m5 5H10a6 6 0 0 0 0 12h2',
  pen: 'm4 20 4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11zM14.5 6.5l3 3',
  text: 'M4 5V3h16v2M12 3v18M8 21h8',
  select: 'M4 4h16v16H4zM8 8h8v8H8z',
  piano: 'M3 5h18v14H3zM7 5v9m5-9v9m5-9v9M7 14h3m2 0h3m2 0h1',
  close: 'M5 5l14 14M19 5 5 19',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  copy: 'M8 8V4h12v12h-4M4 8h12v12H4z',
  cut: 'm6 6 12 12M18 6 6 18M4 4h.01M20 20h.01',
  paste: 'M8 4h8v3H8zM6 7H4v14h16V7h-2M8 11h8M8 15h8',
  trash: 'M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6',
  zoomIn: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5M11 8v6m-3-3h6',
  zoomOut: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5M8 11h6',
  check: 'm5 12 4 4L19 6'
}
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={iconPaths[name] || iconPaths.plus} /></svg>
}
function ActionButton({ name, label, onClick, active = false }: { name: string; label: string; onClick: () => void; active?: boolean }) {
  return <button className={'icon-button' + (active ? ' is-active' : '')} type="button" title={label} aria-label={label} onClick={onClick}><Icon name={name} /></button>
}
function StaffSystem({ row, first, last, measures, onMeasure, onAdd }: { row: number; first: boolean; last: boolean; measures: Measure[]; onMeasure: (id: number) => void; onAdd: () => void }) {
  const firstMeasure = measures[0]?.id || row * 5 + 1
  return <div className="staff-system">
    <span className="measure-index">{firstMeasure}</span>
    <span className="staff-clef">𝄞</span>
    {first && <span className="time-signature"><b>4</b><b>4</b></span>}
    <div className="measure-run">
      {measures.map((measure, index) => <button className="measure-cell" key={measure.id} type="button" onClick={() => onMeasure(measure.id)} aria-label={'Ô nhịp ' + measure.id}>
        <span className="staff-lines"><i/><i/><i/><i/><i/></span>
        {measure.notes.map((note, i) => <span className="note-dot" key={i} style={{ left: (22 + i * 13) + '%', top: (48 - note * 5) + '%' }} />)}
        {index === measures.length - 1 && last && <span className="measure-end-mark" />}
      </button>)}
      {last && <button className="add-measure" type="button" title="Thêm ô nhịp" aria-label="Thêm ô nhịp" onClick={onAdd}><Icon name="plus"/></button>}
    </div>
  </div>
}
function ScorePage({ page, totalPages, measures, onMeasure, onAdd }: { page: number; totalPages: number; measures: Measure[]; onMeasure: (id: number) => void; onAdd: () => void }) {
  return <article className="a4-sheet">
    <span className="sheet-page-number">{page}</span>
    <div className="sheet-systems">
      {Array.from({ length: 12 }, (_, row) => <StaffSystem key={row} row={row} first={page === 1 && row === 0} last={page === totalPages && row === 11} measures={measures.slice(row * 5, row * 5 + 5)} onMeasure={onMeasure} onAdd={onAdd}/>)}
    </div>
  </article>
}
export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('pen')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [score, setScore] = useState<Score | null>(null)
  const [omrNeedsReview, setOmrNeedsReview] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [measures, setMeasures] = useState<Measure[]>(initialMeasures)
  const [selectedMeasures, setSelectedMeasures] = useState<number[]>([])
  const [clipboard, setClipboard] = useState<Measure[]>([])
  const [insertMode, setInsertMode] = useState<'replace' | 'insert'>('insert')
  const [activeMeasure, setActiveMeasure] = useState(1)
  const uploadRef = useRef<HTMLInputElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const pages = Math.max(1, Math.ceil(measures.length / 60))
  async function saveOriginal(file: File, kind: 'musicxml' | 'midi' | 'pdf') {
    return saveLocalAsset({
      ownerId: DEVICE_LOCAL_OWNER_ID,
      title: file.name,
      kind,
      mimeType: file.type || (kind === 'pdf' ? 'application/pdf' : kind === 'midi' ? 'audio/midi' : 'application/vnd.recordare.musicxml+xml'),
      blob: file,
    })
  }
  async function saveNormalizedScore(musicxml: string, sourceAssetId: string) {
    const parsed = parseMusicXml(musicxml)
    await saveLocalScore({
      id: `score-${sourceAssetId}`,
      ownerId: DEVICE_LOCAL_OWNER_ID,
      title: parsed.score.title || 'Bản nhạc chưa đặt tên',
      musicxml,
      sourceAssetId,
    })
    setScore(parsed.score)
    return parsed.score
  }
  function openSavedScore(saved: LocalScoreDocument) {
    try { setScore(parseMusicXml(saved.musicxml).score); setNotice('Đã mở ' + saved.title); setLibraryOpen(false) }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Không thể mở bản nhạc.') }
  }
  async function importScore(file?: File) {
    if (!file) return
    if (/\.(xml|musicxml)$/i.test(file.name)) {
      try {
        const original = await saveOriginal(file, 'musicxml')
        await saveNormalizedScore(await file.text(), original.id)
        setOmrNeedsReview(false)
        setNotice('Đã lưu bản gốc và bản MusicXML chuẩn hóa vào thư viện: ' + file.name)
      } catch (error) { setNotice(error instanceof Error ? error.message : 'Không đọc được hoặc không thể lưu MusicXML.') }
      return
    }
    if (/\.(mid|midi)$/i.test(file.name) || file.type === 'audio/midi' || file.type === 'audio/x-midi') {
      try {
        await saveOriginal(file, 'midi')
        const parsed = parseMidi(await file.arrayBuffer())
        setScore(parsed.score)
        setOmrNeedsReview(false)
        setNotice('Đã lưu bản MIDI gốc vào thư viện và mở dữ liệu đọc được. Kiểm tra các bè, nhịp và cao độ trước khi tiếp tục.')
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Không đọc được tệp MIDI.')
      }
      return
    }
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
      setNotice('Đang gửi PDF đến MeloBot để nhận dạng…')
      try {
        const original = await saveOriginal(file, 'pdf')
        const musicxml = await recognizePdfWithMelobot(file)
        await saveNormalizedScore(musicxml, original.id)
        setOmrNeedsReview(true)
        setNotice('Đã lưu PDF gốc và MusicXML nhận dạng vào thư viện. Vui lòng đối chiếu bản nhận dạng với PDF gốc trước khi sử dụng.')
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Không thể kết nối MeloBot.')
      }
      return
    }
    setNotice('Định dạng này chưa được nối với dịch vụ âm nhạc. Hiện hỗ trợ PDF và MusicXML.')
  }
  function addMeasure() {
    setMeasures(old => [...old, { id: old.length + 1, notes: [] }])
    setNotice('Đã thêm ô nhịp mới.')
  }
  function chooseMeasure(id: number) {
    setActiveMeasure(id)
    if (activeTool === 'select') setSelectedMeasures(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])
    else if (activeTool === 'pen') {
      setMeasures(old => old.map(item => item.id === id ? { ...item, notes: [...item.notes, 0] } : item))
      if (id % 5 === 0) requestAnimationFrame(() => scoreRef.current?.scrollBy({ top: 112, behavior: 'smooth' }))
    }
  }
  function copySelection() {
    const chosen = selectedMeasures.length ? selectedMeasures : [activeMeasure]
    setClipboard(measures.filter(item => chosen.includes(item.id)).map(item => ({ ...item, notes: [...item.notes] })))
    setNotice('Đã sao chép ' + chosen.length + ' ô nhịp.')
  }
  function pasteSelection() {
    if (!clipboard.length) { setNotice('Chưa có nội dung để dán.'); return }
    const chosen = [...selectedMeasures].sort((a,b)=>a-b)
    if (insertMode === 'replace' && chosen.length !== clipboard.length) { setNotice('Để dán thay thế, hãy chọn đúng số ô nhịp bằng đoạn đã sao chép.'); return }
    setMeasures(old => {
      if (insertMode === 'replace') return old.map(item => { const index = chosen.indexOf(item.id); return index >= 0 ? { ...clipboard[index], id: item.id } : item })
      const index = Math.max(0, old.findIndex(item => item.id === activeMeasure))
      const next = [...old]
      next.splice(index, 0, ...clipboard.map((item, i) => ({ ...item, id: activeMeasure + i })))
      return next.map((item, i) => ({ ...item, id: i + 1 }))
    })
    setSelectedMeasures([])
    setNotice(insertMode === 'replace' ? 'Đã dán thay thế vùng đã chọn.' : 'Đã chèn đoạn nhạc và đẩy các ô phía sau.')
  }
  function exportAction(action: string) {
    setExportOpen(false)
    if (action === 'print') window.print()
    else if (action === 'share' && navigator.share) void navigator.share({ title: 'Melo Legacy', text: 'Bản nhạc từ Melo Legacy Studio' }).catch(() => undefined)
    else setNotice(action === 'download' ? 'Đang chuẩn bị chức năng xuất PDF/MusicXML.' : 'Thiết bị chưa hỗ trợ chia sẻ trực tiếp.')
  }
  function setTool(tool: Tool) { setActiveTool(tool); setPianoOpen(tool === 'piano') }
  return <main className="editor-app">
    <header className="topbar composer-topbar">
      <div className="pinned-left">
        <ActionButton name="book" label="Thư viện" active={libraryOpen} onClick={() => setLibraryOpen(v => !v)}/>
      </div>
      <nav className="main-tools" aria-label="Công cụ phía trên">
        <ActionButton name="compass" label="Kim chỉ nam" onClick={() => setNotice('Hướng dẫn Composer')}/>
        <ActionButton name="mic" label="Thu âm / ngân nga" onClick={() => setNotice('Thu âm giọng hát sẽ được nối với Sound Lab')}/>
        <ActionButton name="camera" label="Chụp bản nhạc" onClick={() => uploadRef.current?.click()}/>
        <ActionButton name="share" label="Chia sẻ / xuất / in" onClick={() => setExportOpen(v => !v)}/>
        <ActionButton name="download" label="Tải xuống" onClick={() => setNotice('Xuất MusicXML/MIDI/PDF sẽ được mở rộng trong luồng xuất')}/>
      </nav>
      <div className="pinned-right">
        <ActionButton name="settings" label="Cài đặt" onClick={() => setNotice('Cài đặt Composer')}/>
        <input ref={uploadRef} type="file" hidden accept=".musicxml,.xml,.mid,.midi,.pdf" onChange={e => { void importScore(e.currentTarget.files?.[0]); e.currentTarget.value = '' }}/>
        {exportOpen && <div className="export-popover top-export"><button onClick={() => exportAction('share')}>Chia sẻ bản nhạc</button><button onClick={() => exportAction('download')}>Xuất / Tải xuống</button><button onClick={() => exportAction('print')}>In hoặc lưu PDF</button></div>}
      </div>
    </header>
    <div className="editor-body">
      {libraryOpen && <aside className="library-panel"><div className="panel-title"><b>Thư viện nhạc</b><ActionButton name="close" label="Đóng thư viện" onClick={() => setLibraryOpen(false)}/></div><LocalLibrary onOpenScore={openSavedScore}/></aside>}
      <section className="paper-stage">
        <div className="paper-scroll" ref={scoreRef}>
          {score ? <ScoreStaffPreview score={score} /> : Array.from({ length: pages }, (_, i) => <ScorePage key={i+1} page={i+1} totalPages={pages} measures={measures.slice(i*60,(i+1)*60)} onMeasure={chooseMeasure} onAdd={addMeasure}/>)}
        </div>
        {notice && <div className="status-toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng"><Icon name="close"/></button></div>}
        {omrNeedsReview && <div className="status-toast" role="alert"><b>OMR · CHƯA ĐƯỢC XÁC MINH</b><span>Kết quả nhận dạng chỉ là bản nháp. Hãy đối chiếu từng khuông, khóa nhạc, dấu hóa, cao độ, trường độ, nhịp, dấu lặng và từng bè với PDF gốc. Không dùng làm bản chính thức hoặc đem xuất bản khi chưa được người có chuyên môn kiểm tra.</span></div>}
        {score && <div className="loaded-score"><b>{score.title || 'Bản nhạc đã mở'}</b><span>{score.parts.length} bè · MusicXML</span><PianoPlayback score={score}/></div>}
        <ComposerToolBubbles onUploadPDF={() => uploadRef.current?.click()} onUndo={() => setNotice("Hoàn tác: cần nối lịch sử chỉnh sửa trước khi bật thao tác thật.")} onRedo={() => setNotice("Làm lại: cần nối lịch sử chỉnh sửa trước khi bật thao tác thật.")} onPlay={() => setNotice(score ? "Dùng trình phát của bản nhạc đã mở để phát toàn bộ tác phẩm." : "Hãy nhập bản nhạc trước khi phát.")}/>
      </section>

    </div>
  </main>
}
