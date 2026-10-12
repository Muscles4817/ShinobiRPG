import type { StatId } from '@/systems/stats';
import { act, ctx, lastEntry, newGame, withAllStats } from '@/test/gameFixtures';

import { gradeUpsBetween, noteGradeUps } from './gradeUps';
import type { Report } from './reports';
import type { GameState } from './state';

function withStats(state: GameState, stats: Partial<Record<StatId, number>>): GameState {
  const next = { ...state.character.stats, ...stats };
  return { ...state, character: { ...state.character, stats: next } };
}

function gradeCards(state: GameState): Extract<Report, { kind: 'grade' }>[] {
  return state.reports.flatMap((r) => (r.kind === 'grade' ? [r] : []));
}

describe('grade-ups', () => {
  it('finds the stats whose grade rose, and only those', () => {
    const before = withAllStats(newGame(), 7.9).character.stats;
    const after = { ...before, taijutsu: 8, speed: 7.99, intellect: 6 };
    expect(gradeUpsBetween(before, after)).toEqual(['taijutsu']);
  });

  it('stamps a card with the new grade and what it opens, from content', () => {
    const before = withStats(withAllStats(newGame(), 5), { kenjutsu: 7.95 });
    const after = withStats(before, { kenjutsu: 8.02 });
    const noted = noteGradeUps(before, after, ctx);
    const [card] = gradeCards(noted);
    expect(card).toMatchObject({ stat: 'Kenjutsu', grade: 'D', rank: 'Genin' });
    // Anvil Fall needs kenjutsu 8: out of reach before, within it now.
    expect(card?.opens.map((o) => o.name)).toContain('Anvil Fall');
    expect(card?.opens.every((o) => o.where.length > 0)).toBe(true);
    expect(lastEntry(noted)?.heading).toBe('Kenjutsu reaches grade D');
    expect(lastEntry(noted)?.text).not.toMatch(/\d/);
  });

  it('opens nothing it did not open: no technique already in reach is listed', () => {
    const before = withStats(withAllStats(newGame(), 12.9), {});
    const after = withStats(before, { taijutsu: 13.1 });
    const [card] = gradeCards(noteGradeUps(before, after, ctx));
    expect(card?.grade).toBe('C');
    expect(card?.opens).toEqual([]);
  });

  it('fires from any action that grows a stat across a boundary', () => {
    const before = withStats(newGame(), { kenjutsu: 7.99 });
    const drilled = act(before, { type: 'train', trainingId: 'blade-forms' });
    expect(gradeCards(drilled).map((c) => c.stat)).toEqual(['Kenjutsu']);
  });

  it('notes each stat once per action, however many sources fed it', () => {
    // Stamina work deepens reserves too: both cross, each gets one card.
    const before = withStats(newGame(), { stamina: 7.99, reserves: 7.999 });
    const swum = act(before, { type: 'train', trainingId: 'lake-laps' });
    const cards = gradeCards(swum).map((c) => c.stat);
    expect(cards.filter((s) => s === 'Stamina')).toHaveLength(1);
    expect(cards.filter((s) => s === 'Chakra Reserves')).toHaveLength(1);
  });

  it('does nothing when no grade changes, or a grade falls', () => {
    const before = withAllStats(newGame(), 9);
    expect(noteGradeUps(before, withStats(before, { strength: 9.5 }), ctx)).toEqual(
      withStats(before, { strength: 9.5 }),
    );
    expect(gradeCards(noteGradeUps(before, withStats(before, { strength: 7 }), ctx))).toEqual([]);
  });
});
