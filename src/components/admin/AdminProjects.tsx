import { useState, type FormEvent } from 'react'
import {
  createProjectId,
  deleteProject,
  downloadProjectsJson,
  getProjects,
  moveProject,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  resetProjectsToFile,
  togglePin,
  upsertProject,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from '../../lib/projectsStore'
import { useProjects } from '../../lib/useProjects'

type Draft = {
  id: string
  name: string
  tags: string
  status: ProjectStatus
  type: ProjectType
  href: string
  description: string
  pinned: boolean
}

const emptyDraft = (): Draft => ({
  id: '',
  name: '',
  tags: '',
  status: 'wip',
  type: 'project',
  href: '#',
  description: '',
  pinned: false,
})

function toDraft(project: Project): Draft {
  return {
    id: project.id,
    name: project.name,
    tags: project.tags.join(', '),
    status: project.status,
    type: project.type,
    href: project.href,
    description: project.description,
    pinned: project.pinned,
  }
}

function fromDraft(draft: Draft): Project {
  return {
    id: draft.id || createProjectId(),
    name: draft.name.trim() || 'untitled',
    tags: draft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    status: draft.status,
    type: draft.type,
    href: draft.href.trim() || '#',
    description: draft.description.trim(),
    pinned: draft.pinned,
  }
}

type Props = {
  onNotice: (message: string) => void
}

export function AdminProjects({ onNotice }: Props) {
  const projects = useProjects()
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  function handleSave(event: FormEvent) {
    event.preventDefault()
    upsertProject(fromDraft(draft))
    setDraft(emptyDraft())
    onNotice('project saved — download json to publish')
  }

  function handleDelete(id: string) {
    if (!window.confirm('delete this project?')) return
    deleteProject(id)
    if (draft.id === id) setDraft(emptyDraft())
    onNotice('project deleted')
  }

  async function handleReset() {
    if (!window.confirm('reset projects to projects.json / defaults?')) return
    await resetProjectsToFile()
    setDraft(emptyDraft())
    onNotice('projects reset')
  }

  return (
    <div className="admin__section">
      <div className="admin__actions">
        <button
          type="button"
          className="admin__btn admin__btn--ghost"
          onClick={() => {
            downloadProjectsJson()
            onNotice(`replace public/projects.json (${getProjects().length} items)`)
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
            <span>name</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="signal.relay"
              required
            />
          </label>
          <label className="admin__field">
            <span>type</span>
            <select
              value={draft.type}
              onChange={(event) => setDraft({ ...draft, type: event.target.value as ProjectType })}
            >
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="admin__field">
            <span>status</span>
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as ProjectStatus })
              }
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="admin__field admin__toggle">
            <span>pinned</span>
            <span className="admin__toggle-control">
              <span className="admin__toggle-hint">{draft.pinned ? 'on top' : 'normal order'}</span>
              <input
                type="checkbox"
                checked={draft.pinned}
                onChange={(event) => setDraft({ ...draft, pinned: event.target.checked })}
              />
              <span className="admin__toggle-track" aria-hidden="true">
                <span className="admin__toggle-thumb" />
              </span>
            </span>
          </label>
          <label className="admin__field admin__field--wide">
            <span>tags</span>
            <input
              value={draft.tags}
              onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
              placeholder="ts, api, react"
            />
          </label>
          <label className="admin__field admin__field--wide">
            <span>link</span>
            <input
              value={draft.href}
              onChange={(event) => setDraft({ ...draft, href: event.target.value })}
              placeholder="https://..."
            />
          </label>
          <label className="admin__field admin__field--wide">
            <span>description</span>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="short note about the project"
            />
          </label>
        </div>

        <div className="admin__actions">
          <button type="submit" className="admin__btn">
            {draft.id ? 'update project' : 'add project'}
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
        {projects.map((project, index) => (
          <li key={project.id} className="admin__item">
            <div>
              <p className="admin__item-name">
                {project.pinned ? '* ' : ''}
                ./{project.name}
              </p>
              <p className="admin__item-meta">
                {project.type} · {project.status}
                {project.tags.length ? ` · ${project.tags.join(' · ')}` : ''}
              </p>
            </div>
            <div className="admin__item-actions">
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => moveProject(project.id, -1)}
                disabled={index === 0}
                aria-label="move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => moveProject(project.id, 1)}
                disabled={index === projects.length - 1}
                aria-label="move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => togglePin(project.id)}
              >
                {project.pinned ? 'unpin' : 'pin'}
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => setDraft(toDraft(project))}
              >
                edit
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => handleDelete(project.id)}
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
