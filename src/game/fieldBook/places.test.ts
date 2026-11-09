import { ctx, newGame } from '@/test/gameFixtures';

import { beenTo, hearOf } from '../atlas';
import type { GameState } from '../state';
import { fieldBookView } from '../views/fieldBook';
import { keepsakeShelf } from '../views/keepsakes';
import { pageCount } from './pages';
import { placesOnTheBook } from './places';
import { noteFieldBook } from './rewards';

/** The places page: every place you can stand in, filled as you stand in it. */

const placesPage = (state: GameState) =>
  fieldBookView(state, ctx).pages.find((p) => p.id === 'places')!;
const entry = (state: GameState, id: string) => placesPage(state).entries.find((e) => e.id === id)!;

describe('the places page', () => {
  it('has a slot for every place you can stand in, and counts home from the start', () => {
    const ids = placesOnTheBook(ctx).map((l) => l.id);
    expect(ids).toContain('cedar-deep');
    expect(ids).not.toContain('mount-reikon');
    expect(pageCount(newGame(), ctx, 'places')).toEqual({ filled: 1, total: ids.length });
  });

  it('hints at a place never heard of by its road, never its name', () => {
    const fresh = newGame();
    const hidden = entry(fresh, 'old-battlefield');
    expect(hidden).toMatchObject({ found: false, name: 'Not yet found' });
    expect(hidden.lines.join(' ')).toMatch(/^A landmark, somewhere along the .+\.$/);
    expect(hidden.lines.join(' ')).not.toContain('Battlefield');
    const heard = entry(hearOf(fresh, ['old-battlefield']), 'old-battlefield');
    expect(heard).toMatchObject({ found: false, name: 'The Old Battlefield' });
    expect(heard.lines).toEqual(['A landmark. Heard of, never been.']);
  });

  it('writes a place in once you have stood in it', () => {
    const there = beenTo(newGame(), ctx, 'cedar-deep');
    expect(entry(there, 'cedar-deep')).toMatchObject({ found: true, name: 'The Cedar Deep' });
    expect(pageCount(there, ctx, 'places').filled).toBe(2);
  });

  it('leaves the painted map and the stamp book once every place is stood in', () => {
    const ids = placesOnTheBook(ctx).map((l) => l.id);
    const before = ids.slice(0, -1).reduce((s, id) => beenTo(s, ctx, id), newGame());
    const after = beenTo(before, ctx, ids.at(-1)!);
    const rewarded = noteFieldBook(before, after, ctx);
    expect(rewarded.fieldBook.rewarded).toContain('places');
    expect(rewarded.housing.furniture).toContain('painted-map');
    expect(keepsakeShelf(rewarded, ctx).keepsakes.map((k) => k.name)).toContain(
      'A pilgrim’s stamp book, every page inked',
    );
  });
});
