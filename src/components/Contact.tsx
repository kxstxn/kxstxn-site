import { site } from '../content'
import { useContacts } from '../lib/useContacts'

export function Contact() {
  const contacts = useContacts()

  return (
    <section className="section" id="contact">
      <div className="wrap">
        <h2 className="section__label">
          contact <span>/ link</span>
        </h2>

        <ul className="contact-list">
          {contacts.map((item) => (
            <li key={item.id}>
              <a className="contact-row" href={item.href}>
                <span className="contact-row__label">{item.label}</span>
                <span className="contact-row__value">{item.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="footer">
        <div className="wrap">
          <span>
            © {new Date().getFullYear()} {site.brand}
          </span>
          <a className="footer__admin" href="#admin">
            admin
          </a>
        </div>
      </footer>
    </section>
  )
}
