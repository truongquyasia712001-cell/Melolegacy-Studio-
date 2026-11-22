import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { LocalLibrary } from './music/LocalLibrary'
import type { LocalScoreDocument } from './music/localStore'
import { parseMusicXml } from './music'
import { recognizePdfWithMelobot } from './music/recognitionApi'
import type { Score } from './music'
import { PianoPlayback } from './music/PianoPlayback'
import './App.css'

type Tool = 'pen' | 'text' | 'select' | 'piano'
type Measure = { id: number; notes: number[] }
const initialMeasures: Measure[] = Array.from({ length: 60 }, (_, i) => ({ id: i + 1, notes: [] }))
const iconPaths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5M9 21v-7h6v7',
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
  const [zoom, setZoom] = useState(86)
  const [pianoOpen, setPianoOpen] = useState(false)
  const [score, setScore] = useState<Score | null>(null)
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
  const toolLabel = useMemo(() => ({ pen: 'Bút', text: 'Chữ', select: 'Chọn vùng', piano: 'Piano' }[activeTool]), [activeTool])
  function openSavedScore(saved: LocalScoreDocument) {
    try { setScore(parseMusicXml(saved.musicxml).score); setNotice('Đã mở ' + saved.title); setLibraryOpen(false) }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Không thể mở bản nhạc.') }
  }
  async function importScore(file?: File) {
    if (!file) return
    if (/\.(xml|musicxml)$/i.test(file.name)) {
      try { setScore(parseMusicXml(await file.text()).score); setNotice('Đã mở MusicXML: ' + file.name) }
      catch (error) { setNotice(error instanceof Error ? error.message : 'Không đọc được MusicXML.') }
      return
    }
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
      setNotice('Đang gửi PDF đến MeloBot để nhận dạng…')
      try {
        const musicxml = await recognizePdfWithMelobot(file)
        setScore(parseMusicXml(musicxml).score)
        setNotice('MeloBot đã trả MusicXML. Vui lòng đối chiếu bản nhận dạng với PDF gốc trước khi sử dụng.')
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
    <header className="topbar">
      <div className="pinned-left">
        <ActionButton name="home" label="Trang chủ Melo" onClick={() => setNotice('Khu vực hệ thống Melo')}/>
        <ActionButton name="book" label="Thư viện" active={libraryOpen} onClick={() => setLibraryOpen(v => !v)}/>
      </div>
      <nav className="main-tools" aria-label="Công cụ soạn nhạc">
        <ActionButton name="undo" label="Lùi thao tác" onClick={() => setNotice('Hoàn tác thao tác gần nhất.')}/>
        <ActionButton name="redo" label="Tiến thao tác" onClick={() => setNotice('Làm lại thao tác.')}/>
        <ActionButton name="pen" label="Bút" active={activeTool === 'pen'} onClick={() => setTool('pen')}/>
        <ActionButton name="text" label="Viết chữ" active={activeTool === 'text'} onClick={() => setTool('text')}/>
        <ActionButton name="select" label="Chọn vùng" active={activeTool === 'select'} onClick={() => setTool('select')}/>
        <ActionButton name="piano" label="Piano" active={activeTool === 'piano'} onClick={() => setTool('piano')}/>
      </nav>
      <div className="pinned-right">
        <ActionButton name="upload" label="Tải lên" onClick={() => uploadRef.current?.click()}/>
        <input ref={uploadRef} type="file" hidden accept=".musicxml,.xml,.mid,.midi,.pdf,.png,.jpg,.jpeg,.webp,.wav,.mp3,.m4a" onChange={e => { void importScore(e.currentTarget.files?.[0]); e.currentTarget.value = '' }}/>
        <div className="export-anchor">
          <ActionButton name="share" label="Gửi, xuất hoặc tải xuống" active={exportOpen} onClick={() => setExportOpen(v => !v)}/>
          {exportOpen && <div className="export-popover"><button onClick={() => exportAction('share')}>Chia sẻ bản nhạc</button><button onClick={() => exportAction('download')}>Xuất / Tải xuống</button><button onClick={() => exportAction('print')}>In hoặc lưu PDF</button></div>}
        </div>
      </div>
    </header>
    <div className="editor-body">
      {libraryOpen && <aside className="library-panel"><div className="panel-title"><b>Thư viện nhạc</b><ActionButton name="close" label="Đóng thư viện" onClick={() => setLibraryOpen(false)}/></div><LocalLibrary onOpenScore={openSavedScore}/></aside>}
      <section className="paper-stage">
        <div className="stage-controls"><div className="stage-caption">MELO LEGACY <span>·</span> SCORE STUDIO</div><div className="zoom-tools"><ActionButton name="zoomOut" label="Thu nhỏ" onClick={() => setZoom(v => Math.max(55,v-5))}/><span>{zoom}%</span><ActionButton name="zoomIn" label="Phóng to" onClick={() => setZoom(v => Math.min(120,v+5))}/></div></div>
        <div className="paper-scroll" ref={scoreRef} style={{ '--paper-zoom': zoom / 100 } as CSSProperties}>
          {Array.from({ length: pages }, (_, i) => <ScorePage key={i+1} page={i+1} totalPages={pages} measures={measures.slice(i*60,(i+1)*60)} onMeasure={chooseMeasure} onAdd={addMeasure}/>)}
        </div>
        {notice && <div className="status-toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng"><Icon name="close"/></button></div>}
        {score && <div className="loaded-score"><b>{score.title || 'Bản nhạc đã mở'}</b><span>{score.parts.length} bè · MusicXML</span><PianoPlayback score={score}/></div>}
        {pianoOpen && <div className="piano-panel"><div className="piano-heading"><b>Piano</b><ActionButton name="close" label="Đóng piano" onClick={() => setPianoOpen(false)}/></div><div className="piano-keys">{Array.from({length:28},(_,i)=><button type="button" key={i} className={[1,3,6,8,10,13,15,18,20,22,25,27].includes(i)?'black-key':''} aria-label="Phím piano"/>)}</div><div className="octave-row"><span>Quãng 3</span><span>Quãng 4</span><span>Quãng 5</span></div></div>}
      </section>
      <aside className="options-panel">
        <div className="options-top"><b>{toolLabel}</b><span>THAO TÁC</span></div>
        <div className="options-content">
          {activeTool === 'pen' && <><p className="option-kicker">KIỂU NÉT</p><button className="option-tile selected">Bút ký âm</button><button className="option-tile">Bút chì</button><button className="option-tile">Tẩy</button><p className="option-kicker">ĐỘ DÀY</p><input type="range" min="1" max="8" defaultValue="3"/><p className="option-kicker">MÀU NÉT</p><div className="swatches"><i/><i/><i/></div></>}
          {activeTool === 'text' && <><p className="option-kicker">NỘI DUNG</p><button className="option-tile selected">Văn bản</button><button className="option-tile">Lời ca</button><button className="option-tile">Ký hiệu âm nhạc</button><p className="option-kicker">CỠ CHỮ</p><input type="range" min="10" max="32" defaultValue="16"/></>}
          {activeTool === 'select' && <><p className="option-kicker">PHẠM VI</p><button className="option-tile" onClick={() => setSelectedMeasures([activeMeasure])}>Một ô nhịp</button><button className="option-tile" onClick={() => setSelectedMeasures([activeMeasure,activeMeasure+1])}>Nhiều ô nhịp</button><p className="option-kicker">SAO CHÉP VÀ DÁN</p><div className="compact-actions"><ActionButton name="copy" label="Sao chép" onClick={copySelection}/><ActionButton name="cut" label="Cắt" onClick={() => {copySelection();setMeasures(old=>old.filter(m=>!selectedMeasures.includes(m.id)));setSelectedMeasures([])}}/><ActionButton name="paste" label="Dán" onClick={pasteSelection}/><ActionButton name="trash" label="Xóa" onClick={() => {setMeasures(old=>old.filter(m=>!selectedMeasures.includes(m.id)));setSelectedMeasures([])}}/></div><p className="option-kicker">CÁCH DÁN</p><button className={'option-tile'+(insertMode==='replace'?' selected':'')} onClick={() => setInsertMode('replace')}>Dán thay thế · chọn đủ ô nhịp</button><button className={'option-tile'+(insertMode==='insert'?' selected':'')} onClick={() => setInsertMode('insert')}>Dán chèn · đẩy phần sau</button><p className="helper-copy">Đang chọn: {selectedMeasures.length} ô nhịp · Đã sao chép: {clipboard.length} ô nhịp</p></>}
          {activeTool === 'piano' && <><p className="option-kicker">BÀN PHÍM</p><button className="option-tile selected" onClick={() => setPianoOpen(true)}>Mở bàn phím piano</button><p className="helper-copy">Dùng biểu tượng piano quen thuộc, mở bàn phím ngang phía dưới bản nhạc.</p></>}
        </div>
      </aside>
    </div>
  </main>
}
