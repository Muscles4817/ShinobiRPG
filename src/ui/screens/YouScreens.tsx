import { useState } from 'react';

import {
  browseTechniques,
  chainsView,
  jutsuDeck,
  styleView,
  type Discipline,
  type JutsuCard,
  type TechniqueFilter,
} from '@/game';

import { TechniqueCard } from '../components/TechniqueCard';
import { cardDetail, DISCIPLINE_LABELS, JutsuDetail } from '../components/JutsuDetail';
import { ChainsPanel } from '../components/ChainsPanel';
import { FinderFields } from '../components/finder/FinderFields';
import { FinderPager } from '../components/finder/FinderPager';
import { useTechniqueFinder } from '../components/finder/useTechniqueFinder';
import { StylePanel, StyleToggle } from '../components/StylePanel';
import { Pane } from '../layout/Pane';
import { useHoverPreview } from '../layout/useHoverPreview';
import type { ScreenProps } from './types';

/** A deck rarely runs long, but a page keeps a long one in reach; a desk shows more. */
const PAGE_SIZES = { phone: 18, desk: 24 } as const;

/** Below this many cards the art chips are filter enough; past it the finder's fields show. */
const FINDER_FROM = 9;

const ARTS = ['all', 'taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

const FILTER_LABELS: Readonly<Record<Discipline | 'all', string>> = {
  all: 'All',
  ...DISCIPLINE_LABELS,
};

/** What is left to find, by art, among the techniques the deck's filter would show. */
function Undiscovered({
  unknown,
  filter,
}: {
  readonly unknown: readonly JutsuCard[];
  readonly filter: TechniqueFilter;
}) {
  const arts = browseTechniques(unknown, { ...filter, readyOnly: false }, 0).arts.filter(
    (o) => filter.art === 'all' || o.value === filter.art,
  );
  if (arts.length === 0) return null;
  return (
    <section className="undiscovered" aria-label="To discover">
      <h2 className="label">Still to discover</h2>
      <div className="undiscovered-row">
        {arts.map((o) => (
          <span key={o.value} className={`badge d-${o.value}`}>
            {FILTER_LABELS[o.value]} {o.count}
          </span>
        ))}
      </div>
      <p className="muted small">
        Scrolls at the Academy, your clan and your sensei teach the rest.
      </p>
    </section>
  );
}

/**
 * Your techniques as a deck of the same cards you play in fights, found by art (the coloured
 * chips), rank, element, kind and name, a page at a time.
 */
export function JutsuScreen({ ctx, state, perform }: ScreenProps) {
  const deck = jutsuDeck(state, ctx);
  const style = styleView(state, ctx);
  const chains = chainsView(state, ctx);
  const discovered = deck.filter((c) => c.status !== 'unknown');
  const finder = useTechniqueFinder(discovered, PAGE_SIZES);
  const { filter, browse } = finder;
  const [selectedId, setSelectedId] = useState(deck[0]?.id);
  const hover = useHoverPreview();
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
            {ARTS.map((f) => (
              <button
                key={f}
                type="button"
                className={`filter d-${f}${f === filter.art ? ' on' : ''}`}
                onClick={() => {
                  finder.setFilter({ art: f });
                }}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
          {style && <StylePanel style={style} perform={perform} />}
          {chains && <ChainsPanel chains={chains} ctx={ctx} state={state} perform={perform} />}
          {discovered.length >= FINDER_FROM && (
            <div className="finder jutsu-finder">
              <FinderFields finder={finder} readyLabel="Only those you know" withoutArt />
            </div>
          )}
          <div className="deck">
            {browse.shown.map((c) => (
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
          {browse.found === 0 && <p className="muted">Nothing fits. Loosen a filter.</p>}
          <FinderPager browse={browse} onPage={finder.setPage} />
          <Undiscovered unknown={deck.filter((c) => c.status === 'unknown')} filter={filter} />
        </Pane>
        <Pane name="detail">
          {selected && <JutsuDetail card={selected} />}
          {selected && <StyleToggle card={selected} perform={perform} />}
        </Pane>
      </main>
    </>
  );
}
