import { useEffect, useState } from 'react'
import { Admin } from './components/Admin'
import { Contact } from './components/Contact'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Services } from './components/Services'

function getIsAdmin() {
  return window.location.hash.replace(/^#/, '') === 'admin'
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(getIsAdmin)

  useEffect(() => {
    const onHashChange = () => setIsAdmin(getIsAdmin())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (isAdmin) {
    return <Admin />
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
