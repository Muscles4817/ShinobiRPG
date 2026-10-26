import { headerView, wildsView, type GameAction, type WhatsAbout, type WildsView } from '@/game';

import { Banner } from '../../components/Banner';
import { ProgressDots } from '../../components/ProgressDots';
import type { PlaceProps } from '../types';

/** "Wild Mushrooms and Chestnuts, and something you don't know." */
function aboutLine(about: WhatsAbout): string {
  const strange = about.strange > 0 ? 'something you wouldn’t know for food yet' : null;
  const parts = [...about.known, ...(strange ? [strange] : [])];
  return parts.length > 0 ? `About now: ${parts.join(', ')}.` : 'Nothing about at this hour.';
}

function GatherCard(props: {
  readonly title: string;
  readonly text: string;
  readonly about: WhatsAbout;
  readonly blocker: string | null;
  readonly label: string;
  readonly onGo: () => void;
}) {
  return (
    <article className="gather-card">
      <h3>{props.title}</h3>
      <p className="muted small">{props.text}</p>
      <p className="small">{aboutLine(props.about)}</p>
      {props.blocker && <p className="blocker">{props.blocker}</p>}
      <button type="button" className="btn" disabled={props.blocker !== null} onClick={props.onGo}>
        {props.label}
      </button>
    </article>
  );
}

/** Signs of a wild one living here, and days spent tracking it. */
function TrackCard({
  wild,
  perform,
}: {
  readonly wild: NonNullable<WildsView['wild']>;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <article className="gather-card">
      <h3>Signs of a {wild.kind.toLowerCase()}</h3>
      <p className="story">{wild.sign}</p>
      <p className="muted small">
        {wild.odds} <span className="chip cost num">−{wild.energy} energy</span>
      </p>
      {wild.days > 0 && (
        <p className="small">
          It knows your scent now <ProgressDots done={wild.days} of={wild.needed} />
        </p>
      )}
      {wild.track.blocker && <p className="blocker">{wild.track.blocker}</p>}
      <button
        type="button"
        className="btn"
        disabled={wild.track.blocker !== null}
        onClick={() => {
          perform(wild.track.action);
        }}
      >
        {wild.days === 0 ? 'Follow the trail' : 'Track it again'}
      </button>
    </article>
  );
}

/** Going off the paths into wild country, as deep as you choose. */
function VentureCard({
  venture,
  perform,
}: {
  readonly venture: NonNullable<WildsView['venture']>;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <article className="gather-card">
      <h3>Off the paths</h3>
      <p className="story">
        Leave the path and go into {venture.country}, a day for each depth and back out the way you
        came. The deeper you go, the stranger it gets.
      </p>
      {venture.depths.map((d) => (
        <div key={d.depth}>
          {d.blocker && <p className="blocker">{d.blocker}</p>}
          <button
            type="button"
            className="btn"
            disabled={d.blocker !== null}
            onClick={() => {
              perform(d.action);
            }}
          >
            {d.label}
          </button>
        </div>
      ))}
    </article>
  );
}

/**
 * A wild place outside the village: forage the ground for what's in season, or pick a spot on
 * the water and cast a line. Each gives once a day. Some wild places have a wild one living
 * in them, to be tracked over days.
 */
export function WildsPage({
  ctx,
  state,
  perform,
  onBack,
  placeId,
}: PlaceProps & { readonly placeId: string }) {
  const view = wildsView(state, ctx, placeId);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner title={view.name} slot={header.slot} onBack={onBack} backLabel={header.location} />
      <main className="page wilds">
        <p className="muted">{view.blurb}</p>
        <GatherCard
          title="Forage"
          text="Search the ground for anything worth cooking. A sharp eye finds more."
          about={view.forage.about}
          blocker={view.forage.blocker}
          label="Search"
          onGo={() => {
            perform(view.forage.action);
          }}
        />
        {view.spots.length > 0 && <h2 className="label">Fishing</h2>}
        {view.spots.map((spot) => (
          <GatherCard
            key={spot.id}
            title={spot.name}
            text={spot.description}
            about={spot.bites}
            blocker={spot.blocker}
            label="Cast a line"
            onGo={() => {
              perform(spot.action);
            }}
          />
        ))}
        {view.wild && <TrackCard wild={view.wild} perform={perform} />}
        {view.venture && <VentureCard venture={view.venture} perform={perform} />}
        {view.insects && (
          <article className="gather-card">
            <h3>Insects</h3>
            <p className="story">
              {view.insects.about.length > 0
                ? `${view.insects.about.join(' and ')} live here. A few would go in a jar.`
                : 'Nothing here worth a jar right now.'}
            </p>
            {view.insects.blocker && <p className="blocker">{view.insects.blocker}</p>}
            <button
              type="button"
              className="btn"
              disabled={view.insects.blocker !== null}
              onClick={() => {
                if (view.insects) perform(view.insects.action);
              }}
            >
              Search for insects
            </button>
          </article>
        )}
      </main>
    </>
  );
}
