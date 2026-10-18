import { bondWith } from '@/systems/bonds';
import { GRADE_XP } from '@/systems/cooking';
import { scriptedCtx } from '@/test/examFixtures';
import { act, ctx, intoFight, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { noteHomeGifts } from '../home/gifts';
import { contextForPack } from '../context';
import type { GameState } from '../state';
import { dayEndView } from '../views/dayEnd';
import { fieldBookView } from '../views/fieldBook';
import { keepsakeShelf } from '../views/keepsakes';
import { FOES_PAGE_FULL, pageCount } from './pages';
import { noteFieldBook } from './rewards';
import { fishWhere } from './wild';

/** The field book: written in as you fish, forage and fight; each full page leaves something. */

const SPRING = 1;
/** Every fish on a spot in the pack, from the same reading the page makes. */
const FISH = [...fishWhere(ctx).keys()];

function morning(state: GameState, slot = 0): GameState {
  return { ...state, time: { day: SPRING, slot }, board: { ...state.board, refreshedDay: SPRING } };
}

/** Calm enough to land something, and cook enough to know what bites. */
function angler(seed: number): GameState {
  const state = morning(newGame({ rngState: seed }));
  return {
    ...state,
    character: { ...state.character, stats: { ...state.character.stats, willpower: 40 } },
    cooking: { ...state.cooking, xp: GRADE_XP.D },
  };
}

/** The fixture's field book (its recipe page already handed over) with these fish caught. */
function caught(ids: readonly string[]): GameState['fieldBook'] {
  return {
    ...newGame().fieldBook,
    catches: Object.fromEntries(ids.map((id) => [id, { count: 1, best: 30, bestDay: 1 }])),
  };
}

describe('writing in the field book', () => {
  it('measures a fish when it is landed, inside its kind’s range, and keeps the best', () => {
    const landed = [1, 2, 3, 4, 5, 6]
      .map((seed) => act(angler(seed), { type: 'fish', placeId: 'canal-river', spotId: 'reeds' }))
      .find((s) => Object.keys(s.fieldBook.catches).length > 0);
    if (!landed) throw new Error('Nothing bit.');
    const [id, record] = Object.entries(landed.fieldBook.catches)[0]!;
    const [shortest, longest] = ctx.content.ingredients.require(id).length!;
    expect(record.best).toBeGreaterThanOrEqual(shortest);
    expect(record.best).toBeLessThanOrEqual(longest);
    const labels = landed.journal.entries.at(-1)!.chips!.map((c) => c.label);
    expect(labels).toContain(`${record.best} cm`);
    expect(labels).toContain('New in your field book');
  });

  it('writes in what you forage', () => {
    const after = act(morning(newGame()), { type: 'forage', placeId: 'lantern-woods' });
    const found = Object.keys(after.inventory.pantry).filter(
      (id) => (newGame().inventory.pantry[id] ?? 0) < (after.inventory.pantry[id] ?? 0),
    );
    expect(Object.keys(after.fieldBook.finds).sort()).toEqual(found.sort());
  });

  it('writes in the foes of a mission fight, beaten or not', () => {
    const fight = (result: 'victory' | 'defeat') => {
      const context = scriptedCtx({ result });
      let state = act(
        veteran(withAllStats(newGame({}, context), 40), 2),
        { type: 'startMission', missionId: 'river-road-bandits' },
        context,
      );
      state = act(state, { type: 'missionContinue' }, context);
      state = intoFight(act(state, { type: 'missionChoose', approachIndex: 0 }, context), context);
      return act(state, { type: 'combatAct', optionId: 'end' }, context).fieldBook.foes;
    };
    const won = fight('victory');
    expect(Object.values(won).length).toBeGreaterThan(0);
    expect(Object.values(won).every((f) => f.fought === 1 && f.beaten === 1)).toBe(true);
    expect(Object.values(fight('defeat')).every((f) => f.beaten === 0)).toBe(true);
  });

  it('says what is new on the day’s sheet', () => {
    const state = morning(newGame(), 2);
    const foraged = act(state, { type: 'forage', placeId: 'lantern-woods' });
    const slept = act(foraged, { type: 'sleep' });
    const titles = dayEndView(slept, ctx)!.moments.map((m) => m.title);
    expect(titles.some((t) => t.startsWith('New in your field book:'))).toBe(true);
  });
});

describe('the pages', () => {
  it('seal the sights page for eyes that can never follow one', () => {
    const sights = fieldBookView(newGame(), ctx).pages.find((p) => p.id === 'sights')!;
    expect(sights.sealed).toMatch(/awakened bloodline/);
    expect(sights.entries).toEqual([]);
  });

  it('stamp a foe fought but never beaten, and name its tricks only once beaten', () => {
    const game = newGame();
    const foes = (beaten: number) =>
      fieldBookView(
        {
          ...game,
          fieldBook: { ...game.fieldBook, foes: { 'feral-tanuki': { fought: 2, beaten } } },
        },
        ctx,
      ).pages.find((p) => p.id === 'foes')!.entries[0]!;
    expect(foes(0).stamps).toContain('Not yet beaten');
    expect(foes(0).chips.map((c) => c.label)).toEqual(['Fought 2']);
    expect(foes(0).lines.some((l) => l.startsWith('Swift.'))).toBe(false);
    expect(foes(1).lines.some((l) => l.startsWith('Swift.'))).toBe(true);
  });

  it.each(['original', 'naruto'])('can be filled with foes in the %s pack', (packId) => {
    const pack = contextForPack(packId)!;
    const onJobs = new Set(
      pack.content.missions.all.flatMap((m) =>
        m.stages.flatMap((s) => (s.kind === 'combat' || s.kind === 'encounter' ? s.enemyIds : [])),
      ),
    );
    expect(onJobs.size).toBeGreaterThanOrEqual(FOES_PAGE_FULL);
  });

  it('hint at an empty slot without naming it', () => {
    const page = fieldBookView({ ...newGame(), fieldBook: caught(['river-fish']) }, ctx).pages.find(
      (p) => p.id === 'fish',
    )!;
    expect(page.progress).toBe(`1 of ${FISH.length} caught`);
    const empty = page.entries.filter((e) => !e.found);
    expect(empty.every((e) => e.name === 'Not yet caught')).toBe(true);
    const catfish = empty.find((e) => e.id === 'old-catfish')!;
    expect(catfish.stamps).toEqual(['Rare']);
    expect(catfish.lines[0]).toMatch(
      /deep pool.*at night, in autumn or winter, once your cooking reaches grade C/,
    );
  });

  it('list a foe a client’s report named before you have met it', () => {
    const game = newGame();
    const named = ctx.content.missions.all.find((m) =>
      m.stages.some(
        (s) => (s.kind === 'combat' || s.kind === 'encounter') && s.enemyIds.length > 0,
      ),
    )!;
    const state = { ...game, board: { ...game.board, intel: [named.id] } };
    const foes = fieldBookView(state, ctx).pages.find((p) => p.id === 'foes')!;
    expect(foes.entries.length).toBeGreaterThan(0);
    expect(foes.entries.every((e) => !e.found && e.lines[0]?.includes('client’s report'))).toBe(
      true,
    );
  });
});

describe('a full page', () => {
  it('leaves its piece for the house and its keepsake, once', () => {
    const before = { ...newGame(), fieldBook: caught(FISH.slice(0, -1)) };
    const after = { ...before, fieldBook: caught(FISH) };
    expect(pageCount(after, ctx, 'fish')).toEqual({ filled: FISH.length, total: FISH.length });
    const rewarded = noteFieldBook(before, after, ctx);
    expect(rewarded.fieldBook.rewarded).toEqual(['recipes', 'fish']);
    expect(rewarded.housing.furniture).toContain('gyotaku-print');
    expect(keepsakeShelf(rewarded, ctx).keepsakes.map((k) => k.name)).toContain(
      'A cork float, bitten',
    );
    const again = { ...rewarded, fieldBook: { ...rewarded.fieldBook, finds: { x: 1 } } };
    expect(noteFieldBook(rewarded, again, ctx).journal).toBe(again.journal);
  });

  it('keeps its piece out of a friend’s gifts', () => {
    const game = newGame();
    const id = game.people.team!.teammateIds[0]!;
    const owning = {
      ...game,
      housing: { ...game.housing, furniture: ['silk-futon', 'landscape-scroll'] },
    };
    const withBond = (points: number) => ({
      ...owning,
      people: {
        ...owning.people,
        bonds: { ...owning.people.bonds, [id]: bondWith(points) },
      },
    });
    const gifted = noteHomeGifts(withBond(50), withBond(60), ctx);
    expect(gifted.housing.furniture).not.toContain('gyotaku-print');
    expect(gifted.housing.furniture).not.toContain('drying-rack');
  });
});
