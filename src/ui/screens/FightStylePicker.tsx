import { fightStyles, type GameAction, type GameContext, type GameState } from '@/game';

interface FightStylePickerProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/** Playtest switch: which combat engine runs your next fight. Hidden with only one style. */
export function FightStylePicker({ ctx, state, perform }: FightStylePickerProps) {
  const { options: styles, choosable } = fightStyles(state, ctx);
  if (!choosable) return null;
  const active = styles.find((s) => s.active)?.label ?? '';
  return (
    <details className="fight-styles" aria-label="Fight style">
      <summary>
        <span className="label">Fight style (playtest)</span> <b>{active}</b>
      </summary>
      <p className="muted small">Applies from your next fight.</p>
      {styles.map((s) => (
        <button
          key={s.id}
          type="button"
          className={s.active ? 'style-option on' : 'style-option'}
          aria-pressed={s.active}
          onClick={() => {
            if (!s.blocker) perform(s.action);
          }}
        >
          <b>{s.label}</b>
          <small>{s.summary}</small>
        </button>
      ))}
    </details>
  );
}
