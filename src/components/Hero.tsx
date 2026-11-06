import { nav, site } from '../content'
import { useSite } from '../lib/useSite'

export function Hero() {
  const { availability } = useSite()

  return (
    <header className="hero wrap">
      <nav className="hero__nav" aria-label="sections">
        {nav.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <p className="hero__status">
        {site.status} · {site.timezone} · slots:{' '}
        <span className="hero__slots" data-slots={availability}>
          {availability}
        </span>
      </p>

      <h1 className="hero__brand">
        {site.brand}
        <span className="caret" aria-hidden="true" />
      </h1>

      <p className="hero__role">{site.role}</p>
      <p className="hero__tagline">{site.tagline}</p>

      <div className="hero__cta">
        <a className="cta" href="#projects">
          projects
        </a>
        <a className="cta" href="#contact">
          contact
        </a>
        <a
          className="cta"
          href={site.donate}
          target="_blank"
          rel="noopener noreferrer"
        >
          donate
        </a>
      </div>
    </header>
  )
}
