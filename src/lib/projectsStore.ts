import { loadSharedJson, saveSharedJson } from './remoteStore'

export type ProjectStatus = 'active' | 'wip' | 'archived'
export type ProjectType = 'project' | 'portfolio'

export type Project = {
  id: string
  name: string
  tags: string[]
  status: ProjectStatus
  type: ProjectType
  href: string
  description: string
  pinned: boolean
}

export const PROJECT_STATUSES: ProjectStatus[] = ['active', 'wip', 'archived']
export const PROJECT_TYPES: ProjectType[] = ['project', 'portfolio']

const STORAGE_KEY = 'kxstxn.projects'
const AUTH_KEY = 'kxstxn.admin'
/** Change this password anytime */
export const ADMIN_PASSWORD = 'killmepls1305'

const seedProjects: Project[] = [
  {
    id: 'p-01',
    name: 'signal.relay',
    tags: ['ts', 'api'],
    status: 'active',
    type: 'project',
    href: '#',
    description: '',
    pinned: false,
  },
  {
    id: 'p-02',
    name: 'void.watcher',
    tags: ['python', 'ops'],
    status: 'wip',
    type: 'project',
    href: '#',
    description: '',
    pinned: false,
  },
  {
    id: 'p-03',
    name: 'node.ghost',
    tags: ['react', 'ui'],
    status: 'archived',
    type: 'portfolio',
    href: '#',
    description: '',
    pinned: false,
  },
]

type Listener = () => void

let projects: Project[] = [...seedProjects]
let ready = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setLocal(next: Project[]) {
  projects = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

async function persist(next: Project[]) {
  setLocal(next)
  await saveSharedJson('projects.json', next, 'chore: update projects')
}

function normalize(raw: unknown): Project[] {
  if (!Array.isArray(raw)) return [...seedProjects]

  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const status = PROJECT_STATUSES.includes(row.status as ProjectStatus)
        ? (row.status as ProjectStatus)
        : 'wip'
      const type = PROJECT_TYPES.includes(row.type as ProjectType)
        ? (row.type as ProjectType)
        : 'project'
      const tags = Array.isArray(row.tags)
        ? row.tags.filter((tag): tag is string => typeof tag === 'string')
        : []

      return {
        id: typeof row.id === 'string' ? row.id : `p-${Date.now()}-${index}`,
        name: typeof row.name === 'string' ? row.name : 'untitled',
        tags,
        status,
        type,
        href: typeof row.href === 'string' ? row.href : '#',
        description: typeof row.description === 'string' ? row.description : '',
        pinned: Boolean(row.pinned),
      } satisfies Project
    })
    .filter((item): item is Project => item !== null)
}

export function subscribeProjects(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getProjects() {
  return projects
}

export function getProjectsSnapshot() {
  return projects
}

export function isProjectsReady() {
  return ready
}

export async function initProjects() {
  try {
    const remote = await loadSharedJson('projects.json')
    if (remote != null) {
      projects = normalize(remote)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
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
      projects = normalize(JSON.parse(cached))
      ready = true
      emit()
      return
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  projects = [...seedProjects]
  ready = true
  emit()
}

export async function saveProjects(next: Project[]) {
  await persist(next)
}

export async function upsertProject(project: Project) {
  const exists = projects.some((item) => item.id === project.id)
  if (!exists) {
    const insertAt = project.pinned
      ? projects.findIndex((item) => !item.pinned)
      : projects.length
    const next = [...projects]
    next.splice(insertAt < 0 ? projects.length : insertAt, 0, project)
    await persist(next)
    return
  }

  await persist(projects.map((item) => (item.id === project.id ? project : item)))
}

export async function deleteProject(id: string) {
  await persist(projects.filter((item) => item.id !== id))
}

export async function togglePin(id: string) {
  const index = projects.findIndex((item) => item.id === id)
  if (index < 0) return

  const current = projects[index]
  const item = { ...current, pinned: !current.pinned }
  const rest = projects.filter((entry) => entry.id !== id)
  const lastPinned = rest.findLastIndex((entry) => entry.pinned)
  const insertAt = item.pinned ? lastPinned + 1 : Math.max(lastPinned + 1, 0)
  rest.splice(insertAt, 0, item)
  await persist(rest)
}

export async function moveProject(id: string, direction: -1 | 1) {
  const index = projects.findIndex((item) => item.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= projects.length) return

  const next = [...projects]
  ;[next[index], next[target]] = [next[target], next[index]]
  await persist(next)
}

export function createProjectId() {
  return `p-${Date.now().toString(36)}`
}

export function downloadProjectsJson() {
  const blob = new Blob([JSON.stringify(projects, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'projects.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function resetProjectsToFile() {
  localStorage.removeItem(STORAGE_KEY)
  return initProjects()
}

export function isAdminAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function loginAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) return false
  sessionStorage.setItem(AUTH_KEY, '1')
  return true
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY)
}
