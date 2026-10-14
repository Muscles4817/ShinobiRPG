import { useState } from 'react';

import {
  blockerFor,
  STOVE_BEATS,
  type CookingSteps,
  type GameAction,
  type GameContext,
  type GameState,
  type RecipeCard,
} from '@/game';

interface StoveProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly recipe: RecipeCard;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

/** All three beats chosen, or null while one is still open. */
function complete(steps: Partial<CookingSteps>): CookingSteps | null {
  const { cut, heat, finish } = steps;
  return cut && heat && finish ? { cut, heat, finish } : null;
}

/**
 * The stove: cook a dish by hand in three beats (cut, fire, when it comes off). What you've
 * learned of the dish is set for you; the rest is your call, and the result tells you how it went.
 */
export function Stove({ ctx, state, recipe, perform, onClose }: StoveProps) {
  const [steps, setSteps] = useState<Partial<CookingSteps>>(recipe.knownSteps);
  const ready = complete(steps);
  const action: GameAction | null = ready
    ? { type: 'cook', recipeId: recipe.id, steps: ready }
    : null;
  const blocker = action ? blockerFor(state, action, ctx) : 'Choose all three first.';
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet paper-sheet enter stove"
        aria-label={`Cook ${recipe.name} at the stove`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2>{recipe.name}</h2>
        <p className="client">{recipe.method}</p>
        {recipe.hint && <p className="story dark">{recipe.hint}</p>}
        {STOVE_BEATS.map((b) => (
          <fieldset key={b.beat} className="stove-beat">
            <legend>{b.question}</legend>
            <span className="segments">
              {b.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={steps[b.beat] === o.id ? 'seg on' : 'seg'}
                  aria-pressed={steps[b.beat] === o.id}
                  onClick={() => {
                    setSteps({ ...steps, [b.beat]: o.id });
                  }}
                >
                  {o.label}
                </button>
              ))}
            </span>
          </fieldset>
        ))}
        {blocker && <p className="blocker">{blocker}</p>}
        <button
          type="button"
          className="btn wide"
          disabled={blocker !== null}
          onClick={() => {
            if (action) perform(action);
            onClose();
          }}
        >
          Cook it
        </button>
      </section>
    </div>
  );
}
