import { useState } from 'react';

import { headerView, vetView, type Choice, type GameAction } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

/** One action on a clinic slip, with its reason when shut. */
function SlipAction({
  label,
  choice,
  perform,
  wide = false,
}: {
  readonly label: string;
  readonly choice: Choice;
  readonly perform: (action: GameAction) => void;
  readonly wide?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        className={wide ? 'btn wide' : 'btn'}
        disabled={choice.blocker !== null}
        onClick={() => {
          perform(choice.action);
        }}
      >
        {label}
      </button>
      {choice.blocker && <p className="muted small">{choice.blocker}</p>}
    </>
  );
}

/** Rehoming your companion: asked twice, since it can't be undone. */
function Rehome({
  rehome,
  perform,
}: {
  readonly rehome: NonNullable<ReturnType<typeof vetView>>['rehome'];
  readonly perform: (action: GameAction) => void;
}) {
  const [asked, setAsked] = useState(false);
  if (!rehome) return null;
  return (
    <section className="room-slip">
      <h2>Rehome {rehome.name}</h2>
      <p className="muted small">{rehome.line}</p>
      {asked ? (
        <SlipAction label={`Yes, let ${rehome.name} go`} choice={rehome} perform={perform} />
      ) : (
        <button
          type="button"
          className="btn ghost"
          disabled={rehome.blocker !== null}
          onClick={() => {
            setAsked(true);
          }}
        >
          Ask the vet to rehome {rehome.name}
        </button>
      )}
    </section>
  );
}

/**
 * The animal clinic: the vet, a treatment for your companion, medicine to take home, the
 * kennel's litter, an animal you rescued waiting for you, and rehoming.
 */
export function VetPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = vetView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={`${view.vet}. ${view.blurb}`}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        {view.rescued && (
          <section className="room-slip">
            <h2>{view.rescued.name} is waiting</h2>
            <p className="story">
              The {view.rescued.kind.toLowerCase()} you rescued is fed and dry in the back room, and
              perks up at your voice.
            </p>
            <p className="room-price free">Yours to take</p>
            <SlipAction
              label={`Take ${view.rescued.name} home`}
              choice={view.rescued.take}
              perform={perform}
              wide
            />
          </section>
        )}
        <section className="room-slip">
          <h2>Treatment</h2>
          {view.patient && <p className="story">{view.patient}</p>}
          <p className={view.fee === 0 ? 'room-price free num' : 'room-price num'}>
            {view.fee === 0 ? 'Free to the clan' : `${view.fee} ryo`}
          </p>
          <SlipAction label="Have the vet treat it" choice={view.treat} perform={perform} wide />
        </section>
        {view.pups && (
          <section className="room-slip">
            <h2>The litter</h2>
            <p className="person-tags">
              <span className="badge">{view.pups.kind}</span>
            </p>
            <p className="story">{view.pups.line}</p>
            <p className="muted small">{view.pups.future}</p>
            <p className={view.pups.price === 0 ? 'room-price free num' : 'room-price num'}>
              {view.pups.price === 0 ? 'A gift, for a friend' : `${view.pups.price} ryo`}
            </p>
            {view.pups.gift && <p className="muted small">{view.pups.gift}</p>}
            <SlipAction label="Take a pup home" choice={view.pups.take} perform={perform} wide />
          </section>
        )}
        <section className="room-slip">
          <h2>Medicine</h2>
          <p className="muted small">
            A dose takes a day off a companion’s rest. Hidden in food it goes down unnoticed.
          </p>
          <p className="chips">
            <span className="chip num">
              {view.doses} {view.doses === 1 ? 'dose' : 'doses'} carried
            </span>
            <span className="chip cost num">{view.medicineCost} ryo a dose</span>
          </p>
          <SlipAction label="Buy a dose" choice={view.buyMedicine} perform={perform} />
        </section>
        <Rehome rehome={view.rehome} perform={perform} />
      </main>
    </>
  );
}
