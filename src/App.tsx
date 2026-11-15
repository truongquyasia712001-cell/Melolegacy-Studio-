import { useRef, useState, type CSSProperties } from 'react'
import { LocalLibrary } from './music/LocalLibrary'
import type { LocalScoreDocument } from './music/localStore'
import { parseMusicXml } from './music'
import type { Score } from './music'
import { PianoPlayback } from './music/PianoPlayback'
import './App.css'

type Tool = 'pen' | 'text' | 'select' | 'piano'
const toolItems: { id: Tool; label: string; glyph: string }[] = [
  { id: 'pen', label: 'Bút', glyph: '✎' },
  { id: 'text', label: 'Viết chữ', glyph: 'T' },
  { id: 'select', label: 'Chọn vùng', glyph: '▧' },
  { id: 'piano', label: 'Piano', glyph: '▥' },
]
function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    home: 'M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5M9 21v-7h6v7',
    book: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z M4 4.5v18 M8 6h8 M8 10h8',
    upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5',
    share: 'M12 15V3m-5 5 5-5 5 5M5 13v7h14v-7',
    undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2',
    redo: 'm15 14 5-5-5-5m5 5H10a6 6 0 0 0 0 12h2',
    close: 'M5 5l14 14M19 5 5 19',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.plus} /></svg>
}
function StaffLine({ index, first, onAddNote }: { index: number; first: boolean; onAddNote: () => void }) {
  return <div className="score-system">
    <div className="measure-number">{index * 5 + 1}</div>
    <div className="staff-clef-mark">{first ? '𝄞' : '𝄞'}</div>
    {first && <div className="time-mark">4<br />4</div>}
    <div className="staff-measures" onClick={onAddNote} role="button" tabIndex={0} aria-label="Thêm nốt vào khuông nhạc">
      {Array.from({ length: 5 }, (_, i) => <div className="score-measure" key={i}>
        <div className="five-lines"><i /><i /><i /><i /><i /></div>
        {i === 0 && index === 0 && <span className="sample-note">●</span>}
      </div>)}
    </div>
  </div>
}
function ScorePage({ page, onAddNote }: { page: number; onAddNote: () => void }) {
  return <article className="a4-page">
    <div className="page-number">{page}</div>
    <div className="page-content">
      {Array.from({ length: 10 }, (_, i) => <StaffLine key={i} index={(page - 1) * 10 + i} first={page === 1 && i === 0} onAddNote={onAddNote} />)}
    </div>
    <div className="page-footer">MELO LEGACY</div>
  </article>
}
export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('pen')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [pages, setPages] = useState(1)
  const [zoom, setZoom] = useState(85)
  const [pianoOpen, setPianoOpen] = useState(false)
  const [score, setScore] = useState<Score | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const uploadRef = useRef<HTMLInputElement>(null)
  function openSavedScore(saved: LocalScoreDocument) {
    try {
      const parsed = parseMusicXml(saved.musicxml)
      setScore(parsed.score)
      setNotice('Đã mở bản nhạc ' + saved.title)
      setLibraryOpen(false)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể mở bản nhạc.')
    }
  }
  async function importScore(file?: File) {
    if (!file) return
    if (file.name.toLowerCase().endsWith('.xml') || file.name.toLowerCase().endsWith('.musicxml')) {
      try {
        setScore(parseMusicXml(await file.text()).score)
        setNotice('Đã đọc MusicXML: ' + file.name)
      } catch (error) { setNotice(error instanceof Error ? error.message : 'Không đọc được MusicXML.') }
    } else {
      setNotice('Đã nhận tệp ' + file.name + '. Bộ nhận dạng PDF/ảnh sẽ được kết nối vào không gian soạn nhạc ở bước tiếp theo.')
    }
  }
  function addPage() { setPages(value => value + 1); setNotice('Đã thêm một trang A4.') }
  function selectTool(tool: Tool) {
    setActiveTool(tool)
    setPianoOpen(tool === 'piano')
  }
  function exportAction(action: string) {
    setExportOpen(false)
    if (action === 'print') window.print()
    else if (action === 'download') setNotice('Chức năng xuất MusicXML/PDF sẽ lấy dữ liệu từ bản nhạc đang soạn.')
    else if (action === 'share') {
      if (navigator.share) void navigator.share({ title: 'Melo Legacy', text: 'Bản nhạc từ Melo Legacy Studio' }).catch(() => undefined)
      else setNotice('Thiết bị này chưa hỗ trợ chia sẻ trực tiếp.')
    }
  }
  return <main className="editor-app">
    <header className="editor-toolbar">
      <div className="fixed-actions">
        <button className="fixed-icon home-icon" title="Hệ thống" aria-label="Hệ thống" onClick={() => setNotice('Khu vực hệ thống Melo Legacy')}><Icon name="home" /></button>
        <button className={'fixed-icon library-icon ' + (libraryOpen ? 'active' : '')} title="Thư viện" aria-label="Thư viện" onClick={() => setLibraryOpen(value => !value)}><Icon name="book" /></button>
      </div>
      <div className="tool-scroll" aria-label="Thanh công cụ">
        <button className="tool-button" title="Lùi thao tác" aria-label="Lùi thao tác" onClick={() => setNotice('Chưa có thao tác để hoàn tác.')}><Icon name="undo" /></button>
        <button className="tool-button" title="Tiến thao tác" aria-label="Tiến thao tác" onClick={() => setNotice('Chưa có thao tác để làm lại.')}><Icon name="redo" /></button>
        {toolItems.map(tool => <button key={tool.id} className={'tool-button ' + (activeTool === tool.id ? 'selected' : '')} title={tool.label} aria-label={tool.label} onClick={() => selectTool(tool.id)}>{tool.id === 'piano' ? <span className="piano-icon">▥</span> : <span>{tool.glyph}</span>}</button>)}
      </div>
      <div className="right-fixed">
        <button className="fixed-icon upload-icon" title="Tải lên" aria-label="Tải lên" onClick={() => uploadRef.current?.click()}><Icon name="upload" /></button>
        <input ref={uploadRef} type="file" hidden accept=".musicxml,.xml,.mid,.midi,.pdf,.png,.jpg,.jpeg,.webp,.wav,.mp3,.m4a" onChange={event => { void importScore(event.currentTarget.files?.[0]); event.currentTarget.value = '' }} />
        <div className="export-wrap">
          <button className="fixed-icon export-icon" title="Gửi, xuất hoặc tải xuống" aria-label="Gửi, xuất hoặc tải xuống" onClick={() => setExportOpen(value => !value)}><Icon name="share" /></button>
          {exportOpen && <div className="export-menu"><button onClick={() => exportAction('share')}>Chia sẻ</button><button onClick={() => exportAction('download')}>Tải xuống / Xuất</button><button onClick={() => exportAction('print')}>In hoặc lưu PDF</button></div>}
        </div>
      </div>
    </header>
    <div className="workspace">
      {libraryOpen && <aside className="library-drawer"><div className="drawer-heading"><b>Thư viện nhạc</b><button onClick={() => setLibraryOpen(false)} aria-label="Đóng thư viện"><Icon name="close" /></button></div><LocalLibrary onOpenScore={openSavedScore} /></aside>}
      <section className="score-workspace">
        <div className="score-topline"><span>TRÌNH SOẠN NHẠC</span><div className="zoom-control"><button onClick={() => setZoom(value => Math.max(55, value - 5))} aria-label="Thu nhỏ"><Icon name="minus" /></button><span>{zoom}%</span><button onClick={() => setZoom(value => Math.min(120, value + 5))} aria-label="Phóng to"><Icon name="plus" /></button></div></div>
        <div className="pages-scroll" style={{ ['--page-zoom']: zoom / 100 } as CSSProperties}>
          {Array.from({ length: pages }, (_, i) => <ScorePage key={i + 1} page={i + 1} onAddNote={() => setNotice(activeTool === 'pen' ? 'Đã chọn vị trí viết trên khuông. Bộ nhập nốt trực tiếp sẽ được nối vào Music Data Model.' : 'Hãy chọn công cụ Bút để viết nốt.')} />)}
          <button className="add-page" onClick={addPage}><Icon name="plus" /> Thêm trang nhạc</button>
        </div>
        {notice && <div className="editor-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo"><Icon name="close" /></button></div>}
        {score && <div className="loaded-score"><b>{score.title || 'Bản nhạc đã mở'}</b><span>{score.parts.length} bè · đã nạp dữ liệu MusicXML</span><PianoPlayback score={score} /></div>}
        {pianoOpen && <div className="piano-dock"><div className="piano-dock-head"><b>Bàn phím piano</b><button onClick={() => setPianoOpen(false)} aria-label="Đóng piano"><Icon name="close" /></button></div><div className="piano-keys">{Array.from({ length: 28 }, (_, i) => <span className={ [1, 3, 6, 8, 10, 13, 15, 18, 20, 22, 25, 27].includes(i) ? 'black-key' : '' } key={i} />)}</div><div className="octave-labels"><span>Quãng 3</span><span>Quãng 4</span><span>Quãng 5</span></div></div>}
      </section>
      <aside className="tool-options">
        <div className="options-heading"><b>{toolItems.find(item => item.id === activeTool)?.label || 'Công cụ'}</b><span>THIẾT LẬP</span></div>
        <div className="options-scroll">
          {activeTool === 'pen' && <><label>Loại bút</label><button className="option-choice selected">Bút ký âm</button><button className="option-choice">Bút chì</button><button className="option-choice">Tẩy</button><label>Độ dày nét</label><input type="range" min="1" max="8" defaultValue="3" /><label>Màu nét</label><div className="color-dots"><i /><i /><i /></div></>}
          {activeTool === 'text' && <><label>Kiểu chữ</label><button className="option-choice selected">Văn bản</button><button className="option-choice">Lời ca</button><button className="option-choice">Ký hiệu</button><label>Cỡ chữ</label><input type="range" min="10" max="32" defaultValue="16" /></>}
          {activeTool === 'select' && <><label>Phạm vi chọn</label><button className="option-choice selected">Một nốt</button><button className="option-choice">Nhóm nốt</button><button className="option-choice">Một ô nhịp</button><button className="option-choice">Nhiều ô nhịp</button><label>Thao tác</label><button className="option-choice">Sao chép</button><button className="option-choice">Cắt</button><button className="option-choice">Dán chèn</button><button className="option-choice">Dán thay thế</button><button className="option-choice">Xóa</button></>}
          {activeTool === 'piano' && <><label>Bàn phím</label><button className="option-choice selected" onClick={() => setPianoOpen(true)}>Mở bàn phím</button><button className="option-choice">Quãng 3</button><button className="option-choice">Quãng 4</button><button className="option-choice">Quãng 5</button></>}
          <div className="options-note">Bảng tùy chọn cuộn dọc độc lập. Thanh công cụ chính cuộn ngang; Home và Thư viện luôn cố định.</div>
        </div>
      </aside>
    </div>
  </main>
}
