export type ContactLink = {
  id: string
  label: string
  value: string
  href: string
}

const STORAGE_KEY = 'kxstxn.contacts'

const seedContacts: ContactLink[] = [
  { id: 'tg', label: 'telegram', value: '@kxstxn', href: '#' },
  { id: 'gh', label: 'github', value: 'github.com/kxstxn', href: '#' },
  { id: 'mail', label: 'email', value: 'hello@kxstxn.dev', href: 'mailto:hello@kxstxn.dev' },
]

type Listener = () => void

let contacts: ContactLink[] = [...seedContacts]
let ready = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

function persist(next: ContactLink[]) {
  contacts = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

function normalize(raw: unknown): ContactLink[] {
  if (!Array.isArray(raw)) return [...seedContacts]

  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>

      return {
        id: typeof row.id === 'string' ? row.id : `link-${index + 1}`,
        label: typeof row.label === 'string' ? row.label : 'link',
        value: typeof row.value === 'string' ? row.value : '',
        href: typeof row.href === 'string' ? row.href : '#',
      } satisfies ContactLink
    })
    .filter((item): item is ContactLink => item !== null)
}

export function subscribeContacts(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getContacts() {
  return contacts
}

export function getContactsSnapshot() {
  return contacts
}

export function isContactsReady() {
  return ready
}

export async function initContacts() {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      contacts = normalize(JSON.parse(cached))
      ready = true
      emit()
      return
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  try {
    const response = await fetch(`/contacts.json?t=${Date.now()}`)
    if (response.ok) {
      contacts = normalize(await response.json())
    } else {
      contacts = [...seedContacts]
    }
  } catch {
    contacts = [...seedContacts]
  }

  ready = true
  emit()
}

export function upsertContact(contact: ContactLink) {
  const exists = contacts.some((item) => item.id === contact.id)
  persist(
    exists
      ? contacts.map((item) => (item.id === contact.id ? contact : item))
      : [...contacts, contact],
  )
}

export function deleteContact(id: string) {
  persist(contacts.filter((item) => item.id !== id))
}

export function moveContact(id: string, direction: -1 | 1) {
  const index = contacts.findIndex((item) => item.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= contacts.length) return
  const next = [...contacts]
  ;[next[index], next[target]] = [next[target], next[index]]
  persist(next)
}

export function createContactId() {
  return `link-${Date.now().toString(36)}`
}

export function downloadContactsJson() {
  const blob = new Blob([JSON.stringify(contacts, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'contacts.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function resetContactsToFile() {
  localStorage.removeItem(STORAGE_KEY)
  return initContacts()
}
