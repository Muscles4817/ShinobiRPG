import { puppetCard, type GameAction, type GameContext, type GameState } from '@/game';

/**
 * Your puppets: your craft in words, and each puppet's condition, whether it comes to fights,
 * and a session at your bench to mend it. Nothing shows until you own one.
 */
export function PuppetCard({
  ctx,
  state,
  perform,
}: {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}) {
  const card = puppetCard(state, ctx);
  if (!card) return null;
  return (
    <section className="contract-card hive-card paper-sheet" aria-label="Your puppets">
      <h2>Your puppets</h2>
      <p className="muted small">{card.craft} at the bench.</p>
      {card.puppets.map((p) => (
        <article key={p.frameId} className="puppet-row">
          <h3>{p.name}</h3>
          <p className="muted small">{p.description}</p>
          <div className="hive-fill">
            <span className="badge">{p.state}</span>
            <span className="hp meter">
              <i style={{ width: `${p.condition * 100}%` }} />
            </span>
          </div>
          {p.staysHome && <p className="muted small">{p.staysHome}</p>}
          {p.mend && (
            <>
              <button
                type="button"
                className="btn ghost"
                disabled={p.mend.blocker !== null}
                onClick={() => {
                  if (p.mend) perform(p.mend.action);
                }}
              >
                Mend at the bench ({p.mend.cost} ryo)
              </button>
              {p.mend.blocker && <p className="muted small">{p.mend.blocker}</p>}
            </>
          )}
        </article>
      ))}
    </section>
  );
}
