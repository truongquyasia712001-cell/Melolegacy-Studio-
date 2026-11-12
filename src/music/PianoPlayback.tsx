import { useEffect, useRef, useState } from 'react'
import type { Score } from './model'
import { MeloPianoEngine } from './PianoEngine'

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0')
}

export function PianoPlayback({ score }: { score: Score }) {
  const engineRef = useRef<MeloPianoEngine | null>(null)
  const [bpm, setBpm] = useState(score.tempo || 90)
  const [volume, setVolume] = useState(0.8)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [message, setMessage] = useState('Âm sắc piano tổng hợp thử nghiệm · chưa dùng mẫu thu piano acoustic')

  useEffect(() => {
    const engine = new MeloPianoEngine()
    engineRef.current = engine
    return () => {
      void engine.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!playing || paused) return
    let timer = 0
    const tick = () => {
      const engine = engineRef.current
      if (!engine) return
      const current = engine.position
      setPosition(current)
      if (current >= engine.totalDuration && engine.totalDuration > 0) {
        setPlaying(false)
        setPaused(false)
        setPosition(engine.totalDuration)
        return
      }
      timer = window.setTimeout(tick, 80)
    }
    timer = window.setTimeout(tick, 80)
    return () => window.clearTimeout(timer)
  }, [playing, paused])

  async function start() {
    if (!engineRef.current) return
    try {
      await engineRef.current.play(score, bpm, volume)
      setDuration(engineRef.current.totalDuration)
      setPosition(0)
      setPlaying(true)
      setPaused(false)
      setMessage('Đang phát bằng MELO Piano Engine')
    } catch {
      setMessage('Trình duyệt chưa cho phép phát âm thanh. Hãy chạm Phát lần nữa.')
    }
  }

  async function togglePause() {
    if (!engineRef.current) return
    if (paused) {
      await engineRef.current.resume()
      setPaused(false)
    } else {
      await engineRef.current.pause()
      setPaused(true)
    }
  }

  function stop() {
    engineRef.current?.stop()
    setPlaying(false)
    setPaused(false)
    setPosition(0)
    setDuration(0)
    setMessage('Đã dừng phát')
  }

  return <section className="piano-playback">
    <div className="piano-playback-heading">
      <div><span className="piano-kicker">MELO AUDIO ENGINE</span><h3>Trình diễn piano</h3></div>
      <span className="piano-engine-status"><i /> ENGINE THỬ NGHIỆM</span>
    </div>
    <div className="piano-transport">
      <button className="piano-primary" onClick={() => void start()} disabled={playing}>▶ Phát bản nhạc</button>
      <button onClick={() => void togglePause()} disabled={!playing}>{paused ? 'Tiếp tục' : 'Tạm dừng'}</button>
      <button onClick={stop} disabled={!playing}>Dừng</button>
      <div className="piano-time">{formatTime(position)} <span>/</span> {formatTime(duration)}</div>
    </div>
    <div className="piano-controls">
      <label>Nhịp độ <b>{bpm} BPM</b><input type="range" min="40" max="200" step="1" value={bpm} onChange={event => setBpm(Number(event.target.value))} disabled={playing} /></label>
      <label>Âm lượng <b>{Math.round(volume * 100)}%</b><input type="range" min="0" max="1" step="0.01" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
    </div>
    <div className="piano-progress"><span style={{ width: duration ? Math.min(100, position / duration * 100) + '%' : '0%' }} /></div>
    <p className="piano-engine-note">{message}</p>
  </section>
}
