import type { GameAction, StrayNotice, VillageView } from '@/game';

interface VillageLifeProps {
  readonly view: VillageView;
  readonly perform: (action: GameAction) => void;
}

/** Tonight's sight, for eyes that can follow it. */
function NightCard({
  night,
  perform,
}: {
  readonly night: Extract<VillageView['night'], { kind: 'seen' }>;
  readonly perform: VillageLifeProps['perform'];
}) {
  return (
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
  );
}

/** A stray about in the village: where, and spending a little time with it. */
function StrayCard({
  stray,
  perform,
}: {
  readonly stray: StrayNotice;
  readonly perform: VillageLifeProps['perform'];
}) {
  return (
    <div className="stray">
      <b>{stray.where}</b>
      <p>{stray.text}</p>
      <button
        type="button"
        className="btn small"
        disabled={stray.befriend.blocker !== null}
        onClick={() => {
          perform(stray.befriend.action);
        }}
      >
        {stray.visits === 0 ? 'Crouch and wait' : 'Spend time with it'}
      </button>
      {stray.visits > 0 && (
        <small>
          It knows you a little now: <span className="num">{stray.visits}</span> of{' '}
          <span className="num">{stray.needed}</span> days.
        </small>
      )}
      {stray.befriend.blocker && <small className="blocker">{stray.befriend.blocker}</small>}
    </div>
  );
}

/** The village's mood on the hub: a festival banner, tonight's sight, and today's gossip. */
export function VillageLife({ view, perform }: VillageLifeProps) {
  const { festival, night, rumours, stray } = view;
  if (!festival && !night && !stray && rumours.length === 0) return null;
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
      {night?.kind === 'seen' && <NightCard night={night} perform={perform} />}
      {night?.kind === 'unseen' && <p className="night-hint">{night.text}</p>}
      {stray && <StrayCard stray={stray} perform={perform} />}
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
