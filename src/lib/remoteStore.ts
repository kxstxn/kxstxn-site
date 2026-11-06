const OWNER = 'kxstxn'
const REPO = 'kxstxn-site'
const BRANCH = 'main'
const TOKEN_KEY = 'kxstxn.gh_token'

export function getGithubToken() {
  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY) ||
    ''
  )
}

export function setGithubToken(token: string, remember = true) {
  const value = token.trim()
  sessionStorage.setItem(TOKEN_KEY, value)
  if (remember && value) {
    localStorage.setItem(TOKEN_KEY, value)
  }
  if (!value) {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

export function clearGithubToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export function hasGithubToken() {
  return Boolean(getGithubToken())
}

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

async function fetchLocalJson(file: string) {
  const response = await fetch(`/${file}?t=${Date.now()}`)
  if (!response.ok) return null
  return response.json()
}

async function fetchRemoteJson(file: string) {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/public/${file}?t=${Date.now()}`
  const response = await fetch(url)
  if (!response.ok) return null
  return response.json()
}

/** Shared content: GitHub is source of truth, local JSON is fallback. */
export async function loadSharedJson(file: string) {
  try {
    const remote = await fetchRemoteJson(file)
    if (remote != null) return remote
  } catch {
    // fall through
  }

  try {
    return await fetchLocalJson(file)
  } catch {
    return null
  }
}

export async function saveSharedJson(file: string, data: unknown, message: string) {
  const token = getGithubToken()
  if (!token) {
    throw new Error('Add a GitHub token in admin to publish for everyone')
  }

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/public/${file}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let sha: string | undefined
  const existing = await fetch(`${apiUrl}?ref=${BRANCH}`, { headers })
  if (existing.ok) {
    const body = (await existing.json()) as { sha?: string }
    sha = body.sha
  } else if (existing.status !== 404) {
    throw new Error(`GitHub read failed (${existing.status})`)
  }

  const content = toBase64(`${JSON.stringify(data, null, 2)}\n`)
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!response.ok) {
    let detail = `GitHub save failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) detail = body.message
    } catch {
      // ignore
    }
    throw new Error(detail)
  }
}
