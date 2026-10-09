import { useState } from 'react';

import { jutsuDeck, type Discipline, type JutsuCard } from '@/game';

import { TechniqueCard } from '../components/TechniqueCard';
import type { ScreenProps } from './types';

const EFFECT_TEXT: Readonly<Record<JutsuCard['effect'], (power: number) => string>> = {
  damage: (power) => `power ${power}`,
  stun: () => 'dazes',
  heal: () => 'heals',
  seal: () => 'seals',
};

const FILTER_LABELS: Readonly<Record<Discipline | 'all', string>> = {
  all: 'All',
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function cardDetail(card: JutsuCard): string {
  if (card.status === 'studying') return `Studying · ${card.progressPct}%`;
  if (card.status === 'unknown') return 'Not learned';
  return `${card.chakraCost} chakra · ${EFFECT_TEXT[card.effect](card.power)}`;
}

/** Your techniques as a deck of the same cards you play in fights. */
export function JutsuScreen({ ctx, state }: ScreenProps) {
  const deck = jutsuDeck(state, ctx);
  const [filter, setFilter] = useState<Discipline | 'all'>('all');
  const [selectedId, setSelectedId] = useState(deck[0]?.id);
  const shown = deck.filter((c) => filter === 'all' || c.discipline === filter);
  const selected = deck.find((c) => c.id === selectedId);
  const known = deck.filter((c) => c.status === 'known').length;
  return (
    <>
      <header className="plain-head">
        <h1>Jutsu</h1>
        <p className="label">
          {known} known · {deck.length - known} to discover
        </p>
      </header>
      <main className="page">
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
              />
            </button>
          ))}
        </div>
        {selected && (
          <section className="detail-card">
            <b>
              {selected.status === 'unknown' ? 'Undiscovered technique' : selected.name}{' '}
              <span className={`badge d-${selected.discipline}`}>{selected.discipline}</span>
              {selected.element && <span className="chip"> {selected.element}</span>}
            </b>
            {selected.status !== 'unknown' && <p className="story">{selected.description}</p>}
            <p className="muted small">{cardDetail(selected)}</p>
          </section>
        )}
      </main>
    </>
  );
}
