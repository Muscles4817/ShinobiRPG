import type { Discipline, JutsuCard, JutsuEffect } from '@/game';

import { TechniqueSheet } from './TechniqueSheet';

const EFFECT_TEXT: Readonly<Record<JutsuEffect['verb'], (power: number) => string>> = {
  damage: (power) => `Power ${power}`,
  daze: () => 'Dazes',
  heal: () => 'Heals',
  seal: () => 'Seals',
  area: (power) => `Power ${power} on every foe`,
  confuse: () => 'Confuses',
  conceal: () => 'Hides you',
  sense: () => 'Finds the hidden',
  break: (power) => `Power ${power} through guard`,
  field: () => 'Blinds foes for a while',
  move: () => 'Moves you in a flash',
  substitute: () => 'Swaps you out of a hit',
  empower: () => 'Pushes past your limits, at a price',
  clone: () => 'Makes clones that take hits',
  trap: (power) => `Sets a trap of power ${power}`,
  knock: () => 'Throws them to another distance',
  pin: () => 'Pins them',
  drain: () => 'Drains chakra',
  afflict: () => 'Leaves a lingering wound',
  counter: () => 'Readies a riposte',
  summon: () => 'Calls a summon',
  shroud: () => 'Cast armour',
};

/** Each effect in order: "Power 12, then dazes". */
function effectText(effects: readonly JutsuEffect[]): string {
  const [first, ...rest] = effects.map((e) => EFFECT_TEXT[e.verb](e.power));
  return [first, ...rest.map((t) => t.toLowerCase())].join(', then ');
}

export const DISCIPLINE_LABELS: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

/** A card's line: how far it is learned, or what it does for what. */
export function cardDetail(card: JutsuCard): string {
  if (card.status === 'studying') return `Studying, ${card.progressPct}% learned`;
  if (card.status === 'unknown') return 'Not learned';
  return `${effectText(card.effects)} for ${card.chakraCost} chakra`;
}

/**
 * A technique read in full beside its card: name, art and rank, what it is, and its sheet. The
 * Jutsu tab shows the card picked or pointed at; a fight's plan screen the card pointed at.
 */
export function JutsuDetail({ card }: { readonly card: JutsuCard }) {
  const known = card.status !== 'unknown';
  const title = known ? card.name : 'Undiscovered technique';
  return (
    <section className="detail-card" aria-label={`Technique: ${title}`}>
      <b>
        {title} <span className={`badge d-${card.discipline}`}>{card.discipline}</span>
        <span className="badge" data-grade={card.rank}>
          Rank {card.rank}
        </span>
        {card.unstable && <span className="badge unstable">Unstable</span>}
        {card.element && <span className="chip"> {card.element}</span>}
      </b>
      {known && <p className="story">{card.description}</p>}
      <p className="muted small">{cardDetail(card)}</p>
      {known && <TechniqueSheet sheet={card.sheet} />}
      {card.unstable && (
        <p className="muted small">
          Beyond your grade: it costs more chakra and can misfire. It steadies once your{' '}
          {DISCIPLINE_LABELS[card.discipline].toLowerCase()} reaches grade {card.rank}.
        </p>
      )}
    </section>
  );
}
