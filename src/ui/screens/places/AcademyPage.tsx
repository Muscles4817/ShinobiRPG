import { useState } from 'react';

import { academyView, headerView, type Discipline, type Scroll } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';
import { ScrollRow } from './ScrollRow';

const ARTS: readonly { id: Discipline; label: string }[] = [
  { id: 'taijutsu', label: 'Taijutsu' },
  { id: 'ninjutsu', label: 'Ninjutsu' },
  { id: 'genjutsu', label: 'Genjutsu' },
  { id: 'kenjutsu', label: 'Kenjutsu' },
  { id: 'fuuinjutsu', label: 'Fūinjutsu' },
];

type ArtFilter = Discipline | 'all';

/** The arts the rack holds scrolls in, in the fixed order, after "All". */
function filtersFor(scrolls: readonly Scroll[]): { id: ArtFilter; label: string }[] {
  const held = ARTS.filter((art) => scrolls.some((s) => s.discipline === art.id));
  return [{ id: 'all', label: 'All' }, ...held];
}

function ofArt(scrolls: readonly Scroll[], filter: ArtFilter): readonly Scroll[] {
  return filter === 'all' ? scrolls : scrolls.filter((s) => s.discipline === filter);
}

/** Scrolls ready to study: with every art shown, art by art, so the rack reads in runs. */
function readyShown(scrolls: readonly Scroll[], filter: ArtFilter): readonly Scroll[] {
  if (filter !== 'all') return ofArt(scrolls, filter);
  const order = (s: Scroll) => ARTS.findIndex((art) => art.id === s.discipline);
  return [...scrolls].sort((a, b) => order(a) - order(b));
}

/**
 * A rack of scrolls: study progress is how far each one is unrolled. With a scroll or two in
 * every art the rack runs long, so it can be narrowed to one art.
 */
export function AcademyPage({ ctx, state, perform, onBack }: PlaceProps) {
  const [filter, setFilter] = useState<ArtFilter>('all');
  const view = academyView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  const filters = filtersFor([...view.ready, ...view.comingUp]);
  const sections: [string, readonly Scroll[]][] = [
    ['Studying', view.studying],
    ['Ready to study', readyShown(view.ready, filter)],
    ['Coming up', ofArt(view.comingUp, filter)],
  ];
  return (
    <>
      <Banner
        title={view.name}
        subtitle={`Study costs ${view.energyCost} energy and one time slot`}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        {filters.length > 2 && (
          <div className="filters" role="group" aria-label="Show scrolls of one art">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter d-${f.id}${f.id === filter ? ' on' : ''}`}
                aria-pressed={f.id === filter}
                onClick={() => {
                  setFilter(f.id);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
        {sections
          .filter(([, scrolls]) => scrolls.length > 0)
          .map(([title, scrolls]) => (
            <section key={title} className="rack">
              <h2 className="label">{title}</h2>
              {scrolls.map((s) => (
                <ScrollRow key={s.id} scroll={s} perform={perform} />
              ))}
            </section>
          ))}
        {view.studying.length + view.ready.length + view.comingUp.length === 0 && (
          <p className="story">You have learned every scroll the library keeps.</p>
        )}
      </main>
    </>
  );
}
