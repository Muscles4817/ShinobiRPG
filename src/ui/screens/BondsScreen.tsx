import { bondsView, type CompanionCard, type PersonCard } from '@/game';

import { Avatar } from '../components/Faces';
import { BondMeter } from '../components/BondMeter';
import type { ScreenProps } from './types';

interface BondsScreenProps extends ScreenProps {
  readonly onOpenPerson: (personId: string) => void;
}

/** "At the Forge" reads "Jōnin, at the Forge" after their rank. */
function midSentence(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function BondCard({ card, onOpen }: { readonly card: PersonCard; readonly onOpen: () => void }) {
  return (
    <button type="button" className="bond-card" onClick={onOpen}>
      <Avatar face={card} size={44} />
      <span className="bond-main">
        <b>{card.fullName}</b>
        <small>
          {card.title}, {midSentence(card.where)}
        </small>
        <BondMeter stageName={card.stageName} progress={card.progress} />
      </span>
      {card.specialty && (
        <span className={`badge d-${card.specialty.id}`}>{card.specialty.label}</span>
      )}
    </button>
  );
}

/** Your companion: what it is, how close you are, what it takes from you in a fight. */
function CompanionSlip({ card }: { readonly card: CompanionCard }) {
  return (
    <article className="bond-card companion-card">
      <span className="bond-main">
        <b>{card.name}</b>
        <small>{card.description}</small>
        <BondMeter stageName={card.stageName} progress={card.progress} />
        <small>{card.orders}</small>
        <small>Best at {card.standouts.join(', ')}.</small>
      </span>
      <span className="badge">{card.kind}</span>
    </article>
  );
}

/** 縁 Bonds: your companion and your team first, then everyone you know, closest first; strangers fold away. */
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
        <p className="label">縁 Bonds</p>
        <h1>The people in your life</h1>
      </header>
      {view.companion && (
        <section className="bond-group">
          <h2 className="label">At your side</h2>
          <CompanionSlip card={view.companion} />
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
