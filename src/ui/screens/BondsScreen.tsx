import { bondsView, type PersonCard } from '@/game';

import { useRoomyDesk } from '../layout/useWideScreen';
import { BondCard, CompanionSlip } from './bonds/BondCards';
import { BondsDesk } from './bonds/BondsDesk';
import type { BondsProps } from './types';

/**
 * 縁 Bonds: your companion and your team first, then everyone you know, closest first; strangers
 * fold away. A roomy desk sets the list beside the page of whoever you pick.
 */
export function BondsScreen(props: BondsProps) {
  const roomy = useRoomyDesk();
  return roomy ? <BondsDesk {...props} /> : <BondsList {...props} />;
}

function BondsList({ ctx, state, onOpenPerson, onOpenCompanion }: BondsProps) {
  const view = bondsView(state, ctx);
  const card = (c: PersonCard) => (
    <BondCard
      key={c.id}
      card={c}
      onOpen={() => {
        onOpenPerson(c.id);
      }}
    />
  );
  return (
    <main className="page bonds">
      <header className="plain-head">
        <p className="label">縁 Bonds</p>
        <h1>The people in your life</h1>
      </header>
      {view.companion && (
        <section className="bond-group">
          <h2 className="label">At your side</h2>
          <CompanionSlip card={view.companion} onOpen={onOpenCompanion} />
        </section>
      )}
      {view.team.length > 0 && (
        <section className="bond-group">
          <h2 className="label">Your team</h2>
          {view.team.map(card)}
        </section>
      )}
      {view.known.length > 0 && (
        <section className="bond-group">
          <h2 className="label">People you know</h2>
          {view.known.map(card)}
        </section>
      )}
      {view.strangers.length > 0 && (
        <details className="bond-group fold">
          <summary className="label">
            {view.strangers.length} more to meet around the village
          </summary>
          {view.strangers.map(card)}
        </details>
      )}
    </main>
  );
}
