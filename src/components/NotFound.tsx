import { site } from '../content'

export function NotFound() {
  const path = window.location.pathname || '/'

  return (
    <main className="not-found wrap">
      <p className="not-found__status">error: 404</p>
      <h1 className="not-found__title">
        command not found
        <span className="caret" aria-hidden="true" />
      </h1>
      <p className="not-found__path">
        <span className="not-found__prompt">$</span> {path}
      </p>
      <p className="not-found__hint">
        no entry for this route — back to {site.brand}
      </p>
      <a className="cta" href="/">
        home
      </a>
    </main>
  )
}
