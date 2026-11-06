import type { Availability } from '../content'
import { loadSharedJson, saveSharedJson } from './remoteStore'

export type SiteSettings = {
  availability: Availability
  updatedAt: number
}

const STORAGE_KEY = 'kxstxn.site'

const seedSettings: SiteSettings = {
  availability: 'open',
  updatedAt: 0,
}

type Listener = () => void

let settings: SiteSettings = { ...seedSettings }
let ready = false
let loadGeneration = 0
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setLocal(next: SiteSettings) {
  settings = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

async function persist(next: SiteSettings) {
  // Invalidate in-flight init so a late remote response cannot clobber this save.
  loadGeneration += 1
  setLocal(next)
  await saveSharedJson('site.json', next, 'chore: update site settings')
}

function isAvailability(value: unknown): value is Availability {
  return value === 'open' || value === 'limited' || value === 'closed'
}

function normalize(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== 'object') return { ...seedSettings }
  const row = raw as Record<string, unknown>
  const updatedAt =
    typeof row.updatedAt === 'number' && Number.isFinite(row.updatedAt)
      ? row.updatedAt
      : 0

  return {
    availability: isAvailability(row.availability)
      ? row.availability
      : seedSettings.availability,
    updatedAt,
  }
}

function readCached(): SiteSettings | null {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (!cached) return null
  try {
    return normalize(JSON.parse(cached))
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function pickNewer(a: SiteSettings, b: SiteSettings) {
  return a.updatedAt >= b.updatedAt ? a : b
}

export function subscribeSite(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSiteSnapshot() {
  return settings
}

export function isSiteReady() {
  return ready
}

export async function initSite() {
  const generation = ++loadGeneration

  const cached = readCached()
  if (cached) {
    settings = cached
    emit()
  }

  try {
    const remote = await loadSharedJson('site.json')
    if (generation !== loadGeneration) return

    if (remote != null) {
      const normalized = normalize(remote)
      const next = cached ? pickNewer(cached, normalized) : normalized
      settings = next
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  } catch {
    // keep cached / seed
  }

  if (generation !== loadGeneration) return
  ready = true
  emit()
}

export async function setAvailability(availability: Availability) {
  await persist({
    availability,
    updatedAt: Date.now(),
  })
}
