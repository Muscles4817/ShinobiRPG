import type { MaterialOnShelf } from '@/game';

import type { PlaceProps } from '../types';

/** Materials to build puppets from, by the lot: what each is, how fine, and how many you keep. */
export function MaterialsRack({
  materials,
  perform,
}: {
  readonly materials: readonly MaterialOnShelf[];
  readonly perform: PlaceProps['perform'];
}) {
  if (materials.length === 0) return null;
  return (
    <section className="rack" aria-label="Puppet materials">
      <h2 className="label">Puppet materials</h2>
      <p className="muted small">Sold by the lot, for building at your bench at home.</p>
      <div className="rack-items">
        {materials.map((m) => (
          <article key={m.id} className="rack-item">
            <span className="tag num">{m.cost}</span>
            <b>{m.name}</b>
            <span className="chips">
              <span className="chip">{m.grade}</span>
              <span className="chip">You keep {m.held}</span>
            </span>
            <small className="rack-desc muted">{m.description}</small>
            {m.blocker && <small className="blocker">{m.blocker}</small>}
            <button
              type="button"
              className="btn small"
              disabled={m.blocker !== null}
              onClick={() => {
                perform(m.action);
              }}
            >
              Buy a lot
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
