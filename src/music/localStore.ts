/**
 * Melo Legacy — local-first music library.
 *
 * Stores original files and editable score documents on the current device.
 * IndexedDB is the baseline because it stores structured records and Blobs
 * across supported PWA browsers. Cloud sync is deliberately kept separate.
 */
export type LocalAssetKind = 'score' | 'pdf' | 'image' | 'audio' | 'midi' | 'musicxml' | 'other'
export type LocalAssetStatus = 'local' | 'queued' | 'synced' | 'conflict'

export interface LocalMusicAsset {
  id: string
  ownerId: string
  title: string
  kind: LocalAssetKind
  mimeType: string
  size: number
  createdAt: number
  updatedAt: number
  status: LocalAssetStatus
  blob: Blob
  metadata?: Record<string, string | number | boolean | null>
}

export interface LocalScoreDocument {
  id: string
  ownerId: string
  title: string
  musicxml: string
  createdAt: number
  updatedAt: number
  status: LocalAssetStatus
  sourceAssetId?: string
}

export interface LocalStorageUsage {
  usage: number
  quota: number
  available: number
  percentUsed: number
}

const DB_NAME = 'melolegacy-local-library'
const DB_VERSION = 1
const ASSETS = 'assets'
const SCORES = 'scores'

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Thiết bị hoặc trình duyệt này chưa hỗ trợ lưu trữ cục bộ IndexedDB.'))
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(ASSETS)) {
        const store = db.createObjectStore(ASSETS, { keyPath: 'id' })
        store.createIndex('ownerId', 'ownerId', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(SCORES)) {
        const store = db.createObjectStore(SCORES, { keyPath: 'id' })
        store.createIndex('ownerId', 'ownerId', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Không thể mở kho dữ liệu trên thiết bị.'))
    request.onblocked = () => reject(new Error('Kho dữ liệu đang được mở ở một tab khác. Hãy đóng tab cũ rồi thử lại.'))
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Thao tác lưu trữ thất bại.'))
  })
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase()
  try {
    const transaction = db.transaction(storeName, mode)
    const result = await requestResult(operation(transaction.objectStore(storeName)))
    if (mode === 'readwrite') {
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onabort = () => reject(transaction.error ?? new Error('Không thể hoàn tất giao dịch lưu trữ.'))
        transaction.onerror = () => reject(transaction.error ?? new Error('Lỗi giao dịch lưu trữ.'))
      })
    }
    return result
  } finally {
    db.close()
  }
}

function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `melo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function saveLocalAsset(
  input: Omit<LocalMusicAsset, 'id' | 'size' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string },
): Promise<LocalMusicAsset> {
  const now = Date.now()
  const asset: LocalMusicAsset = {
    ...input,
    id: input.id ?? makeId(),
    size: input.blob.size,
    createdAt: now,
    updatedAt: now,
    status: 'local',
  }
  await withStore(ASSETS, 'readwrite', store => store.put(asset))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('melo-library-updated'))
  return asset
}

export async function getLocalAsset(id: string, ownerId: string): Promise<LocalMusicAsset | undefined> {
  const asset = await withStore(ASSETS, 'readonly', store => store.get(id)) as LocalMusicAsset | undefined
  return asset?.ownerId === ownerId ? asset : undefined
}

export async function listLocalAssets(ownerId: string): Promise<LocalMusicAsset[]> {
  const rows = await withStore(ASSETS, 'readonly', store => store.index('ownerId').getAll(ownerId)) as LocalMusicAsset[]
  return rows.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteLocalAsset(id: string, ownerId: string): Promise<boolean> {
  const existing = await getLocalAsset(id, ownerId)
  if (!existing) return false
  await withStore(ASSETS, 'readwrite', store => store.delete(id))
  return true
}

export async function saveLocalScore(
  input: Omit<LocalScoreDocument, 'createdAt' | 'updatedAt' | 'status'> & { createdAt?: number },
): Promise<LocalScoreDocument> {
  const now = Date.now()
  const score: LocalScoreDocument = {
    ...input,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    status: 'local',
  }
  await withStore(SCORES, 'readwrite', store => store.put(score))
  return score
}

export async function getLocalScore(id: string, ownerId: string): Promise<LocalScoreDocument | undefined> {
  const score = await withStore(SCORES, 'readonly', store => store.get(id)) as LocalScoreDocument | undefined
  return score?.ownerId === ownerId ? score : undefined
}

export async function listLocalScores(ownerId: string): Promise<LocalScoreDocument[]> {
  const rows = await withStore(SCORES, 'readonly', store => store.index('ownerId').getAll(ownerId)) as LocalScoreDocument[]
  return rows.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteLocalScore(id: string, ownerId: string): Promise<boolean> {
  const existing = await getLocalScore(id, ownerId)
  if (!existing) return false
  await withStore(SCORES, 'readwrite', store => store.delete(id))
  return true
}

export async function getLocalStorageUsage(): Promise<LocalStorageUsage | null> {
  if (!navigator.storage?.estimate) return null
  const estimate = await navigator.storage.estimate()
  const usage = estimate.usage ?? 0
  const quota = estimate.quota ?? 0
  return {
    usage,
    quota,
    available: Math.max(0, quota - usage),
    percentUsed: quota > 0 ? Math.round((usage / quota) * 1000) / 10 : 0,
  }
}

/** Ask the browser to protect this origin's data from routine storage eviction. */
export async function requestPersistentLocalStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return navigator.storage.persist()
}

export function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`
}
