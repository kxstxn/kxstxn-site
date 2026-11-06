export type Service = {
  id: string
  title: string
  summary: string
  details: string
  priceFrom: number
  priceUnit: string
}

const STORAGE_KEY = 'kxstxn.services'

const seedServices: Service[] = [
  {
    id: '01',
    title: 'development',
    summary: 'apps · bots · tools',
    details:
      'Small apps, bots, and utilities shaped around your brief. Simple scope, quick feedback loops, no overbuild.',
    priceFrom: 50,
    priceUnit: 'project',
  },
  {
    id: '02',
    title: 'automation',
    summary: 'scripts · pipelines',
    details:
      'Scripts and light pipelines that cut repetitive work — reports, syncs, hooks between the tools you already use.',
    priceFrom: 25,
    priceUnit: 'project',
  },
  {
    id: '03',
    title: 'web',
    summary: 'sites · api · panels',
    details:
      'Landing pages, compact dashboards, and small APIs. Clean UI, workable backend, shipped without the enterprise tax.',
    priceFrom: 70,
    priceUnit: 'project',
  },
  {
    id: '04',
    title: 'consulting',
    summary: 'architecture · review',
    details:
      'Code review, architecture chat, and help unblocking sticky problems. Async or a short call — your call.',
    priceFrom: 12,
    priceUnit: 'hour',
  },
]

type Listener = () => void

let services: Service[] = [...seedServices]
let ready = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

function persist(next: Service[]) {
  services = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

function normalize(raw: unknown): Service[] {
  if (!Array.isArray(raw)) return [...seedServices]

  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const priceFrom = Number(row.priceFrom)

      return {
        id: typeof row.id === 'string' ? row.id : String(index + 1).padStart(2, '0'),
        title: typeof row.title === 'string' ? row.title : 'untitled',
        summary: typeof row.summary === 'string' ? row.summary : '',
        details: typeof row.details === 'string' ? row.details : '',
        priceFrom: Number.isFinite(priceFrom) ? priceFrom : 0,
        priceUnit: typeof row.priceUnit === 'string' ? row.priceUnit : 'project',
      } satisfies Service
    })
    .filter((item): item is Service => item !== null)
}

export function subscribeServices(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getServices() {
  return services
}

export function getServicesSnapshot() {
  return services
}

export function isServicesReady() {
  return ready
}

export async function initServices() {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      services = normalize(JSON.parse(cached))
      ready = true
      emit()
      return
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  try {
    const response = await fetch(`/services.json?t=${Date.now()}`)
    if (response.ok) {
      services = normalize(await response.json())
    } else {
      services = [...seedServices]
    }
  } catch {
    services = [...seedServices]
  }

  ready = true
  emit()
}

export function upsertService(service: Service) {
  const exists = services.some((item) => item.id === service.id)
  persist(
    exists
      ? services.map((item) => (item.id === service.id ? service : item))
      : [...services, service],
  )
}

export function deleteService(id: string) {
  persist(services.filter((item) => item.id !== id))
}

export function moveService(id: string, direction: -1 | 1) {
  const index = services.findIndex((item) => item.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= services.length) return
  const next = [...services]
  ;[next[index], next[target]] = [next[target], next[index]]
  persist(next)
}

export function createServiceId() {
  return String(services.length + 1).padStart(2, '0')
}

export function downloadServicesJson() {
  const blob = new Blob([JSON.stringify(services, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'services.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function resetServicesToFile() {
  localStorage.removeItem(STORAGE_KEY)
  return initServices()
}
