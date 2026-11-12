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
