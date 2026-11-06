import { useEffect, useState } from 'react'
import { Admin } from './components/Admin'
import { Contact } from './components/Contact'
import { Hero } from './components/Hero'
import { NotFound } from './components/NotFound'
import { Projects } from './components/Projects'
import { Services } from './components/Services'
import { site } from './content'

type Route = 'home' | 'admin' | 'not-found'

function getRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '')
  if (hash === 'admin') return 'admin'

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/index.html') return 'home'
  return 'not-found'
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute)

  useEffect(() => {
    const sync = () => setRoute(getRoute())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  useEffect(() => {
    if (route === 'not-found') {
      document.title = `404 — ${site.brand}`
      return
    }
    document.title = site.brand
  }, [route])

  if (route === 'admin') {
    return <Admin />
  }

  if (route === 'not-found') {
    return <NotFound />
  }

  return (
    <div className="site">
      <Hero />
      <Services />
      <Projects />
      <Contact />
    </div>
  )
}
