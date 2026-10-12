import type { ScrollDesk as Desk } from '@/game';

import type { PlaceProps } from '../types';
import { ScrollRow } from './ScrollRow';

interface ScrollDeskProps {
  readonly desk: Desk;
  readonly perform: PlaceProps['perform'];
}

/** The low reading desk: scrolls you own (mission rewards, gifts) and haven't learned yet. */
export function ScrollDesk({ desk, perform }: ScrollDeskProps) {
  if (desk.scrolls.length === 0) return null;
  return (
    <section id="scroll-desk" className="reading-desk" aria-label="Your scrolls">
      <h2>Your scrolls</h2>
      <p className="muted small">
        {desk.blocker ?? 'Your own copies, read at the pace of a bare scroll.'}
      </p>
      <div className="rack">
        {desk.scrolls.map((s) => (
          <ScrollRow key={s.id} scroll={s} perform={perform} />
        ))}
      </div>
    </section>
  );
}
