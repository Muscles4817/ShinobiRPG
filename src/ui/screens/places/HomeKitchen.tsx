import { kitchenView, type GameContext, type GameState } from '@/game';

import { Icon } from '../../art/Icon';
import { DinnerInvites } from './DinnerInvites';
import type { PlaceProps } from '../types';

interface HomeKitchenProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: PlaceProps['perform'];
}

/** The stove: your pantry, and recipes you can cook from it for a day-long buff. */
export function HomeKitchen({ ctx, state, perform }: HomeKitchenProps) {
  const view = kitchenView(state, ctx);
  return (
    <section id="kitchen" className="kitchen" aria-label="Kitchen">
      <h2 className="label">Kitchen</h2>
      {view.meal && (
        <p className="meal-today">
          Today you ate <b>{view.meal.name}</b>
          <span className="chips">
            {view.meal.effects.map((e) => (
              <span key={e.label} className="chip gain">
                {e.label}
              </span>
            ))}
          </span>
        </p>
      )}
      <p className="pantry">
        {view.pantry.length === 0
          ? 'The pantry is empty. The grocer at the market sells ingredients.'
          : view.pantry.map((i) => (
              <span key={i.id} className="chip">
                {i.name} ×{i.count}
              </span>
            ))}
      </p>
      {view.noGuests && <p className="muted">{view.noGuests}</p>}
      <div className="recipes">
        {view.recipes.map((r) => (
          <article key={r.id} className="recipe">
            <div className="recipe-head">
              <Icon id={r.icon} size={24} />
              <b>{r.name}</b>
            </div>
            <span className="chips">
              <span className="chip gain">Hunger −{r.satiety}</span>
              {r.energy > 0 && <span className="chip gain">Energy +{r.energy}</span>}
              {r.effects.map((e) => (
                <span key={e.label} className="chip gain">
                  {e.label} today
                </span>
              ))}
            </span>
            <small className="muted">
              {r.needs.map((n) => `${n.name} ${Math.min(n.have, n.need)}/${n.need}`).join(' · ')}
            </small>
            {r.blocker && <small className="blocker">{r.blocker}</small>}
            <button
              type="button"
              className="btn small"
              disabled={r.blocker !== null}
              onClick={() => {
                perform(r.action);
              }}
            >
              Cook
            </button>
            {!view.noGuests && (
              <DinnerInvites invites={r.invites} blocker={r.inviteBlocker} perform={perform} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
