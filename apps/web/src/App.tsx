import { useEffect, useMemo, useRef, useState } from 'react'
import { Accidental, Beam, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'
import './App.css'

type Duration = 'w' | 'h' | 'q' | '8' | '16' | '32'
type NoteItem = { id: number; staff: number; measure: number; key: string; duration: Duration; dotted: boolean; accidental: '' | '#' | 'b' | 'n'; rest: boolean }
type Layout = 'solo' | 'large' | 'grand' | 'orchestra'
const DURATIONS: { value: Duration; label: string; glyph: string }[] = [
  { value: 'w', label: 'Tròn', glyph: '𝅝' }, { value: 'h', label: 'Trắng', glyph: '𝅗𝅥' },
  { value: 'q', label: 'Đen', glyph: '♩' }, { value: '8', label: 'Móc đơn', glyph: '♪' },
  { value: '16', label: 'Móc kép', glyph: '𝅘𝅥𝅯' }, { value: '32', label: 'Móc ba', glyph: '𝅘𝅥𝅰' },
]
const DIATONIC = ['c', 'd', 'e', 'f', 'g', 'a', 'b']
const BEATS: Record<Duration, number> = { w: 4, h: 2, q: 1, '8': .5, '16': .25, '32': .125 }
const SYSTEM_TOP = 94
const SYSTEM_GAP = 96
const GRAND_GAP = 142
const STAFF_SPACING = 9
const STAFF_LINE_COUNT = 5
const STAFF_HEIGHT = (STAFF_LINE_COUNT - 1) * STAFF_SPACING
const CLEF_BOTTOM_NOTE: Record<string, { index: number; octave: number }> = {
  treble: { index: 2, octave: 4 }, bass: { index: 6, octave: 2 },
  alto: { index: 5, octave: 3 }, tenor: { index: 1, octave: 3 },
}

function makeVexNote(item: NoteItem, clef: string) {
  const duration = item.duration + (item.dotted ? 'd' : '') + (item.rest ? 'r' : '')
  const note = new StaveNote({ keys: [item.rest ? 'b/4' : item.key], duration, clef })
  if (item.accidental && !item.rest) note.addModifier(new Accidental(item.accidental), 0)
  return note
}

function App() {
  const [layout, setLayout] = useState<Layout>('solo')
  const [duration, setDuration] = useState<Duration>('q')
  const [dotted, setDotted] = useState(false)
  const [rest, setRest] = useState(false)
  const [accidental, setAccidental] = useState<NoteItem['accidental']>('')
  const [clef, setClef] = useState<'treble' | 'bass' | 'alto' | 'tenor'>('treble')
  const [time, setTime] = useState('4/4')
  const [keySig, setKeySig] = useState('C')
  const [title, setTitle] = useState('Tác phẩm mới')
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('melo-composer-notes-v2') || '[]') as NoteItem[] } catch { return [] }
  })
  const [history, setHistory] = useState<NoteItem[][]>([])
  const [future, setFuture] = useState<NoteItem[][]>([])
  const [status, setStatus] = useState('Đã lưu trên thiết bị')
  const [dynamic, setDynamic] = useState('mf')
  const [tempo, setTempo] = useState(80)
  const scoreRef = useRef<HTMLDivElement>(null)

  const systems = layout === 'solo' ? 10 : layout === 'large' ? 6 : layout === 'grand' ? 5 : 5
  const stavesPerSystem = layout === 'grand' ? 2 : layout === 'orchestra' ? 4 : 1
  const paperHeight = Math.max(1123, 190 + systems * (layout === 'grand' ? GRAND_GAP : SYSTEM_GAP))

  useEffect(() => {
    localStorage.setItem('melo-composer-notes-v2', JSON.stringify(notes))
    setStatus('Đã lưu trên thiết bị')
  }, [notes])

  const grouped = useMemo(() => {
    const result = new Map<string, NoteItem[]>()
    notes.forEach(note => {
      const id = note.staff + ':' + note.measure
      result.set(id, [...(result.get(id) || []), note])
    })
    return result
  }, [notes])

  useEffect(() => {
    const host = scoreRef.current
    if (!host) return
    host.innerHTML = ''
    try {
      const width = Math.max(320, host.clientWidth || 760)
      const renderer = new Renderer(host, Renderer.Backends.SVG)
      renderer.resize(width, paperHeight)
      const context = renderer.getContext()
      const margin = 42
      const measureGap = 3
      const measureWidth = (width - margin * 2) / 4
      for (let system = 0; system < systems; system++) {
        const baseY = SYSTEM_TOP + system * (layout === 'grand' ? GRAND_GAP : SYSTEM_GAP)
        for (let part = 0; part < stavesPerSystem; part++) {
          const staffIndex = system * stavesPerSystem + part
          const y = baseY + part * 68
          const activeClef = layout === 'grand' ? (part === 0 ? 'treble' : 'bass') : (layout === 'orchestra' && part > 0 ? 'bass' : clef)
          for (let bar = 0; bar < 4; bar++) {
            const x = margin + bar * measureWidth
            const stave = new Stave(x, y, measureWidth - measureGap)
            if (bar === 0) {
              stave.addClef(activeClef)
              stave.addTimeSignature(time)
              if (keySig !== 'C') stave.addKeySignature(keySig)
            }
            stave.setContext(context).draw()
            const items = grouped.get(staffIndex + ':' + bar) || []
            if (!items.length) continue
            const tickables = items.map(item => {
              const note = makeVexNote(item, activeClef)
              if (item.dotted) note.addModifier // VexFlow duration carries the dot
              return note
            })
            const voice = new Voice({ numBeats: Number(time.split('/')[0]) || 4, beatValue: Number(time.split('/')[1]) || 4 })
            voice.setMode(Voice.Mode.SOFT)
            voice.addTickables(tickables)
            new Formatter().joinVoices([voice]).format([voice], measureWidth - 58)
            voice.draw(context, stave)
            const beams = Beam.generateBeams(tickables)
            beams.forEach(beam => beam.setContext(context).draw())
          }
        }
      }
      const svg = host.querySelector('svg')
      if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Bản nhạc được khắc ký âm bằng VexFlow') }
    } catch (error) {
      console.error('Music engraving error', error)
      setStatus('Có lỗi khi dàn trang ký âm')
    }
  }, [notes, layout, clef, time, keySig, systems, stavesPerSystem, paperHeight, grouped])

  function commit(next: NoteItem[]) {
    setHistory(prev => [...prev, notes])
    setFuture([])
    setNotes(next)
  }

  function addFromCanvas(event: React.MouseEvent<HTMLDivElement>) {
    const host = scoreRef.current
    const svg = host?.querySelector('svg')
    if (!host || !svg) return
    // Convert the pointer through the rendered SVG's actual viewBox. This keeps
    // note placement aligned after responsive scaling, zooming and scrolling.
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    const scaleX = viewBox.width / rect.width
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * (viewBox.height / rect.height)
    const systemGap = layout === 'grand' ? GRAND_GAP : SYSTEM_GAP
    const system = Math.round((y - SYSTEM_TOP) / systemGap)
    if (system < 0 || system >= systems) return
    const baseY = SYSTEM_TOP + system * systemGap
    const localY = y - baseY
    let part = 0
    let activeClef = clef
    if (layout === 'grand') {
      part = Math.abs(localY - 68) < Math.abs(localY) ? 1 : 0
      activeClef = part === 0 ? 'treble' : 'bass'
    } else if (layout === 'orchestra') {
      part = Math.max(0, Math.min(3, Math.round(localY / 68)))
      activeClef = part === 0 ? 'treble' : 'bass'
    }
    const staffIndex = system * stavesPerSystem + part
    const staffY = baseY + part * 68
    const bottom = CLEF_BOTTOM_NOTE[activeClef]
    // One diatonic step is exactly half the distance between staff lines.
    const step = Math.round((staffY + STAFF_HEIGHT - y) / (STAFF_SPACING / 2))
    const pitchIndex = bottom.index + step
    const name = DIATONIC[((pitchIndex % 7) + 7) % 7]
    const octave = bottom.octave + Math.floor(pitchIndex / 7)
    const key = name + '/' + octave
    const measureWidth = (viewBox.width - 84) / 4
    const measure = Math.max(0, Math.min(3, Math.floor((x - 42) / measureWidth)))
    const current = grouped.get(staffIndex + ':' + measure) || []
    const beatLimit = ((Number(time.split('/')[0]) || 4) * 4) / (Number(time.split('/')[1]) || 4)
    const used = current.reduce((sum, n) => sum + BEATS[n.duration] * (n.dotted ? 1.5 : 1), 0)
    if (used + BEATS[duration] * (dotted ? 1.5 : 1) > beatLimit + 0.001) {
      setStatus('Ô nhịp đã đủ trường độ. Hãy chọn ô nhịp kế tiếp.')
      return
    }
    const item: NoteItem = { id: Date.now() + Math.random(), staff: staffIndex, measure, key, duration, dotted, accidental, rest }
    commit([...notes, item])
    setStatus('Đã thêm ký hiệu vào ô nhịp')
  }

  function undo() {
    if (!history.length) return
    setFuture(prev => [notes, ...prev])
    setNotes(history[history.length - 1])
    setHistory(prev => prev.slice(0, -1))
  }
  function redo() {
    if (!future.length) return
    setHistory(prev => [...prev, notes])
    setNotes(future[0])
    setFuture(prev => prev.slice(1))
  }
  function clearScore() {
    if (window.confirm('Xóa toàn bộ ký hiệu trên bản nhạc?')) commit([])
  }

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">M</div><div><strong>MeloLegacy</strong><span>PHÒNG SOẠN NHẠC</span></div></div>
      <div className="top-actions"><span className="save-state"><i />{status}</span><button className="gold-button" onClick={() => window.print()}>Xuất / In</button></div>
    </header>
    <section className="workspace">
      <aside className="tool-panel">
        <div className="panel-heading">TÁC PHẨM</div>
        <label className="field-label" htmlFor="score-title">Tên tác phẩm</label>
        <input id="score-title" className="title-input" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="panel-heading">BỐ CỤC KHUÔNG NHẠC</div>
        <div className="layout-options">
          {(['solo', 'large', 'grand', 'orchestra'] as Layout[]).map((item, index) => <button key={item} className={layout === item ? 'layout-choice selected' : 'layout-choice'} onClick={() => setLayout(item)}><span className="layout-icon">{['≋', '☰', '𝄞\n𝄢', '♬'][index]}</span><span><b>{['Solo', 'Khuông lớn', 'Đại khuông', 'Dàn nhạc'][index]}</b><small>{['10 khuông · Một bè', '6 khuông · Cỡ lớn', 'Sol + Fa · Piano', '4 bè · Phác thảo tổng phổ'][index]}</small></span></button>)}
        </div>
        <div className="panel-heading">TRƯỜNG ĐỘ · KÝ HIỆU CHUẨN</div>
        <div className="duration-grid">
          {DURATIONS.map(item => <button key={item.value} className={duration === item.value ? 'duration selected' : 'duration'} onClick={() => { setDuration(item.value); setRest(false) }}><span>{item.glyph}</span><small>{item.label}</small></button>)}
        </div>
        <div className="note-options">
          <button className={dotted ? 'mini-tool selected' : 'mini-tool'} onClick={() => setDotted(!dotted)}>·　Chấm dôi</button>
          <button className={rest ? 'mini-tool selected' : 'mini-tool'} onClick={() => setRest(!rest)}>𝄽　Dấu nghỉ</button>
        </div>
        <div className="panel-heading">DẤU HÓA</div>
        <div className="accidental-grid">{([{ value: '', label: 'Không' }, { value: '#', label: 'Thăng ♯' }, { value: 'b', label: 'Giáng ♭' }, { value: 'n', label: 'Bình ♮' }] as const).map(item => <button key={item.value || 'none'} className={accidental === item.value ? 'mini-tool selected' : 'mini-tool'} onClick={() => setAccidental(item.value)}>{item.label}</button>)}</div>
        <div className="panel-heading">KHÓA · NHỊP · HÓA BIỂU</div>
        <label className="field-label" htmlFor="clef">Khóa nhạc</label><select id="clef" className="title-input" value={clef} onChange={e => setClef(e.target.value as typeof clef)}><option value="treble">Khóa Sol</option><option value="bass">Khóa Fa</option><option value="alto">Khóa Đô (Alto)</option><option value="tenor">Khóa Đô (Tenor)</option></select>
        <div className="setting-row"><label className="field-label" htmlFor="time">Nhịp</label><select id="time" value={time} onChange={e => setTime(e.target.value)}><option>4/4</option><option>3/4</option><option>2/4</option><option>6/8</option><option>9/8</option><option>12/8</option></select></div>
        <div className="setting-row"><label className="field-label" htmlFor="key">Hóa biểu</label><select id="key" value={keySig} onChange={e => setKeySig(e.target.value)}>{['C','G','D','A','E','B','F','Bb','Eb','Ab','Db','Gb'].map(k => <option key={k}>{k}</option>)}</select></div>
        <div className="panel-heading">ÂM NHẠC · PHÁT LẠI</div>
        <div className="setting-row"><label className="field-label" htmlFor="tempo">Tempo ♩</label><input id="tempo" type="number" min="20" max="300" value={tempo} onChange={e => setTempo(Number(e.target.value))}/></div>
        <div className="setting-row"><label className="field-label" htmlFor="dynamic">Cường độ</label><select id="dynamic" value={dynamic} onChange={e => setDynamic(e.target.value)}>{['pp','p','mp','mf','f','ff'].map(v => <option key={v}>{v}</option>)}</select></div>
        <div className="action-stack"><button onClick={undo} disabled={!history.length}>↶　Hoàn tác</button><button onClick={redo} disabled={!future.length}>↷　Làm lại</button><button onClick={clearScore}>⌫　Xóa bản nhạc</button></div>
        <p className="hint">Chọn trường độ và chạm đúng vị trí trên khuông để ghi nốt. Các nốt được khắc bằng bộ máy ký âm VexFlow.</p>
        <div className="panel-foot">Bản nhạc lưu cục bộ trên thiết bị này.</div>
      </aside>
      <section className="score-area">
        <div className="score-toolbar"><div><span className="crumb">MeloLegacy</span><span className="slash">/</span><b>Phòng Soạn Nhạc</b></div><div className="zoom-label">A4 · Dọc · {systems} hệ thống</div></div>
        <div className="paper-wrap"><div className="paper" style={{ minHeight: paperHeight }}>
          <div className="paper-head"><div className="paper-kicker">MELOLEGACY · MUSIC COMPOSITION</div><h1>{title || 'Tác phẩm mới'}</h1><div className="paper-meta"><span>Tác giả: __________________</span><span>♩ = {tempo}　{dynamic}</span></div></div>
          <div className="notation-host" ref={scoreRef} onClick={addFromCanvas} style={{ minHeight: paperHeight - 180 }} />
          <div className="paper-bottom"><span>MeloLegacy · Di sản âm nhạc</span><span>Trang 1</span></div>
        </div></div>
      </section>
    </section>
    <footer className="mobile-note">Chọn trường độ rồi chạm vào khuông nhạc để ghi nốt. Xoay iPad ngang để có vùng làm việc rộng hơn.</footer>
  </main>
}
export default App
