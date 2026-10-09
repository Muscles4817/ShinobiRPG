import type { GameAction, VillageView } from '@/game';

interface VillageLifeProps {
  readonly view: VillageView;
  readonly perform: (action: GameAction) => void;
}

/** The village's mood on the hub: a festival banner, tonight's sight, and today's gossip. */
export function VillageLife({ view, perform }: VillageLifeProps) {
  const { festival, night, rumours } = view;
  if (!festival && !night && rumours.length === 0) return null;
  return (
    <section className="village-life" aria-label="Village life">
      {festival && !festival.today && (
        <p className="festival-soon">
          <span className="festival-when">{festival.when}</span> {festival.name}
        </p>
      )}
      {festival?.today && (
        <div className="festival today">
          <span className="festival-when">{festival.when}</span>
          <b>{festival.name}</b>
          <p>{festival.description}</p>
          <span className="chips">
            {festival.perks.map((perk) => (
              <span key={perk} className="chip gain">
                {perk}
              </span>
            ))}
          </span>
        </div>
      )}
      {night?.kind === 'seen' && (
        <div className="night-sight">
          <b>{night.title}</b>
          <p>{night.text}</p>
          <button
            type="button"
            className="btn small"
            disabled={night.follow.blocker !== null}
            onClick={() => {
              perform(night.follow.action);
            }}
          >
            Follow it
          </button>
          {night.follow.blocker && <small className="blocker">{night.follow.blocker}</small>}
        </div>
      )}
      {night?.kind === 'unseen' && <p className="night-hint">{night.text}</p>}
      {rumours.length > 0 && (
        <details className="rumours">
          <summary>
            <span className="label">Village talk</span>
            <span className="rumour-first">{rumours[0]}</span>
          </summary>
          <ul>
            {rumours.slice(1).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
