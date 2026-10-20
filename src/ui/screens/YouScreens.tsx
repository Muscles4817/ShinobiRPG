import { useState } from 'react';

import { chainsView, jutsuDeck, styleView, type Discipline } from '@/game';

import { TechniqueCard } from '../components/TechniqueCard';
import { cardDetail, DISCIPLINE_LABELS, JutsuDetail } from '../components/JutsuDetail';
import { ChainsPanel } from '../components/ChainsPanel';
import { StylePanel, StyleToggle } from '../components/StylePanel';
import { Pane } from '../layout/Pane';
import { useHoverPreview } from '../layout/useHoverPreview';
import type { ScreenProps } from './types';

const DISCIPLINE_ORDER = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

const FILTER_LABELS: Readonly<Record<Discipline | 'all', string>> = {
  all: 'All',
  ...DISCIPLINE_LABELS,
};

/** Your techniques as a deck of the same cards you play in fights. */
export function JutsuScreen({ ctx, state, perform }: ScreenProps) {
  const deck = jutsuDeck(state, ctx);
  const style = styleView(state, ctx);
  const chains = chainsView(state, ctx);
  const [filter, setFilter] = useState<Discipline | 'all'>('all');
  const [selectedId, setSelectedId] = useState(deck[0]?.id);
  const hover = useHoverPreview();
  const inFilter = deck.filter((c) => filter === 'all' || c.discipline === filter);
  const shown = inFilter.filter((c) => c.status !== 'unknown');
  const undiscovered = DISCIPLINE_ORDER.map((d) => ({
    discipline: d,
    count: inFilter.filter((c) => c.status === 'unknown' && c.discipline === d).length,
  })).filter((g) => g.count > 0);
  const selected = deck.find((c) => c.id === (hover.previewId ?? selectedId));
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
          {style && <StylePanel style={style} perform={perform} />}
          {chains && <ChainsPanel chains={chains} ctx={ctx} state={state} perform={perform} />}
          <div className="deck">
            {shown.map((c) => (
              <button
                key={c.id}
                type="button"
                className={c.id === selectedId ? 'deck-slot on' : 'deck-slot'}
                {...hover.handlersFor(c.id)}
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
                  inStyle={c.style?.inStyle === true}
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
          {selected && <JutsuDetail card={selected} />}
          {selected && <StyleToggle card={selected} perform={perform} />}
        </Pane>
      </main>
    </>
  );
}
