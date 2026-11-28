import { useEffect, useRef, useState } from 'react'

type Props = { onUploadPDF: () => void; onUndo?: () => void; onRedo?: () => void; onPlay?: () => void; onSelectGlyph?: (label: string) => void }

const glyph = (hex: string) => String.fromCodePoint(Number.parseInt(hex.replace('U+', ''), 16))
const groups = [
  { id: 'notes', title: 'Nốt nhạc', items: [
    ['Nốt tròn','U+E1D2'],['Nốt trắng','U+E1D3'],['Nốt đen','U+E1D5'],['Móc đơn','U+E1D7'],
    ['Móc kép','U+E1D9'],['Móc ba','U+E1DB'],['Móc bốn','U+E1DD'],['Móc năm','U+E1DF'],
  ]},
  { id: 'rests', title: 'Dấu lặng', items: [
    ['Lặng tròn','U+E4E3'],['Lặng trắng','U+E4E4'],['Lặng đen','U+E4E5'],['Lặng móc đơn','U+E4E6'],
    ['Lặng móc kép','U+E4E7'],['Lặng móc ba','U+E4E8'],['Lặng móc bốn','U+E4E9'],['Lặng móc năm','U+E4EA'],
  ]},
  { id: 'accidentals', title: 'Dấu hóa', items: [
    ['Thăng','U+E262'],['Giáng','U+E260'],['Bình','U+E261'],['Thăng kép','U+E263'],['Giáng kép','U+E264'],
  ]},
  { id: 'clefs', title: 'Khóa nhạc', items: [
    ['Khóa Sol','U+E050'],['Khóa Fa','U+E062'],['Khóa Đô','U+E05C'],['Khóa Sol 8va','U+E053'],['Khóa Fa 8vb','U+E064'],
  ]},
  { id: 'articulation', title: 'Dấu biểu cảm', items: [
    ['Chấm dôi','U+E1E7'],['Fermata','U+E4C0'],['Staccato','U+E4A2'],['Tenuto','U+E4A4'],['Accent','U+E4A0'],['Marcato','U+E4AC'],
  ]},
  { id: 'dynamics', title: 'Cường độ', items: [
    ['pp','U+E52B'],['mp','U+E52C'],['mf','U+E52D'],['ff','U+E52F'],['fp','U+E534'],['sfz','U+E536'],
  ]},
]
const keys = [
  {label:'C4',midi:60},{label:'C♯4',midi:61,black:true},{label:'D4',midi:62},{label:'D♯4',midi:63,black:true},
  {label:'E4',midi:64},{label:'F4',midi:65},{label:'F♯4',midi:66,black:true},{label:'G4',midi:67},
  {label:'G♯4',midi:68,black:true},{label:'A4',midi:69},{label:'A♯4',midi:70,black:true},{label:'B4',midi:71},{label:'C5',midi:72},
]
function Icon({name}:{name:string}) {
  const paths:Record<string,string> = {
    pen:'M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11zM14.5 6.5l3 3',
    note:'M9 18V5l11-2v13M9 18a3 2 0 1 1-3-2 3 2 0 0 1 3 2zm11-2a3 2 0 1 1-3-2 3 2 0 0 1 3 2z',
    undo:'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2',
    redo:'m15 14 5-5-5-5m5 5H10a6 6 0 0 0 0 12h2',
    play:'m7 4 13 8-13 8z',
    piano:'M3 5h18v14H3zM7 5v9m5-9v9m5-9v9',
    metronome:'M4 21h16L17 4H7zM12 5v12m0-12 4-3m-4 3-4 6',
    beat:'M3 12h3l2-6 4 12 3-9 2 3h4',
    pdf:'M5 3h10l4 4v14H5zM14 3v5h5M8 13h8M8 17h6',
    close:'M5 5l14 14M19 5 5 19'
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.note}/></svg>
}
function useAudio() {
  const ref = useRef<AudioContext | null>(null)
  function context() {
    if (!ref.current || ref.current.state === 'closed') ref.current = new AudioContext()
    if (ref.current.state === 'suspended') void ref.current.resume()
    return ref.current
  }
  function tone(frequency:number, duration=0.08, type:OscillatorType='sine', volume=0.18) {
    const ctx=context(), oscillator=ctx.createOscillator(), gain=ctx.createGain()
    oscillator.type=type; oscillator.frequency.setValueAtTime(frequency,ctx.currentTime)
    gain.gain.setValueAtTime(0.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+duration)
    oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime+duration+0.02)
  }
  return { tone, close: async()=>{if(ref.current && ref.current.state!=='closed') await ref.current.close();ref.current=null} }
}

