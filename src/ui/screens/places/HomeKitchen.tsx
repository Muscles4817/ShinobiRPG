import { useState } from 'react';

import { kitchenView, type GameContext, type GameState } from '@/game';

import { Icon } from '../../art/Icon';
import { GradeBadge } from '../../components/Grade';
import { DinnerInvites } from './DinnerInvites';
import { ExperimentPot } from './ExperimentPot';
import { Stove } from './Stove';
import type { PlaceProps } from '../types';

interface HomeKitchenProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: PlaceProps['perform'];
}

/** The stove: your pantry, and recipes you can cook from it for a day-long buff. */
export function HomeKitchen({ ctx, state, perform }: HomeKitchenProps) {
  const view = kitchenView(state, ctx);
  const [atStove, setAtStove] = useState<string | null>(null);
  const stoveRecipe = view.recipes.find((r) => r.id === atStove);
  return (
    <section id="kitchen" className="kitchen" aria-label="Kitchen">
      <h2 className="label">Kitchen</h2>
      <p className="muted small">
        You cook like a grade {view.grade} hand.
        {view.unlearned > 0 &&
          ' There are dishes you have yet to learn: your cookbook, under Shinobi, says where.'}
      </p>
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
              <GradeBadge grade={r.rank} />
              {r.mastery && <span className="badge">{r.mastery}</span>}
            </div>
            <span className="chips">
              <span className="chip gain">Hunger −{r.satiety}</span>
              {r.energy > 0 && <span className="chip gain">Energy +{r.energy}</span>}
              {r.health > 0 && <span className="chip gain">Health +{r.health}</span>}
              {r.chakra > 0 && <span className="chip gain">Chakra +{r.chakra}</span>}
              {r.effects.map((e) => (
                <span key={e.label} className="chip gain">
                  {e.label} today
                </span>
              ))}
            </span>
            <small className="muted">{r.hint ?? r.method}</small>
            <small className="muted">
              {r.needs.map((n) => `${n.name} ${Math.min(n.have, n.need)}/${n.need}`).join(', ')}
            </small>
            {r.blocker && <small className="blocker">{r.blocker}</small>}
            <button
              type="button"
              className="btn small"
              disabled={r.blocker !== null}
              onClick={() => {
                setAtStove(r.id);
              }}
            >
              At the stove
            </button>
            <button
              type="button"
              className="btn small ghost"
              disabled={r.blocker !== null}
              onClick={() => {
                perform(r.action);
              }}
            >
              Cook as usual
            </button>
            {!view.noGuests && (
              <DinnerInvites invites={r.invites} blocker={r.inviteBlocker} perform={perform} />
            )}
          </article>
        ))}
      </div>
      <ExperimentPot ctx={ctx} state={state} pantry={view.pantry} perform={perform} />
      {stoveRecipe && (
        <Stove
          ctx={ctx}
          state={state}
          recipe={stoveRecipe}
          perform={perform}
          onClose={() => {
            setAtStove(null);
          }}
        />
      )}
    </section>
  );
}
