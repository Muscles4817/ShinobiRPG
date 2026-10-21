import { useState, type ReactNode } from 'react';

import { bondsView, personSheet, rivalryView, type PersonCard } from '@/game';

import { PersonPage } from '../../components/PersonSheet';
import { useHoverPreview } from '../../layout/useHoverPreview';
import type { BondsProps } from '../types';
import { BondCard, CompanionSlip } from './BondCards';

/**
 * The Bonds tab on a roomy desk: everyone in a list you can search by name, and beside it the
 * page of whoever you pick, as the drawer would show it. Pointing at someone reads their page
 * until you point away. Searching opens the people you haven't met yet.
 */

function matches(card: PersonCard, search: string): boolean {
  return search === '' || card.fullName.toLowerCase().includes(search);
}

function Group({
  title,
  cards,
  render,
}: {
  readonly title: string;
  readonly cards: readonly PersonCard[];
  readonly render: (card: PersonCard) => ReactNode;
}) {
  if (cards.length === 0) return null;
  return (
    <section className="bond-group">
      <h2 className="label">{title}</h2>
      {cards.map(render)}
    </section>
  );
}

export function BondsDesk({ ctx, state, perform, onOpenCompanion }: BondsProps) {
  const view = bondsView(state, ctx);
  const [search, setSearch] = useState('');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const preview = useHoverPreview();
  const needle = search.trim().toLowerCase();
  const team = view.team.filter((c) => matches(c, needle));
  const known = view.known.filter((c) => matches(c, needle));
  const strangers = view.strangers.filter((c) => matches(c, needle));
  const everyone = [...view.team, ...view.known, ...view.strangers];
  const picked = everyone.some((c) => c.id === pickedId) ? pickedId : (everyone[0]?.id ?? null);
  const shownId = preview.previewId ?? picked;
  const page = shownId ? personSheet(state, ctx, shownId) : null;
  const render = (c: PersonCard) => (
    <BondCard
      key={c.id}
      card={c}
      current={c.id === picked}
      hover={preview.handlersFor(c.id)}
      onOpen={() => {
        setPickedId(c.id);
      }}
    />
  );
  const found = team.length + known.length + strangers.length;
  return (
    <main className="page bonds bonds-desk">
      <header className="plain-head">
        <p className="label">縁 Bonds</p>
        <h1>The people in your life</h1>
      </header>
      <div className="bonds-list">
        <input
          type="search"
          className="bonds-search"
          placeholder="Find someone by name"
          aria-label="Find someone by name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        {view.companion && needle === '' && (
          <section className="bond-group">
            <h2 className="label">At your side</h2>
            <CompanionSlip card={view.companion} onOpen={onOpenCompanion} />
          </section>
        )}
        <Group title="Your team" cards={team} render={render} />
        <Group title="People you know" cards={known} render={render} />
        {needle === '' ? (
          strangers.length > 0 && (
            <details className="bond-group fold">
              <summary className="label">
                {strangers.length} more to meet around the village
              </summary>
              {strangers.map(render)}
            </details>
          )
        ) : (
          <Group title="Yet to meet" cards={strangers} render={render} />
        )}
        {found === 0 && <p className="muted">Nobody by that name. Try fewer letters.</p>}
      </div>
      {page && shownId && (
        <PersonPage
          p={page}
          rivalry={rivalryView(state, ctx, shownId)}
          perform={perform}
          onClose={() => undefined}
          className="person-sheet paper-sheet bonds-page"
        />
      )}
    </main>
  );
}
