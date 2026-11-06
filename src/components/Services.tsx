import { useState } from 'react'
import { currencies, formatPrice, type CurrencyCode } from '../content'
import { useServices } from '../lib/useServices'

export function Services() {
  const services = useServices()
  const [openId, setOpenId] = useState<string | null>(null)
  const [currency, setCurrency] = useState<CurrencyCode>('USD')

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__label">
            services <span>/ {String(services.length).padStart(2, '0')}</span>
          </h2>

          <div className="currency-switch" role="group" aria-label="Currency">
            {currencies.map((item) => (
              <button
                key={item.code}
                type="button"
                className={
                  currency === item.code
                    ? 'currency-switch__btn is-active'
                    : 'currency-switch__btn'
                }
                onClick={() => setCurrency(item.code)}
              >
                {item.code}
              </button>
            ))}
          </div>
        </div>

        <ul className="service-list">
          {services.map((service) => {
            const isOpen = openId === service.id

            return (
              <li
                key={service.id}
                className={isOpen ? 'service-item is-open' : 'service-item'}
              >
                <button
                  type="button"
                  className="service-row"
                  aria-expanded={isOpen}
                  aria-controls={`service-panel-${service.id}`}
                  onClick={() => toggle(service.id)}
                >
                  <span className="service-row__id">{service.id}</span>
                  <h3 className="service-row__title">{service.title}</h3>
                  <p className="service-row__desc">{service.summary}</p>
                  <span className="service-row__mark" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div
                  className="service-panel"
                  id={`service-panel-${service.id}`}
                  hidden={!isOpen}
                >
                  <p className="service-panel__text">{service.details}</p>
                  <p className="service-panel__price">
                    <span className="service-panel__price-label">from</span>
                    <span className="service-panel__price-value">
                      {formatPrice(service.priceFrom, currency)}
                    </span>
                    <span className="service-panel__price-unit">
                      / {service.priceUnit}
                    </span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
