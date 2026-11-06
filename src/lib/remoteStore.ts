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

async function getFileSha(
  apiUrl: string,
  headers: Record<string, string>,
): Promise<string | undefined> {
  const existing = await fetch(`${apiUrl}?ref=${BRANCH}`, {
    headers,
    cache: 'no-store',
  })

  if (existing.ok) {
    const body = (await existing.json()) as { sha?: string }
    return body.sha
  }

  if (existing.status === 404) return undefined
  throw new Error(`GitHub read failed (${existing.status})`)
}

function isShaConflict(status: number, message: string) {
  return status === 409 || /does not match/i.test(message)
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

  const content = toBase64(`${JSON.stringify(data, null, 2)}\n`)
  let lastError = 'GitHub save failed'

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const sha = await getFileSha(apiUrl, headers)
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

    if (response.ok) return

    let detail = `GitHub save failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) detail = body.message
    } catch {
      // ignore
    }

    lastError = detail
    if (!isShaConflict(response.status, detail)) {
      throw new Error(detail)
    }
  }

  throw new Error(lastError)
}
