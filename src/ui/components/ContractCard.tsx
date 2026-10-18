import { contractCard, type GameContext, type GameState } from '@/game';

import { BondMeter } from './BondMeter';

/**
 * Your summoning contract: the clan, your standing with it, and each summon, whether it answers
 * you now and what it asks. Nothing shows until you have signed one.
 */
export function ContractCard({
  ctx,
  state,
}: {
  readonly ctx: GameContext;
  readonly state: GameState;
}) {
  const card = contractCard(state, ctx);
  if (!card) return null;
  return (
    <section className="contract-card paper-sheet" aria-label="Summoning contract">
      <h2>{card.name}</h2>
      <p className="muted small">{card.description}</p>
      <BondMeter stageName={card.standing} progress={card.progress} />
      <ul className="summons">
        {card.summons.map((s) => (
          <li key={s.name} className={s.answers ? 'summon answers' : 'summon'}>
            <b>{s.name}</b> <span className="badge">{s.grade}</span>
            <p className="small">{s.description}</p>
            <p className="muted small">{s.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
