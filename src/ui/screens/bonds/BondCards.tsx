import type { CompanionCard, PersonCard } from '@/game';

import { BondMeter } from '../../components/BondMeter';
import { Avatar } from '../../components/Faces';
import type { HoverHandlers } from '../../layout/useHoverPreview';

/** The cards of the Bonds tab: a person, and your companion. */

/** "At the Forge" reads "Jōnin, at the Forge" after their rank. */
function midSentence(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

interface BondCardProps {
  readonly card: PersonCard;
  readonly onOpen: () => void;
  /** On a desk: the person whose page is open beside the list. */
  readonly current?: boolean;
  readonly hover?: HoverHandlers;
}

export function BondCard({ card, onOpen, current = false, hover }: BondCardProps) {
  return (
    <button
      type="button"
      className={current ? 'bond-card on' : 'bond-card'}
      aria-current={current ? 'true' : undefined}
      onClick={onOpen}
      {...hover}
    >
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
export function CompanionSlip({
  card,
  onOpen,
}: {
  readonly card: CompanionCard;
  readonly onOpen: () => void;
}) {
  return (
    <button type="button" className="bond-card companion-card" onClick={onOpen}>
      <span className="bond-main">
        <b>{card.name}</b>
        <small>{card.description}</small>
        <BondMeter stageName={card.stageName} progress={card.progress} />
        <small>{card.orders}</small>
        <small>Best at {card.standouts.join(', ')}.</small>
      </span>
      <span className="badge">{card.kind}</span>
    </button>
  );
}
