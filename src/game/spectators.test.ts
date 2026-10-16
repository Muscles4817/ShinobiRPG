import { daysUntil } from '@/systems/time';
import { act, ctx, fightOut, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { requirePerson } from './people/cast';
import { examWord, finalists, finalsToday, WATCH_SLOTS } from './exam/spectators';
import type { GameState } from './state';
import { examFinalsView } from './views/examFinals';

/** The exam for those not sitting it: the word in the week before, and the finals to watch. */

const EXAM = ctx.content.exams.all[0]!;
const WATCH = { type: 'watchFinals' } as const;

/** The first day the exam's finals are held. */
function examDay(): number {
  let day = 1;
  while (!EXAM.dates.some((d) => daysUntil(day, d) === 0)) day += 1;
  return day;
}

function on(state: GameState, day: number): GameState {
  return { ...state, time: { day, slot: 0 } };
}

function withSensei(state: GameState, senseiId: string): GameState {
  const team = { ...state.people.team!, senseiId };
  return { ...state, people: { ...state.people, team } };
}

describe('the exam for those not sitting it', () => {
  it('is told you by your sensei in the week before, when they won’t put you forward', () => {
    const state = on(newGame(), examDay() - 3);
    const word = examWord(state, ctx);
    expect(word?.speaker).toBe('Gōran');
    expect(word?.text).toContain('come and watch the finals');
    expect(word?.text).toContain(state.character.name);
    expect(examFinalsView(state, ctx)).toMatchObject({ when: 'In 3 days', watch: null });
  });

  it('comes from a teammate when your sensei keeps too loose a grip to say it', () => {
    const state = withSensei(on(newGame(), examDay() - 2), 'yomi');
    const mate = requirePerson(state, ctx, state.people.team!.teammateIds[0]!);
    const word = examWord(state, ctx);
    expect(word?.speaker).toBe(mate.name);
    expect(word?.text).toContain('everyone’s going to watch');
  });

  it('is not talked about weeks ahead', () => {
    expect(examWord(on(newGame(), examDay() - 20), ctx)).toBeNull();
    expect(examFinalsView(on(newGame(), examDay() - 20), ctx)).toBeNull();
  });

  it('brings two finalists stronger than the last round’s rival, the same each time', () => {
    const state = on(newGame(), examDay());
    const pair = finalists(state, ctx, EXAM);
    expect(pair).toHaveLength(2);
    expect(finalists(state, ctx, EXAM)).toEqual(pair);
    const ring = EXAM.stages.find((s) => s.kind === 'tournament');
    const last = ring?.kind === 'tournament' ? (ring.rivals.at(-1) ?? 0) : 0;
    for (const p of pair) expect(Math.max(...Object.values(p.stats))).toBeGreaterThan(last);
  });

  it('can be watched from the stands on the day: an afternoon goes, nobody touches you', () => {
    const start = on(newGame(), examDay());
    expect(finalsToday(start, ctx)?.id).toBe(EXAM.id);
    expect(blockerFor(start, WATCH, ctx)).toBeNull();
    const seated = act(start, WATCH);
    expect(seated.combat).not.toBeNull();
    expect(seated.exams.spectating).toBe(true);
    expect(seated.time.slot).toBe(start.time.slot + WATCH_SLOTS);
    const done = fightOut(seated);
    expect(done.combat).toBeNull();
    expect(done.exams.spectating).toBe(false);
    expect(done.character.vitals.health).toBe(seated.character.vitals.health);
    expect(done.character.stats.perception).toBeGreaterThan(start.character.stats.perception);
    // Its last exchange is staged as watched too: nothing stops the play for "you".
    expect(done.combatFinale?.watched).toBe(true);
    const card = done.reports.find((r) => r.kind === 'fight');
    expect(card?.kind === 'fight' && card.verdict).toMatch(/ wins$/);
    expect(blockerFor(done, WATCH, ctx)).toMatch(/already|watched/);
  });

  it('is only on the day, and only by day', () => {
    expect(blockerFor(on(newGame(), examDay() - 1), WATCH, ctx)).toMatch(/no finals/);
    const evening = { ...on(newGame(), examDay()), time: { day: examDay(), slot: 2 } };
    expect(blockerFor(evening, WATCH, ctx)).toMatch(/over for the day/);
  });
});
