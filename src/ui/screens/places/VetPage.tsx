import { headerView, vetView } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

/** The animal clinic's counter: the vet, a treatment for your companion, and medicine to take home. */
export function VetPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = vetView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={view.vet}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        <section className="room-slip">
          <h2>{view.blurb}</h2>
          {view.patient && <p className="story">{view.patient}</p>}
          <p className="room-price num">
            {view.fee === 0 ? 'Free to the clan' : `${view.fee} ryo`}
          </p>
          <button
            type="button"
            className="btn wide"
            disabled={view.treat.blocker !== null}
            onClick={() => {
              perform(view.treat.action);
            }}
          >
            Have the vet treat it
          </button>
          {view.treat.blocker && <p className="muted small">{view.treat.blocker}</p>}
        </section>
        <section className="room-slip">
          <h2>Medicine</h2>
          <p className="muted small num">
            {view.doses} {view.doses === 1 ? 'dose' : 'doses'} carried. {view.medicineCost} ryo a
            dose.
          </p>
          <button
            type="button"
            className="btn"
            disabled={view.buyMedicine.blocker !== null}
            onClick={() => {
              perform(view.buyMedicine.action);
            }}
          >
            Buy a dose
          </button>
          {view.buyMedicine.blocker && <p className="muted small">{view.buyMedicine.blocker}</p>}
        </section>
      </main>
    </>
  );
}
