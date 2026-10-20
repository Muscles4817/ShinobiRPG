import { dustScrollRows, type GameAction, type GameContext, type GameState } from '@/game';

/** S-rank dust scrolls you hold: what each teaches, how far you've read, and a day's study. */
export function DustScrolls({
  ctx,
  state,
  perform,
}: {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <>
      {dustScrollRows(state, ctx).map((row) => (
        <section key={row.dustId} className="contract-card paper-sheet" aria-label={row.name}>
          <h2>{row.name}</h2>
          <p className="muted small">{row.description}</p>
          <p className="small">{row.progress}</p>
          <button
            type="button"
            className="btn ghost"
            disabled={row.study.blocker !== null}
            onClick={() => {
              perform(row.study.action);
            }}
          >
            Study it
          </button>
          {row.study.blocker && <p className="muted small">{row.study.blocker}</p>}
        </section>
      ))}
    </>
  );
}
