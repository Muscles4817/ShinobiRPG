import { ctx, draft, newGame } from '@/test/gameFixtures';

import { createNewGame, draftProblems } from './creation';
import { byTheClock } from './growth';
import { quirkTilt, QUIRK_TILT, warmed } from './people/warmth';
import type { GameState } from './state';
import { notesPage } from './views/creationNotes';
import { fileReadBack } from './views/fileReadBack';

/** Special notes that stack within the room a standing gives, habits, and the file read back. */

describe('special notes', () => {
  it('stack as far as the standing’s room goes, and no further', () => {
    const genius = draft({
      standing: 'genius',
      talentIds: ['prodigy', 'sprinter', 'night-owl', 'sensor'],
    });
    expect(draftProblems(genius, ctx)).toEqual([]);
    const greedy = { ...genius, talentIds: [...genius.talentIds, 'loner'] };
    expect(draftProblems(greedy, ctx)).toContain(
      'No room for another minor note: a flaw would make some.',
    );
    expect(draftProblems({ ...greedy, talentIds: [...greedy.talentIds, 'frail'] }, ctx)).toEqual(
      [],
    );
    const deadLast = draft({ standing: 'dead-last', talentIds: ['prodigy'] });
    expect(draftProblems(deadLast, ctx)).toContain(
      'Your standing can’t carry that many major notes.',
    );
  });

  it('never carries two notes that contradict each other', () => {
    const both = draft({ standing: 'genius', talentIds: ['iron-stomach', 'bottomless-pit'] });
    expect(draftProblems(both, ctx)).toContain('Two of those notes contradict each other.');
  });

  it('all count: their stat bonuses add up on graduation day', () => {
    const plain = createNewGame({ draft: draft({ talentIds: [] }), seed: 5 }, ctx).character;
    const noted = createNewGame(
      { draft: draft({ standing: 'genius', talentIds: ['sensor', 'tactician'] }), seed: 5 },
      ctx,
    ).character;
    expect(noted.talentIds).toEqual(['sensor', 'tactician']);
    expect(noted.stats.perception).toBeGreaterThan(plain.stats.perception);
    expect(noted.stats.intellect).toBeGreaterThan(plain.stats.intellect);
  });

  it('show the room left as slots, and say why a note won’t fit', () => {
    const page = notesPage(draft({ standing: 'dead-last', talentIds: [] }), ctx);
    expect(page.slots.map((s) => s.kind)).toEqual(['open-minor']);
    const quick = page.groups[0]!.notes.find((n) => n.id === 'prodigy')!;
    expect(quick.blocker).toMatch(/major notes/);
  });

  it('a night owl’s evening drills go further and their mornings less far', () => {
    const owl = (slot: number): GameState => {
      const game = newGame();
      return {
        ...game,
        time: { ...game.time, slot },
        character: { ...game.character, talentIds: ['night-owl'] },
      };
    };
    const gains = { taijutsu: 1 };
    expect(byTheClock(owl(2), ctx, gains).taijutsu).toBeGreaterThan(1);
    expect(byTheClock(owl(0), ctx, gains).taijutsu).toBeLessThan(1);
    expect(byTheClock(owl(1), ctx, gains)).toBe(gains);
  });
});

describe('habits people notice', () => {
  it('warm people with the traits that like them faster, and the rest more slowly', () => {
    const game = newGame();
    const person = ctx.content.people.all.find((p) => p.traitIds.includes('kind'))!;
    const snacks = { ...game, character: { ...game.character, quirkIds: ['snacks'] } };
    const cools = person.traitIds.includes('diligent') ? 1 : 0;
    expect(quirkTilt(snacks, ctx, person)).toBeCloseTo(1 + (1 - cools) * QUIRK_TILT);
    expect(warmed(snacks, ctx, 10, person)).toBeGreaterThanOrEqual(warmed(game, ctx, 10, person));
    expect(warmed(snacks, ctx, -4, person)).toBe(-4);
  });

  it('are kept on the character from the file', () => {
    const made = createNewGame({ draft: draft({ quirkIds: ['hums', 'notebook'] }), seed: 2 }, ctx);
    expect(made.character.quirkIds).toEqual(['hums', 'notebook']);
  });
});

describe('the file, read back', () => {
  it('reads a stacked genius as easy going and a bare dead last as a hard road', () => {
    const genius = draft({
      standing: 'genius',
      talentIds: ['prodigy', 'sprinter', 'night-owl', 'sensor'],
    });
    const filled = { ...genius, file: { ...genius.file, gifts: { taijutsu: 'gifted' as const } } };
    const easy = fileReadBack(filled, ctx);
    expect(easy.road.steps[easy.road.at]).toBe('Easy going');
    expect(easy.easy).toContain('Training after dark');
    expect(easy.hard).toContain('Training in the morning');
    expect(easy.limits[0]).toBe('Speed can go further than most.');
    const hard = fileReadBack(draft({ standing: 'dead-last', talentIds: [] }), ctx);
    expect(hard.road.at).toBe(0);
    expect(hard.note).toMatch(/Hard work still pays/);
  });

  it('says in words who will like you for your habits', () => {
    const read = fileReadBack(draft({ quirkIds: ['snacks'] }), ctx);
    expect(read.people).toEqual([
      'Kind and lazy people will like you sooner.',
      'Diligent people won’t, at first.',
    ]);
  });

  it('never puts a number in the story', () => {
    const read = fileReadBack(
      draft({ standing: 'genius', talentIds: ['prodigy', 'chakra-reserves'] }),
      ctx,
    );
    const words = [
      read.verdict,
      read.note,
      ...read.easy,
      ...read.hard,
      ...read.people,
      ...read.limits,
    ];
    expect(words.filter((w) => /\d/.test(w))).toEqual([]);
  });
});
