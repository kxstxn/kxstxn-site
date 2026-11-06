import { useState, type FormEvent } from 'react'
import { runAdminAction } from '../../lib/adminAction'
import {
  createServiceId,
  deleteService,
  downloadServicesJson,
  getServices,
  moveService,
  resetServicesToFile,
  upsertService,
  type Service,
} from '../../lib/servicesStore'
import { useServices } from '../../lib/useServices'

type Draft = {
  id: string
  title: string
  summary: string
  details: string
  priceFrom: string
  priceUnit: string
}

const emptyDraft = (): Draft => ({
  id: '',
  title: '',
  summary: '',
  details: '',
  priceFrom: '50',
  priceUnit: 'project',
})

function toDraft(service: Service): Draft {
  return {
    id: service.id,
    title: service.title,
    summary: service.summary,
    details: service.details,
    priceFrom: String(service.priceFrom),
    priceUnit: service.priceUnit,
  }
}

function fromDraft(draft: Draft): Service {
  const price = Number(draft.priceFrom)
  return {
    id: draft.id || createServiceId(),
    title: draft.title.trim() || 'untitled',
    summary: draft.summary.trim(),
    details: draft.details.trim(),
    priceFrom: Number.isFinite(price) ? price : 0,
    priceUnit: draft.priceUnit.trim() || 'project',
  }
}

type Props = {
  onNotice: (message: string) => void
}

export function AdminServices({ onNotice }: Props) {
  const services = useServices()
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  function handleSave(event: FormEvent) {
    event.preventDefault()
    void runAdminAction(
      async () => {
        await upsertService(fromDraft(draft))
        setDraft(emptyDraft())
      },
      onNotice,
      'service published',
    )
  }

  function handleDelete(id: string) {
    if (!window.confirm('delete this service?')) return
    void runAdminAction(
      async () => {
        await deleteService(id)
        if (draft.id === id) setDraft(emptyDraft())
      },
      onNotice,
      'service deleted',
    )
  }

  async function handleReset() {
    if (!window.confirm('reset services to services.json / defaults?')) return
    await resetServicesToFile()
    setDraft(emptyDraft())
    onNotice('services reset')
  }

  return (
    <div className="admin__section">
      <div className="admin__actions">
        <button
          type="button"
          className="admin__btn admin__btn--ghost"
          onClick={() => {
            downloadServicesJson()
            onNotice(`replace public/services.json (${getServices().length} items)`)
          }}
        >
          download json
        </button>
        <button type="button" className="admin__btn admin__btn--ghost" onClick={handleReset}>
          reset
        </button>
      </div>

      <form className="admin__form" onSubmit={handleSave}>
        <div className="admin__grid">
          <label className="admin__field">
            <span>title</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="development"
              required
            />
          </label>
          <label className="admin__field">
            <span>id</span>
            <input
              value={draft.id}
              onChange={(event) => setDraft({ ...draft, id: event.target.value })}
              placeholder="01"
            />
          </label>
          <label className="admin__field">
            <span>price from (usd)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={draft.priceFrom}
              onChange={(event) => setDraft({ ...draft, priceFrom: event.target.value })}
              required
            />
          </label>
          <label className="admin__field">
            <span>price unit</span>
            <input
              value={draft.priceUnit}
              onChange={(event) => setDraft({ ...draft, priceUnit: event.target.value })}
              placeholder="project / hour"
              required
            />
          </label>
          <label className="admin__field admin__field--wide">
            <span>summary</span>
            <input
              value={draft.summary}
              onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
              placeholder="apps · bots · tools"
            />
          </label>
          <label className="admin__field admin__field--wide">
            <span>details</span>
            <textarea
              rows={4}
              value={draft.details}
              onChange={(event) => setDraft({ ...draft, details: event.target.value })}
              placeholder="full description shown when expanded"
            />
          </label>
        </div>

        <div className="admin__actions">
          <button type="submit" className="admin__btn">
            {draft.id ? 'update service' : 'add service'}
          </button>
          {draft.id ? (
            <button
              type="button"
              className="admin__btn admin__btn--ghost"
              onClick={() => setDraft(emptyDraft())}
            >
              new instead
            </button>
          ) : null}
        </div>
      </form>

      <ul className="admin__list">
        {services.map((service, index) => (
          <li key={service.id} className="admin__item">
            <div>
              <p className="admin__item-name">
                {service.id} · {service.title}
              </p>
              <p className="admin__item-meta">
                from ${service.priceFrom} / {service.priceUnit}
                {service.summary ? ` · ${service.summary}` : ''}
              </p>
            </div>
            <div className="admin__item-actions">
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() =>
                  void runAdminAction(
                    () => moveService(service.id, -1),
                    onNotice,
                    'order updated',
                  )
                }
                disabled={index === 0}
                aria-label="move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() =>
                  void runAdminAction(
                    () => moveService(service.id, 1),
                    onNotice,
                    'order updated',
                  )
                }
                disabled={index === services.length - 1}
                aria-label="move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => setDraft(toDraft(service))}
              >
                edit
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => handleDelete(service.id)}
              >
                delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
