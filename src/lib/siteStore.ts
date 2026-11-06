import type { Availability } from '../content'
import { loadSharedJson, saveSharedJson } from './remoteStore'

export type SiteSettings = {
  availability: Availability
}

const STORAGE_KEY = 'kxstxn.site'

const seedSettings: SiteSettings = {
  availability: 'open',
}

type Listener = () => void

let settings: SiteSettings = { ...seedSettings }
let ready = false
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
  setLocal(next)
  await saveSharedJson('site.json', next, 'chore: update site settings')
}

function isAvailability(value: unknown): value is Availability {
  return value === 'open' || value === 'limited' || value === 'closed'
}

function normalize(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== 'object') return { ...seedSettings }
  const row = raw as Record<string, unknown>
  return {
    availability: isAvailability(row.availability)
      ? row.availability
      : seedSettings.availability,
  }
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
  try {
    const remote = await loadSharedJson('site.json')
    if (remote != null) {
      settings = normalize(remote)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      ready = true
      emit()
      return
    }
  } catch {
    // fall through
  }

  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      settings = normalize(JSON.parse(cached))
      ready = true
      emit()
      return
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  settings = { ...seedSettings }
  ready = true
  emit()
}

export async function setAvailability(availability: Availability) {
  await persist({ ...settings, availability })
}
