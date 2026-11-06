import { useState, type FormEvent } from 'react'
import { loginAdmin, logoutAdmin } from '../lib/projectsStore'
import { AdminContacts } from './admin/AdminContacts'
import { AdminProjects } from './admin/AdminProjects'
import { AdminServices } from './admin/AdminServices'

type Tab = 'projects' | 'services' | 'links'

const tabs: { id: Tab; label: string }[] = [
  { id: 'projects', label: 'projects' },
  { id: 'services', label: 'services' },
  { id: 'links', label: 'links' },
]

export function Admin() {
  const [authed, setAuthed] = useState(() =>
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kxstxn.admin') === '1' : false,
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('projects')
  const [notice, setNotice] = useState('')

  function handleLogin(event: FormEvent) {
    event.preventDefault()
    if (!loginAdmin(password)) {
      setError('wrong password')
      return
    }
    setError('')
    setPassword('')
    setAuthed(true)
  }

  function handleLogout() {
    logoutAdmin()
    setAuthed(false)
    window.location.hash = ''
  }

  if (!authed) {
    return (
      <div className="admin">
        <div className="wrap admin__box">
          <p className="admin__eyebrow">:: admin / auth</p>
          <h1 className="admin__title">content desk</h1>
          <form className="admin__form" onSubmit={handleLogin}>
            <label className="admin__field">
              <span>password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
              />
            </label>
            {error ? <p className="admin__error">{error}</p> : null}
            <button type="submit" className="admin__btn">
              enter
            </button>
          </form>
          <a className="admin__back" href="#">
            ← back to site
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="wrap admin__box">
        <div className="admin__top">
          <div>
            <p className="admin__eyebrow">:: admin / content</p>
            <h1 className="admin__title">edit site</h1>
          </div>
          <button type="button" className="admin__btn admin__btn--ghost" onClick={handleLogout}>
            logout
          </button>
        </div>

        <div className="admin__tabs" role="tablist" aria-label="Admin sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? 'admin__tab is-active' : 'admin__tab'}
              onClick={() => {
                setTab(item.id)
                setNotice('')
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {notice ? <p className="admin__notice">{notice}</p> : null}

        {tab === 'projects' ? <AdminProjects onNotice={setNotice} /> : null}
        {tab === 'services' ? <AdminServices onNotice={setNotice} /> : null}
        {tab === 'links' ? <AdminContacts onNotice={setNotice} /> : null}

        <a className="admin__back" href="#">
          ← back to site
        </a>
      </div>
    </div>
  )
}
