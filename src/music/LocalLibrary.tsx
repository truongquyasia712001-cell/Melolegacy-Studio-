import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteLocalAsset,
  formatStorageBytes,
  getLocalStorageUsage,
  listLocalAssets,
  listLocalScores,
  requestPersistentLocalStorage,
  saveLocalAsset,
  type LocalMusicAsset,
  type LocalAssetKind,
  type LocalStorageUsage,
  type LocalScoreDocument,
} from './localStore'

const OWNER_ID = 'device-local'
const ACCEPTED = '.musicxml,.xml,.mid,.midi,.pdf,.png,.jpg,.jpeg,.webp,.wav,.mp3,.m4a,.flac'

function kindFor(file: File): LocalAssetKind {
  const name = file.name.toLowerCase()
  if (name.endsWith('.musicxml') || name.endsWith('.xml')) return 'musicxml'
  if (name.endsWith('.mid') || name.endsWith('.midi')) return 'midi'
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'other'
}

function saveBlobToDevice(asset: LocalMusicAsset) {
  const url = URL.createObjectURL(asset.blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = asset.title
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}

export function LocalLibrary({ onOpenScore }: { onOpenScore: (score: LocalScoreDocument) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [assets, setAssets] = useState<LocalMusicAsset[]>([])
  const [scores, setScores] = useState<LocalScoreDocument[]>([])
  const [usage, setUsage] = useState<LocalStorageUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [items, savedScores, estimate] = await Promise.all([listLocalAssets(OWNER_ID), listLocalScores(OWNER_ID), getLocalStorageUsage()])
      setAssets(items)
      setScores(savedScores)
      setUsage(estimate)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đọc thư viện trên thiết bị.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener('melo-library-updated', refresh)
    return () => window.removeEventListener('melo-library-updated', refresh)
  }, [refresh])

  async function importFiles(files: FileList | null) {
    if (!files?.length) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      let saved = 0
      for (const file of Array.from(files)) {
        await saveLocalAsset({
          ownerId: OWNER_ID,
          title: file.name,
          kind: kindFor(file),
          mimeType: file.type || 'application/octet-stream',
          blob: file,
        })
        saved += 1
      }
      setMessage(`Đã lưu ${saved} tệp trực tiếp vào kho nhạc trên thiết bị này.`)
      await refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể lưu tệp. Hãy kiểm tra dung lượng trống của trình duyệt.')
    } finally {
      setSaving(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removeAsset(asset: LocalMusicAsset) {
    if (!window.confirm(`Xóa “${asset.title}” khỏi thiết bị này? Bản gốc sẽ không thể khôi phục từ kho cục bộ.`)) return
    try {
      await deleteLocalAsset(asset.id, OWNER_ID)
      setMessage(`Đã xóa ${asset.title} khỏi kho trên thiết bị.`)
      await refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể xóa tệp.')
    }
  }

  async function protectStorage() {
    try {
      const granted = await requestPersistentLocalStorage()
      setMessage(granted
        ? 'Trình duyệt đã cấp chế độ lưu trữ bền vững cho dữ liệu của Melo Legacy trên thiết bị này.'
        : 'Trình duyệt không cấp hoặc không hỗ trợ lưu trữ bền vững. Hãy xuất bản sao lưu định kỳ.')
    } catch {
      setError('Không thể yêu cầu lưu trữ bền vững trên trình duyệt này.')
    }
  }

  return <section className="section local-library" aria-labelledby="local-library-title">
    <div className="section-head">
      <div><span>00</span><h2 id="local-library-title">Thư viện nhạc trên thiết bị</h2></div>
      <small>LOCAL MUSIC LIBRARY</small>
    </div>
    <div className="library-intro">
      <div><b>Lưu bản nhạc ngay trên iPad, điện thoại hoặc máy tính</b><p>Tệp được giữ trong bộ nhớ của trình duyệt trên thiết bị hiện tại. Có thể mở lại khi ngoại tuyến sau khi ứng dụng đã tải đầy đủ.</p></div>
      <button className="library-add" type="button" onClick={() => inputRef.current?.click()} disabled={saving}>{saving ? 'Đang lưu…' : '+ Thêm tệp vào thư viện'}</button>
      <input ref={inputRef} hidden type="file" multiple accept={ACCEPTED} onChange={event => void importFiles(event.currentTarget.files)} />
    </div>
    <div className="library-storage">
      <div><span>DUNG LƯỢNG ĐANG DÙNG</span><b>{usage ? formatStorageBytes(usage.usage) : 'Chưa có dữ liệu'}</b></div>
      <div><span>HẠN MỨC TRÌNH DUYỆT ƯỚC TÍNH</span><b>{usage?.quota ? formatStorageBytes(usage.quota) : 'Không có thông tin'}</b></div>
      <button type="button" onClick={() => void protectStorage()}>Ưu tiên giữ dữ liệu</button>
    </div>
    {message && <p className="library-message" role="status">{message}</p>}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="library-list">
      {loading ? <p className="library-empty">Đang mở thư viện…</p> : assets.length === 0 ? <div className="library-empty"><b>Thư viện chưa có bản nhạc</b><span>Thêm PDF, ảnh, MusicXML, MIDI hoặc bản ghi âm để lưu bản gốc trên thiết bị.</span></div> : assets.map(asset => <article className="library-item" key={asset.id}>
        <div className="library-file-icon">{asset.kind === 'audio' ? '♫' : asset.kind === 'pdf' ? 'PDF' : asset.kind === 'image' ? '▧' : asset.kind === 'midi' ? 'MIDI' : '♪'}</div>
        <div className="library-file-info"><b>{asset.title}</b><span>{asset.kind.toUpperCase()} · {formatStorageBytes(asset.size)} · Lưu {dateLabel(asset.createdAt)}</span></div>
        <button type="button" onClick={() => saveBlobToDevice(asset)} aria-label={`Tải ${asset.title} xuống`}>Tải xuống</button>
        <button type="button" className="library-delete" onClick={() => void removeAsset(asset)} aria-label={`Xóa ${asset.title}`}>Xóa</button>
      </article>)}
    </div>
    <div className="saved-scores">
      <div className="saved-scores-heading"><b>Bản nhạc đã chuẩn hóa</b><span>{scores.length} tài liệu MusicXML</span></div>
      {scores.length === 0 ? <p className="saved-scores-empty">Chưa có tài liệu MusicXML được lưu để mở lại trong Studio.</p> : scores.map(score => <article className="saved-score-item" key={score.id}>
        <div><b>{score.title}</b><span>Cập nhật {dateLabel(score.updatedAt)}</span></div>
        <button type="button" onClick={() => onOpenScore(score)}>Mở bản nhạc</button>
        <button type="button" onClick={() => {
          const url = URL.createObjectURL(new Blob([score.musicxml], { type: 'application/vnd.recordare.musicxml+xml' }))
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = score.title.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-') + '.musicxml'
          anchor.click()
          window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        }}>Xuất XML</button>
      </article>)}
    </div>
    <p className="library-note">Lưu ý: đây là kho cục bộ của trình duyệt trên thiết bị này, chưa phải tài khoản đám mây hay cơ chế phân quyền giáo viên/học sinh. Dữ liệu trình duyệt vẫn có thể bị mất nếu người dùng xóa dữ liệu website hoặc hệ điều hành thu hồi bộ nhớ. Hãy giữ bản sao lưu của các tệp quan trọng.</p>
  </section>
}
