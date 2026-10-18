import type { GameAction, VetView } from '@/game';

import { GradeBadge } from '../../components/Grade';

/**
 * The clinic's handler: sessions drilling your companion's skills (better than your own), and
 * the arts they teach once the bond is there.
 */
export function HandlerSlip({
  handler,
  companion,
  perform,
}: {
  readonly handler: VetView['handler'];
  readonly companion: string;
  readonly perform: (action: GameAction) => void;
}) {
  if (!handler) return null;
  const why = handler.sessions.find((s) => s.blocker !== null)?.blocker ?? null;
  return (
    <section className="room-slip" aria-label={`${handler.name} works with ${companion}`}>
      <h2>
        {handler.name} works with {companion}
      </h2>
      <p className="muted small">{handler.quality}</p>
      <p className={handler.fee === 0 ? 'room-price free num' : 'room-price num'}>
        {handler.fee === 0 ? 'Free to the clan' : `${handler.fee} ryo a session`}
      </p>
      <div className="teach-stats">
        {handler.sessions.map((s) => (
          <button
            key={s.label}
            type="button"
            className="teach-stat"
            disabled={s.blocker !== null}
            aria-label={`Have ${handler.name} drill ${companion} in ${s.label}`}
            onClick={() => {
              perform(s.action);
            }}
          >
            <span className="teach-label">{s.label}</span>
            <span className="teach-grades" aria-hidden="true">
              <GradeBadge grade={s.grade} />
            </span>
          </button>
        ))}
      </div>
      {why && <p className="muted small">{why}</p>}
      {handler.teaches.map((t) => (
        <div key={t.name} className="handler-teach">
          <b>{t.name}</b>
          {t.note && <small className="muted">{t.note}</small>}
          <button
            type="button"
            className="btn small"
            disabled={t.blocker !== null}
            onClick={() => {
              perform(t.action);
            }}
          >
            Teach {companion} {t.name}
          </button>
          {t.blocker && <small className="muted">{t.blocker}</small>}
        </div>
      ))}
    </section>
  );
}
