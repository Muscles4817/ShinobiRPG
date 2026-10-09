import { bondsView, type PersonCard } from '@/game';

import { Avatar } from '../components/Faces';
import { BondMeter } from '../components/BondMeter';
import type { ScreenProps } from './types';

interface BondsScreenProps extends ScreenProps {
  readonly onOpenPerson: (personId: string) => void;
}

function BondCard({ card, onOpen }: { readonly card: PersonCard; readonly onOpen: () => void }) {
  return (
    <button type="button" className="bond-card" onClick={onOpen}>
      <Avatar face={card} size={44} />
      <span className="bond-main">
        <b>{card.fullName}</b>
        <small>
          {card.title} · {card.where}
        </small>
        <BondMeter stageName={card.stageName} progress={card.progress} />
      </span>
      {card.specialty && (
        <span className={`badge d-${card.specialty.id}`}>{card.specialty.label}</span>
      )}
    </button>
  );
}

/** 縁 Bonds: your team first, then everyone you know, closest first; strangers fold away. */
export function BondsScreen({ ctx, state, onOpenPerson }: BondsScreenProps) {
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
        <p className="label">縁 · Bonds</p>
        <h1>The people in your life</h1>
      </header>
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
          <summary className="label">Around the village · {view.strangers.length} to meet</summary>
          {view.strangers.map(card)}
        </details>
      )}
    </main>
  );
}
