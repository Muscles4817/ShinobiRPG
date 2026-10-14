import { useState } from 'react';

import {
  blockerFor,
  EXPERIMENT_LIMIT,
  type GameAction,
  type GameContext,
  type GameState,
  type KitchenView,
} from '@/game';

interface ExperimentPotProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly pantry: KitchenView['pantry'];
  readonly perform: (action: GameAction) => void;
}

/** Trying something new: pick a few things from the pantry and see what the pot makes of them. */
export function ExperimentPot({ ctx, state, pantry, perform }: ExperimentPotProps) {
  const [picked, setPicked] = useState<readonly string[]>([]);
  if (pantry.length < 2) return null;
  const action: GameAction = { type: 'experiment', ingredientIds: picked };
  const blocker = blockerFor(state, action, ctx);
  const toggle = (id: string) => {
    setPicked(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]);
  };
  return (
    <details className="fold experiment">
      <summary>Try something new</summary>
      <p className="muted small">
        Put a few things together, one of each. If they make a dish you don’t know, you’ll work it
        out.
      </p>
      <span className="segments">
        {pantry.map((i) => (
          <button
            key={i.id}
            type="button"
            className={picked.includes(i.id) ? 'seg on' : 'seg'}
            aria-pressed={picked.includes(i.id)}
            disabled={!picked.includes(i.id) && picked.length >= EXPERIMENT_LIMIT}
            onClick={() => {
              toggle(i.id);
            }}
          >
            {i.name}
          </button>
        ))}
      </span>
      {blocker && picked.length > 0 && <small className="blocker">{blocker}</small>}
      <button
        type="button"
        className="btn small"
        disabled={blocker !== null}
        onClick={() => {
          perform(action);
          setPicked([]);
        }}
      >
        Put it in the pot
      </button>
    </details>
  );
}
