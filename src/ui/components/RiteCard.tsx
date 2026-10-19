import { riteCards, type GameAction, type GameContext, type GameState } from '@/game';

interface RiteCardProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/**
 * A hive clan's rite you have learned: what it is, and the three shares of chakra the hive may
 * take, each a way to take it at home. Nothing shows once you carry a hive.
 */
export function RiteCards({ ctx, state, perform }: RiteCardProps) {
  const cards = riteCards(state, ctx);
  return (
    <>
      {cards.map((card) => (
        <section
          key={card.clanId}
          className="contract-card paper-sheet rite-card"
          aria-label={card.name}
        >
          <h2>{card.name}</h2>
          <p className="muted small">{card.description}</p>
          <p className="small">It puts {card.strain.toLowerCase()} in you, for good.</p>
          <ul className="rite-shares">
            {card.shares.map((s) => (
              <li key={s.id}>
                <b>{s.name}</b>
                <p className="muted small">
                  {s.description} {s.abed}
                </p>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={s.take.blocker !== null}
                  onClick={() => {
                    perform(s.take.action);
                  }}
                >
                  Give it {s.name.toLowerCase()}
                </button>
              </li>
            ))}
          </ul>
          {card.shares[0]?.take.blocker && <p className="blocker">{card.shares[0].take.blocker}</p>}
        </section>
      ))}
    </>
  );
}
