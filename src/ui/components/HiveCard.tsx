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
