import { headerView, wildsView, type WhatsAbout } from '@/game';

import { Banner } from '../../components/Banner';
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

/**
 * A wild place outside the village: forage the ground for what's in season, or pick a spot on
 * the water and cast a line. Each gives once a day.
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
      </main>
    </>
  );
}
