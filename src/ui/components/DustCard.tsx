import { dustCard, type GameContext, type GameState } from '@/game';

/**
 * The dust you command: its kind, what it does, what scatters it, how much you carry and
 * whether it comes back on its own. Nothing shows without any.
 */
export function DustCard({ ctx, state }: { readonly ctx: GameContext; readonly state: GameState }) {
  const card = dustCard(state, ctx);
  if (!card) return null;
  return (
    <section className="contract-card hive-card paper-sheet" aria-label="Your dust">
      <h2>{card.name}</h2>
      <p className="muted small">{card.description}</p>
      {card.gifts.length > 0 && <p className="small">{card.gifts.join('. ')}.</p>}
      <ul className="hive-qualities">
        {card.qualities.map((q) => (
          <li key={q.name}>
            {q.name} <span className="badge">{q.grade}</span>
          </li>
        ))}
      </ul>
      {card.banes.length > 0 && (
        <p className="muted small">Scattered by {card.banes.join(' or ').toLowerCase()}.</p>
      )}
      <div className="hive-fill">
        <span className="badge">{card.state}</span>
        <span className="hp meter">
          <i style={{ width: `${card.fill * 100}%` }} />
        </span>
      </div>
      <p className="muted small">{card.gathering}</p>
    </section>
  );
}
