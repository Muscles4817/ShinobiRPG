import { compoundView, headerView, quarterView, type PersonCard } from '@/game';

import { Avatar } from '../../components/Faces';
import { BondMeter } from '../../components/BondMeter';
import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

interface QuarterProps extends PlaceProps {
  readonly onOpenPlace: (placeId: string) => void;
}

/** The clans' quarter: a gate for each clan, how it treats outsiders, and who is home. */
export function QuarterPage({ ctx, state, onBack, onOpenPlace }: QuarterProps) {
  const view = quarterView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={view.blurb}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page quarter">
        {view.compounds.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`gate${c.shut ? ' shut' : ''}`}
            onClick={() => {
              onOpenPlace(c.id);
            }}
          >
            <b>{c.name}</b>
            <small>{c.stance}</small>
            <small>{c.shut ?? (c.home === 0 ? 'Nobody home' : `${c.home} home`)}</small>
          </button>
        ))}
      </main>
    </>
  );
}

function Resident({ card, perform }: { readonly card: PersonCard } & Pick<PlaceProps, 'perform'>) {
  return (
    <div className="bond-card">
      <Avatar face={card} size={44} />
      <span className="bond-main">
        <b>{card.fullName}</b>
        <small>{card.title}</small>
        <BondMeter stageName={card.stageName} progress={card.progress} />
      </span>
      <button
        type="button"
        className="btn small"
        disabled={card.talk.blocker !== null}
        title={card.talk.blocker ?? undefined}
        onClick={() => {
          perform(card.talk.action);
        }}
      >
        Talk
      </button>
    </div>
  );
}

/** A clan's compound: the gate, the head, and whoever is home if you are let in. */
export function CompoundPage({
  ctx,
  state,
  perform,
  onBack,
  placeId,
}: PlaceProps & { readonly placeId: string }) {
  const view = compoundView(state, ctx, placeId);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={view.stance}
        slot={header.slot}
        onBack={onBack}
        backLabel="The quarter"
      />
      <main className="page compound">
        <p className="story">{view.description}</p>
        {view.head && <p className="muted small">Head of the clan: {view.head}</p>}
        {view.shut && <p className="gate-note">{view.shut}</p>}
        {!view.shut && view.home.length === 0 && <p className="muted">Nobody is home just now.</p>}
        {view.home.map((card) => (
          <Resident key={card.id} card={card} perform={perform} />
        ))}
      </main>
    </>
  );
}
