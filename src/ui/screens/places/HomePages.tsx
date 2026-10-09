import { headerView, homeView, hospitalView, type Choice } from '@/game';

import { Room } from '../../art/Room';
import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

interface HotspotProps {
  readonly label: string;
  readonly choice?: Choice;
  readonly className: string;
  readonly perform: PlaceProps['perform'];
}

/** A tappable object in the room. Without a choice it's a "coming soon" object. */
function Hotspot({ label, choice, className, perform }: HotspotProps) {
  return (
    <button
      type="button"
      className={`hotspot ${className}${choice ? '' : ' soon'}`}
      disabled={choice?.blocker !== null}
      title={choice?.blocker ?? undefined}
      onClick={() => {
        if (choice) perform(choice.action);
      }}
    >
      {label}
    </button>
  );
}

/** Your room, drawn; its objects are the actions. The deed card holds rent and property. */
export function HomePage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = homeView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <div className="room">
        <Room slot={view.slot} />
        <button type="button" className="back on-art" onClick={onBack}>
          ‹ {header.location}
        </button>
        <div className="room-title">
          <p className="label">
            {view.name} · {view.slot}
          </p>
          <h1>{view.lodging}</h1>
        </div>
        <Hotspot
          className="hs-futon"
          label="Futon · Sleep till dawn"
          choice={view.sleep}
          perform={perform}
        />
        <Hotspot className="hs-kettle" label="Kettle · Nap" choice={view.nap} perform={perform} />
        <Hotspot className="hs-chest" label="Chest · Storage soon" perform={perform} />
        <Hotspot className="hs-shrine" label="Shrine · Pray soon" perform={perform} />
      </div>
      <main className="page">
        <section className="deed">
          <div className="deed-head">
            <h2>Your place</h2>
            <span className={view.overdue ? 'chip harm' : 'chip'}>
              {view.rentFree ? 'Family home' : 'Rented'}
            </span>
          </div>
          <dl className="kv">
            <dt>Rent</dt>
            <dd className="num">{view.rentFree ? 'None' : `${view.rentPerWeek} ryo / week`}</dd>
            <dt>Status</dt>
            <dd className={view.overdue ? 'harm' : ''}>{view.rentStatus}</dd>
            <dt>Sleep</dt>
            <dd>{view.sleepQuality}</dd>
          </dl>
          <div className="row-buttons">
            <button
              type="button"
              className="btn"
              disabled={view.sleep.blocker !== null}
              onClick={() => {
                perform(view.sleep.action);
              }}
            >
              Sleep till dawn
            </button>
            {!view.rentFree && (
              <button
                type="button"
                className="btn ghost"
                disabled={view.payRent.blocker !== null}
                onClick={() => {
                  perform(view.payRent.action);
                }}
              >
                Pay rent
              </button>
            )}
          </div>
          {!view.rentFree && view.payRent.blocker && (
            <p className="muted small">{view.payRent.blocker}</p>
          )}
          {view.nap.blocker && <p className="muted small">Nap: {view.nap.blocker}</p>}
        </section>
      </main>
    </>
  );
}

export function HospitalPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = hospitalView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  const pct = Math.round((view.health / view.maxHealth) * 100);
  return (
    <>
      <Banner
        title={view.name}
        subtitle="Medical ninja on call"
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        <section className="ward">
          <p className="label">Your condition</p>
          <p className="ward-health num">
            {view.health} <small>/ {view.maxHealth}</small>
          </p>
          <span className="budget-bar health">
            <i style={{ width: `${pct}%` }} />
          </span>
          <p className="story">
            {pct >= 100
              ? 'The medic waves you off. Nothing to treat.'
              : 'A medic looks you over and frowns at the bruises.'}
          </p>
          <button
            type="button"
            className="btn wide"
            disabled={view.treat.blocker !== null}
            onClick={() => {
              perform(view.treat.action);
            }}
          >
            Full treatment · {view.cost} ryo
          </button>
          {view.treat.blocker && <p className="muted small">{view.treat.blocker}</p>}
        </section>
      </main>
    </>
  );
}