export function ComposerToolBubbles({onUploadPDF,onUndo,onRedo,onPlay,onSelectGlyph}:Props) {
  const [panel,setPanel]=useState<'symbols'|'piano'|'metronome'|'beat'|null>(null)
  const [group,setGroup]=useState('notes')
  const [selectedGlyph,setSelectedGlyph]=useState('')
  const [bpm,setBpm]=useState(96)
  const [meter,setMeter]=useState('4/4')
  const [running,setRunning]=useState(false)
  const [beat,setBeat]=useState(0)
  const audio=useAudio()
  const timer=useRef<number | null>(null)
  const beatRef=useRef(0)
  const beatModeRef=useRef(false)
  const meterCount=meter==='6/8'?6:meter==='3/4'?3:4
  const stop=()=>{if(timer.current!==null)window.clearInterval(timer.current);timer.current=null;setRunning(false);setBeat(0);beatRef.current=0}
  const tick=(isBeat:boolean)=>{
    const current=beatRef.current % meterCount
    setBeat(current+1)
    if(isBeat) audio.tone(current===0?1320:880,current===0?0.11:0.065,'sine',current===0?0.24:0.14)
    else if(current===0) audio.tone(110,0.12,'sine',0.22)
    else if(current===2) audio.tone(170,0.07,'triangle',0.10)
    else audio.tone(2200,0.035,'square',0.035)
    beatRef.current+=1
  }
  const start=(isBeat:boolean)=>{
    stop()
    beatModeRef.current=isBeat
    tick(isBeat)
    timer.current=window.setInterval(()=>tick(isBeat),60000/bpm)
    setRunning(true)
  }
  useEffect(()=>()=>{if(timer.current!==null)window.clearInterval(timer.current);void audio.close()},[])
  useEffect(()=>{if(!running)return;const wasBeat=beatModeRef.current;stop();start(wasBeat);return()=>{if(timer.current!==null)window.clearInterval(timer.current)}},[bpm,meter])
  const selected=groups.find(item=>item.id===group) || groups[0]
  const togglePanel=(next:'symbols'|'piano'|'metronome'|'beat')=>{stop();setPanel(panel===next?null:next)}
  return <div className="composer-dock">
    {panel && <section className={'composer-bubble composer-bubble-'+panel} aria-label="Công cụ Composer">
      <header className="bubble-heading"><b>{panel==='symbols'?'Thư viện ký hiệu chuẩn':panel==='piano'?'Piano':panel==='metronome'?'Máy nhịp':'Beat'}</b><button onClick={()=>{stop();setPanel(null)}} aria-label="Đóng"><Icon name="close"/></button></header>
      {panel==='symbols' && <div className="symbol-browser">
        <nav className="symbol-groups">{groups.map(item=><button key={item.id} className={group===item.id?'active':''} onClick={()=>setGroup(item.id)}>{item.title}</button>)}</nav>
        <div className="symbol-grid">{selected.items.map(([label,code])=><button key={code} className={selectedGlyph===label?'selected':''} title={label} aria-label={label} aria-pressed={selectedGlyph===label} onClick={()=>{setSelectedGlyph(label);onSelectGlyph?.(label)}}><span className="smufl-glyph">{glyph(code)}</span><small>{label}</small></button>)}</div>
        <p className="bubble-note">Glyph lấy theo mã SMuFL từ registry MeloLegacy và hiển thị bằng font Bravura đã đóng gói.</p>
      </div>}
      {panel==='piano' && <><div className="piano-bubble-keys">{keys.map(key=><button key={key.midi} className={key.black?'black':''} onPointerDown={()=>audio.tone(440*Math.pow(2,(key.midi-69)/12),0.45,'sine',0.2)} title={key.label} aria-label={'Phím '+key.label}><span>{key.black?'':key.label}</span></button>)}</div><p className="bubble-note">Bàn phím thử âm · quãng 4</p></>}
      {panel==='metronome' && <div className="rhythm-controls"><div className="tempo-readout"><strong>{bpm}</strong><span>BPM</span></div><input aria-label="Tốc độ BPM" type="range" min="40" max="240" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/><div className="rhythm-row"><label>Nhịp <select value={meter} onChange={e=>setMeter(e.target.value)}><option>2/4</option><option>3/4</option><option>4/4</option><option>6/8</option></select></label><button className="rhythm-primary" onClick={()=>running?stop():start(true)}>{running?'Dừng':'Bắt đầu'}</button></div><div className="beat-dots">{Array.from({length:meterCount},(_,i)=><i key={i} className={running&&beat===i+1?'active':''}/>)}</div></div>}
      {panel==='beat' && <div className="rhythm-controls"><div className="tempo-readout"><strong>{bpm}</strong><span>BPM · BEAT</span></div><input aria-label="Tốc độ Beat" type="range" min="40" max="240" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/><div className="rhythm-row"><label>Nhịp <select value={meter} onChange={e=>setMeter(e.target.value)}><option>2/4</option><option>3/4</option><option>4/4</option><option>6/8</option></select></label><button className="rhythm-primary" onClick={()=>running?stop():start(false)}>{running?'Dừng Beat':'Chạy Beat'}</button></div><p className="bubble-note">Beat thử nghiệm tạo nhịp bass/snare/hi-hat tổng hợp bằng Web Audio; chưa phải thư viện beat thu âm.</p></div>}
    </section>}
    <nav className="composer-toolbar" aria-label="Thanh công cụ sáng tác">
      <button className="dock-tool active" title="Bút" aria-label="Bút"><Icon name="pen"/></button>
      <button className={'dock-tool '+(panel==='symbols'?'active':'')} title="Nhóm ký hiệu" aria-label="Nhóm ký hiệu" onClick={()=>togglePanel('symbols')}><Icon name="note"/></button>
      <button className="dock-tool" title="Hoàn tác" aria-label="Hoàn tác" onClick={onUndo}><Icon name="undo"/></button>
      <button className="dock-tool" title="Làm lại" aria-label="Làm lại" onClick={onRedo}><Icon name="redo"/></button>
      <button className="dock-tool" title="Chạy/Dừng" aria-label="Chạy/Dừng" onClick={onPlay}><Icon name="play"/></button>
      <button className={'dock-tool '+(panel==='piano'?'active':'')} title="Piano" aria-label="Piano" onClick={()=>togglePanel('piano')}><Icon name="piano"/></button>
      <button className={'dock-tool '+(panel==='metronome'?'active':'')} title="Máy nhịp" aria-label="Máy nhịp" onClick={()=>togglePanel('metronome')}><Icon name="metronome"/></button>
      <button className={'dock-tool '+(panel==='beat'?'active':'')} title="Beat" aria-label="Beat" onClick={()=>togglePanel('beat')}><Icon name="beat"/></button>
      <button className="dock-tool" title="Nhận dạng PDF" aria-label="Nhận dạng PDF" onClick={onUploadPDF}><Icon name="pdf"/></button>
    </nav>
  </div>
}
