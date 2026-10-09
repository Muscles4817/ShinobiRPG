import { fightStyles, type GameAction, type GameContext, type GameState } from '@/game';

interface FightStylePickerProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/** Playtest switch: which combat engine runs your next fight. */
export function FightStylePicker({ ctx, state, perform }: FightStylePickerProps) {
  const styles = fightStyles(state, ctx);
  return (
    <section className="fight-styles" aria-label="Fight style">
      <h2 className="label">Fight style · playtest</h2>
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
    </section>
  );
}
