import { useState } from 'react';

import { jutsuDeck, type Discipline, type JutsuCard, type JutsuEffect } from '@/game';

import { TechniqueCard } from '../components/TechniqueCard';
import { TechniqueSheet } from '../components/TechniqueSheet';
import { Pane } from '../layout/Pane';
import type { ScreenProps } from './types';

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
};

/** Each effect in order: "Power 12, then dazes". */
function effectText(effects: readonly JutsuEffect[]): string {
  const [first, ...rest] = effects.map((e) => EFFECT_TEXT[e.verb](e.power));
  return [first, ...rest.map((t) => t.toLowerCase())].join(', then ');
}

const DISCIPLINE_ORDER = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

const FILTER_LABELS: Readonly<Record<Discipline | 'all', string>> = {
  all: 'All',
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function cardDetail(card: JutsuCard): string {
  if (card.status === 'studying') return `Studying, ${card.progressPct}% learned`;
  if (card.status === 'unknown') return 'Not learned';
  return `${effectText(card.effects)} for ${card.chakraCost} chakra`;
}

/** Your techniques as a deck of the same cards you play in fights. */
export function JutsuScreen({ ctx, state }: ScreenProps) {
  const deck = jutsuDeck(state, ctx);
  const [filter, setFilter] = useState<Discipline | 'all'>('all');
  const [selectedId, setSelectedId] = useState(deck[0]?.id);
  const inFilter = deck.filter((c) => filter === 'all' || c.discipline === filter);
  const shown = inFilter.filter((c) => c.status !== 'unknown');
  const undiscovered = DISCIPLINE_ORDER.map((d) => ({
    discipline: d,
    count: inFilter.filter((c) => c.status === 'unknown' && c.discipline === d).length,
  })).filter((g) => g.count > 0);
  const selected = deck.find((c) => c.id === selectedId);
  const known = deck.filter((c) => c.status === 'known').length;
  return (
    <>
      <header className="plain-head">
        <h1>Jutsu</h1>
        <p className="label">
          {known} known, {deck.length - known} to discover
        </p>
      </header>
      <main className="page">
        <Pane name="deck">
          <div className="filters" role="group" aria-label="Filter techniques">
            {(['all', 'taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter d-${f}${f === filter ? ' on' : ''}`}
                  onClick={() => {
                    setFilter(f);
                  }}
                >
                  {FILTER_LABELS[f]}
                </button>
              ),
            )}
          </div>
          <div className="deck">
            {shown.map((c) => (
              <button
                key={c.id}
                type="button"
                className={c.id === selectedId ? 'deck-slot on' : 'deck-slot'}
                onClick={() => {
                  setSelectedId(c.id);
                }}
              >
                <TechniqueCard
                  name={c.status === 'unknown' ? '?' : c.name}
                  detail={cardDetail(c)}
                  discipline={c.discipline}
                  ghost={c.status !== 'known'}
                  rank={c.rank}
                  unstable={c.unstable}
                />
              </button>
            ))}
          </div>
          {undiscovered.length > 0 && (
            <section className="undiscovered" aria-label="To discover">
              <h2 className="label">Still to discover</h2>
              <div className="undiscovered-row">
                {undiscovered.map((g) => (
                  <span key={g.discipline} className={`badge d-${g.discipline}`}>
                    {FILTER_LABELS[g.discipline]} {g.count}
                  </span>
                ))}
              </div>
              <p className="muted small">
                Scrolls at the Academy, your clan and your sensei teach the rest.
              </p>
            </section>
          )}
        </Pane>
        <Pane name="detail">
          {selected && (
            <section className="detail-card">
              <b>
                {selected.status === 'unknown' ? 'Undiscovered technique' : selected.name}{' '}
                <span className={`badge d-${selected.discipline}`}>{selected.discipline}</span>
                <span className="badge" data-grade={selected.rank}>
                  Rank {selected.rank}
                </span>
                {selected.unstable && <span className="badge unstable">Unstable</span>}
                {selected.element && <span className="chip"> {selected.element}</span>}
              </b>
              {selected.status !== 'unknown' && <p className="story">{selected.description}</p>}
              <p className="muted small">{cardDetail(selected)}</p>
              {selected.status !== 'unknown' && <TechniqueSheet sheet={selected.sheet} />}
              {selected.unstable && (
                <p className="muted small">
                  Beyond your grade: it costs more chakra and can misfire. It steadies once your{' '}
                  {FILTER_LABELS[selected.discipline].toLowerCase()} reaches grade {selected.rank}.
                </p>
              )}
            </section>
          )}
        </Pane>
      </main>
    </>
  );
}
