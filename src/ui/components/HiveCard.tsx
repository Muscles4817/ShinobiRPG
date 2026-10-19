import { hiveCard, type GameContext, type GameState } from '@/game';

/**
 * The hive in your body: its strain, what it took of your chakra, how full it is and how soon it
 * fills again. Nothing shows without one.
 */
export function HiveCard({ ctx, state }: { readonly ctx: GameContext; readonly state: GameState }) {
  const card = hiveCard(state, ctx);
  if (!card) return null;
  return (
    <section className="contract-card hive-card paper-sheet" aria-label="Your hive">
      <h2>{card.strain}</h2>
      <p className="muted small">{card.description}</p>
      <p className="small">{card.share}</p>
      {card.gifts.length > 0 && <p className="small">{card.gifts.join('. ')}.</p>}
      <ul className="hive-qualities">
        {card.qualities.map((q) => (
          <li key={q.name}>
            {q.name} <span className="badge">{q.grade}</span>
          </li>
        ))}
      </ul>
      {card.fears.length > 0 && (
        <p className="muted small">Can’t stand {card.fears.join(' or ').toLowerCase()}.</p>
      )}
      <div className="hive-fill">
        <span className="badge">{card.state}</span>
        <span className="hp meter">
          <i style={{ width: `${card.fill * 100}%` }} />
        </span>
      </div>
      <p className="muted small">{card.breeding}</p>
    </section>
  );
}
