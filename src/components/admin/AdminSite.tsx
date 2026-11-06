import { runAdminAction } from '../../lib/adminAction'
import type { Availability } from '../../content'
import { setAvailability } from '../../lib/siteStore'
import { useSite } from '../../lib/useSite'

const options: Availability[] = ['open', 'limited', 'closed']

type Props = {
  onNotice: (message: string) => void
}

export function AdminSite({ onNotice }: Props) {
  const site = useSite()

  function handleSet(value: Availability) {
    if (value === site.availability) return
    void runAdminAction(
      async () => {
        await setAvailability(value)
      },
      onNotice,
      `slots: ${value}`,
    )
  }

  return (
    <div className="admin__section">
      <p className="admin__hint">hero status · slots</p>
      <div className="currency-switch" role="group" aria-label="Availability">
        {options.map((value) => (
          <button
            key={value}
            type="button"
            className={
              site.availability === value
                ? 'currency-switch__btn is-active'
                : 'currency-switch__btn'
            }
            onClick={() => handleSet(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
