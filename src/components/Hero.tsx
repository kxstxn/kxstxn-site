import { nav, site } from '../content'

export function Hero() {
  return (
    <header className="hero wrap">
      <nav className="hero__nav" aria-label="sections">
        {nav.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <p className="hero__status">{site.status}</p>

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
      </div>
    </header>
  )
}
