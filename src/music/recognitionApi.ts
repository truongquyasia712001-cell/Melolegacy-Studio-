export interface RecognitionResponse {
  engine: string
  musicxml?: string
  midi_base64?: string | null
  warnings?: string[]
}

const apiBase = (import.meta.env.VITE_MUSIC_RECOGNITION_API || '').replace(/\/$/, '')

async function postFile(path: string, file: File): Promise<RecognitionResponse> {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch(apiBase + path, { method: 'POST', body })
  const payload = await response.json().catch(() => ({})) as { detail?: string } & RecognitionResponse
  if (!response.ok) throw new Error(payload.detail || `Bộ nhận dạng trả về lỗi (${response.status}).`)
  return payload
}

export function recognizeScoreFile(file: File) {
  return postFile('/api/recognize/omr', file)
}

export function recognizeAudioFile(file: File) {
  return postFile('/api/recognize/audio', file)
}

export function decodeMidiBase64(value: string): ArrayBuffer {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes.buffer
}


/**
 * PDF -> MusicXML through the authenticated same-origin MeloBot gateway.
 * Trusted ingress injects X-Melo-User-Id after authentication; the browser
 * must never provide that identity header.
 */
export async function recognizePdfWithMelobot(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/melobot/composer/omr', {
    method: 'POST',
    body,
    credentials: 'same-origin',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { detail?: string }
    throw new Error(payload.detail || `MeloBot không thể xử lý PDF (HTTP ${response.status}).`)
  }
  if (response.headers.get('X-OMR-Review-Required') !== 'true') {
    throw new Error('Kết quả OMR thiếu cờ yêu cầu kiểm tra.')
  }
  const musicxml = await response.text()
  if (!musicxml.includes('<score-partwise') && !musicxml.includes('<score-timewise')) {
    throw new Error('MeloBot trả về dữ liệu không phải MusicXML hợp lệ.')
  }
  return musicxml
}
