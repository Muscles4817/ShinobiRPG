import { cookbookView, type GameContext, type GameState } from '@/game';

import { Icon } from '../art/Icon';
import { GradeBadge } from '../components/Grade';

/**
 * Your cookbook: the dishes you know and what each does, and sealed pages for the ones you
 * haven't learned, each saying where it can be learned.
 */
export function Cookbook({ ctx, state }: { readonly ctx: GameContext; readonly state: GameState }) {
  const view = cookbookView(state, ctx);
  const percent = Math.round(view.progress * 100);
  return (
    <section className="cookbook" aria-label="Cookbook">
      <h2 className="label">Cookbook</h2>
      <p className="cook-grade">
        <GradeBadge grade={view.grade} />
        <span className="muted small">
          Cooking grade. {view.known.length} of {view.total} dishes learned.
        </span>
        <span className="bond-bar" aria-label={`${percent}% to the next grade`}>
          <i style={{ width: `${percent}%` }} />
        </span>
      </p>
      <ul className="cook-pages">
        {view.known.map((r) => (
          <li key={r.id} className="cook-page">
            <span className="cook-head">
              <Icon id={r.icon} size={20} />
              <b>{r.name}</b>
              <GradeBadge grade={r.rank} />
              <span className="badge">{r.mastery}</span>
            </span>
            <small className="muted">{r.description}</small>
            <span className="chips">
              {r.effects.map((e) => (
                <span key={e.label} className={`chip ${e.tone}`}>
                  {e.label}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {view.sealed.length > 0 && (
        <details className="fold">
          <summary>{`${view.sealed.length} dishes you have yet to learn`}</summary>
          <ul className="cook-pages">
            {view.sealed.map((r) => (
              <li key={r.id} className="cook-page sealed">
                <span className="cook-head">
                  <b>{r.name}</b>
                  <GradeBadge grade={r.rank} />
                </span>
                {r.hints.map((h) => (
                  <small key={h} className="muted">
                    {h}.
                  </small>
                ))}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
