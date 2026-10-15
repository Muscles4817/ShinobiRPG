import { headerView, onsenView, type OnsenView } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import { Chips } from '../../components/Chips';
import { Avatar } from '../../components/Faces';
import type { PlaceProps } from '../types';
import { ToneStamp } from './ToneStamp';

type Perform = PlaceProps['perform'];

/**
 * The hot water: a wooden bath token from the keeper (what a soak costs and gives back), and
 * the steaming water itself, with whoever is already in it to soak beside.
 */
export function OnsenPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = onsenView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={view.keeper}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page onsen">
        {view.closed ? (
          <p className="onsen-closed">{view.closed} The water steams on its own behind the rope.</p>
        ) : (
          <>
            <BathToken view={view} perform={perform} />
            <Water view={view} perform={perform} />
          </>
        )}
      </main>
    </>
  );
}

/** The keeper's wooden token: the price, what a soak gives, and a soak on your own. */
function BathToken({ view, perform }: { readonly view: OnsenView; readonly perform: Perform }) {
  return (
    <section className="bath-token" aria-label="A soak">
      <h2>
        <Icon id="spring" size={22} /> {view.waters === 'spring' ? 'The springs' : 'The baths'}
      </h2>
      <p className="bath-price num">{view.soakCost} ryo</p>
      <Chips
        chips={[
          { label: `Energy +${view.energy}`, tone: 'gain' },
          { label: `Health +${view.health}`, tone: 'gain' },
          ...view.warmth,
        ]}
      />
      <p className="bath-note">
        {view.soaked
          ? 'You’re warm through until the day ends.'
          : 'Warm through until the day ends. One soak a day.'}
      </p>
      <button
        type="button"
        className="btn wide"
        disabled={view.alone.blocker !== null}
        onClick={() => {
          perform(view.alone.action);
        }}
      >
        Soak on your own
      </button>
      {view.alone.blocker && <p className="bath-blocker small">{view.alone.blocker}</p>}
    </section>
  );
}

/** Who is in the water: a quiet hour beside one of them is your time together today. */
function Water({ view, perform }: { readonly view: OnsenView; readonly perform: Perform }) {
  return (
    <section className="bath-water" aria-label="In the water">
      <h2 className="label">In the water</h2>
      <p className="story">{view.blurb}</p>
      {view.bathers.length === 0 ? (
        <p className="muted">Nobody you know is in the water.</p>
      ) : (
        <ul className="bathers">
          {view.bathers.map((b) => (
            <li key={b.face.id} className="bather">
              <Avatar face={b.face} size={44} />
              <span className="bather-who">
                <b>{b.face.name}</b>
                <small className="muted">{b.stage}</small>
                <ToneStamp read={b.read} />
              </span>
              <button
                type="button"
                className="btn small"
                disabled={b.soak.blocker !== null}
                aria-label={`Soak beside ${b.face.name}`}
                onClick={() => {
                  perform(b.soak.action);
                }}
              >
                Soak beside
              </button>
              {b.soak.blocker && b.soak.blocker !== view.alone.blocker && (
                <small className="blocker">{b.soak.blocker}</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
