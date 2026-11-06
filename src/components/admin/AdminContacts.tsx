import { useState, type FormEvent } from 'react'
import { runAdminAction } from '../../lib/adminAction'
import {
  createContactId,
  deleteContact,
  downloadContactsJson,
  getContacts,
  moveContact,
  resetContactsToFile,
  upsertContact,
  type ContactLink,
} from '../../lib/contactsStore'
import { useContacts } from '../../lib/useContacts'

type Draft = {
  id: string
  label: string
  value: string
  href: string
}

const emptyDraft = (): Draft => ({
  id: '',
  label: '',
  value: '',
  href: '',
})

function toDraft(contact: ContactLink): Draft {
  return {
    id: contact.id,
    label: contact.label,
    value: contact.value,
    href: contact.href,
  }
}

function fromDraft(draft: Draft): ContactLink {
  return {
    id: draft.id || createContactId(),
    label: draft.label.trim() || 'link',
    value: draft.value.trim(),
    href: draft.href.trim() || '#',
  }
}

type Props = {
  onNotice: (message: string) => void
}

export function AdminContacts({ onNotice }: Props) {
  const contacts = useContacts()
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  function handleSave(event: FormEvent) {
    event.preventDefault()
    void runAdminAction(
      async () => {
        await upsertContact(fromDraft(draft))
        setDraft(emptyDraft())
      },
      onNotice,
      'link published',
    )
  }

  function handleDelete(id: string) {
    if (!window.confirm('delete this link?')) return
    void runAdminAction(
      async () => {
        await deleteContact(id)
        if (draft.id === id) setDraft(emptyDraft())
      },
      onNotice,
      'link deleted',
    )
  }

  async function handleReset() {
    if (!window.confirm('reset links to contacts.json / defaults?')) return
    await resetContactsToFile()
    setDraft(emptyDraft())
    onNotice('links reset')
  }

  return (
    <div className="admin__section">
      <div className="admin__actions">
        <button
          type="button"
          className="admin__btn admin__btn--ghost"
          onClick={() => {
            downloadContactsJson()
            onNotice(`replace public/contacts.json (${getContacts().length} items)`)
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
            <span>label</span>
            <input
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
              placeholder="telegram"
              required
            />
          </label>
          <label className="admin__field">
            <span>id</span>
            <input
              value={draft.id}
              onChange={(event) => setDraft({ ...draft, id: event.target.value })}
              placeholder="tg"
            />
          </label>
          <label className="admin__field admin__field--wide">
            <span>display value</span>
            <input
              value={draft.value}
              onChange={(event) => setDraft({ ...draft, value: event.target.value })}
              placeholder="@kxstxn"
              required
            />
          </label>
          <label className="admin__field admin__field--wide">
            <span>href</span>
            <input
              value={draft.href}
              onChange={(event) => setDraft({ ...draft, href: event.target.value })}
              placeholder="https://t.me/... or mailto:..."
              required
            />
          </label>
        </div>

        <div className="admin__actions">
          <button type="submit" className="admin__btn">
            {draft.id ? 'update link' : 'add link'}
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
        {contacts.map((contact, index) => (
          <li key={contact.id} className="admin__item">
            <div>
              <p className="admin__item-name">{contact.label}</p>
              <p className="admin__item-meta">
                {contact.value} · {contact.href}
              </p>
            </div>
            <div className="admin__item-actions">
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() =>
                  void runAdminAction(
                    () => moveContact(contact.id, -1),
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
                    () => moveContact(contact.id, 1),
                    onNotice,
                    'order updated',
                  )
                }
                disabled={index === contacts.length - 1}
                aria-label="move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => setDraft(toDraft(contact))}
              >
                edit
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => handleDelete(contact.id)}
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
