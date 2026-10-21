import type { GameAction, StrayNotice, VillageView } from '@/game';

import { ProgressDots } from '../components/ProgressDots';

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
          It knows you a little now <ProgressDots done={stray.visits} of={stray.needed} />. Come
          back tomorrow; it moves about the village.
        </small>
      )}
      {stray.befriend.blocker && <small className="blocker">{stray.befriend.blocker}</small>}
    </div>
  );
}

/** What the town holds against you, and what it costs you. */
function GreetingCard({ greeting }: { readonly greeting: VillageView['greetings'][number] }) {
  return (
    <div className="town-greeting">
      <p>{greeting.line}</p>
      <span className="chips">
        {greeting.chips.map((c) => (
          <span key={c} className="chip cost">
            {c}
          </span>
        ))}
      </span>
    </div>
  );
}

/** Whether there is nothing of the village's mood to show today. */
function quiet({ greetings, festival, night, rumours, stray }: VillageView): boolean {
  return greetings.length === 0 && !festival && !night && !stray && rumours.length === 0;
}

/**
 * The village's mood on the hub: what it holds against you, a festival banner, tonight's sight,
 * and today's gossip.
 */
export function VillageLife({ view, perform }: VillageLifeProps) {
  const { greetings, festival, night, rumours, stray } = view;
  if (quiet(view)) return null;
  return (
    <section className="village-life" aria-label="Village life">
      {greetings.map((g) => (
        <GreetingCard key={g.line} greeting={g} />
      ))}
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
