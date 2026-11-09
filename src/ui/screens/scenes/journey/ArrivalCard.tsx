import type { Arrival, TimeSlot } from '@/game';

import { Backdrop } from '../../../art/Backdrop';

/** The place you walk into, as a title card over the map: its scene, its name, its epithet. */
export function ArrivalCard({
  arrival,
  slot,
}: {
  readonly arrival: Arrival;
  readonly slot: TimeSlot;
}) {
  return (
    <div className="journey-arrival sky" data-slot={slot} data-land={arrival.backdrop}>
      <Backdrop id={arrival.backdrop} />
      <div className="journey-arrival-title">
        <p>{arrival.line}</p>
        <h2>{arrival.name}</h2>
        <p className="journey-arrival-epithet">{arrival.epithet}</p>
      </div>
    </div>
  );
}
