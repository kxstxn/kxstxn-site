import { useState } from 'react'
import { useProjects } from '../lib/useProjects'

const PREVIEW_COUNT = 5

export function Projects() {
  const projects = useProjects()
  const [expanded, setExpanded] = useState(false)

  const hasMore = projects.length > PREVIEW_COUNT
  const visible = expanded || !hasMore ? projects : projects.slice(0, PREVIEW_COUNT)
  const hiddenCount = projects.length - PREVIEW_COUNT

  return (
    <section className="section" id="projects">
      <div className="wrap">
        <h2 className="section__label">
          projects <span>/ {String(projects.length).padStart(2, '0')}</span>
        </h2>

        {projects.length === 0 ? (
          <p className="projects-empty">no projects yet — post one in admin</p>
        ) : (
          <>
            <ul className="project-list">
              {visible.map((project) => (
                <li key={project.id} className="project-item">
                  <a className="project-row" href={project.href || '#'}>
                    <div className="project-row__main">
                      <div className="project-row__title">
                        {project.pinned ? (
                          <span className="project-row__pin" title="pinned">
                            *
                          </span>
                        ) : null}
                        <span className="project-row__name">{project.name}</span>
                      </div>

                      {project.tags.length > 0 ? (
                        <div className="project-row__meta">
                          {project.tags.map((tag) => (
                            <span key={tag} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {project.description ? (
                        <p className="project-row__note">{project.description}</p>
                      ) : null}
                    </div>

                    <div className="project-row__side">
                      <span className="project-type" data-type={project.type}>
                        {project.type}
                      </span>
                      <span className="status" data-status={project.status}>
                        {project.status}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            {hasMore ? (
              <button
                type="button"
                className="projects-more"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? 'show less' : `show more / +${hiddenCount}`}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
