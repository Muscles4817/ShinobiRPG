import { act, ctx, lastEntry, newGame } from '@/test/gameFixtures';
import { ROAD_JOB, roadCtx } from '@/test/roadFixtures';

import { dateClash } from '../awayNotes';
import { blockerFor } from '../dispatch';
import type { GameState } from '../state';
import { promotionNotice } from '../views/promotionNotice';
import { notePromotions } from './promotion';
import { awardPromotion, PROMOTION_NOTICE_DAYS } from './promotionDay';
import type { Ceremony } from './state';

const SENSEI: Ceremony = { rank: 'chunin', route: 'sensei' };
const AWAY = 'port-shiomachi';

function setFor(state: GameState, inDays: number): GameState {
  return {
    ...state,
    exams: {
      ...state.exams,
      promotionDay: { ceremony: SENSEI, day: state.time.day + inDays, missed: false },
    },
  };
}

function onDay(state: GameState, day: number): GameState {
  return { ...state, time: { day, slot: 0 } };
}

describe('a promotion the village holds', () => {
  it('is set for a day at home and announced, not held on the spot', () => {
    const game = newGame();
    const set = awardPromotion(game, ctx, SENSEI);
    expect(set.exams.ceremony).toBeNull();
    expect(set.exams.promotionDay).toEqual({
      ceremony: SENSEI,
      day: game.time.day + PROMOTION_NOTICE_DAYS,
      missed: false,
    });
    expect(lastEntry(set)?.heading).toBe('A day is set');
  });

  it('is held where you stand when it is the field’s, an arc’s or the exam’s', () => {
    const field: Ceremony = { rank: 'chunin', route: 'field', missionId: 'any' };
    expect(awardPromotion(newGame(), ctx, field).exams.ceremony).toEqual(field);
  });

  it('is held on the day if you are home for it', () => {
    const set = setFor(newGame(), 1);
    expect(notePromotions(set, ctx)).toBe(set);
    const held = act(set, { type: 'sleep' });
    expect(held.exams.ceremony).toEqual(SENSEI);
    expect(held.exams.promotionDay).toBeNull();
  });

  it('goes ahead without you if you are away, and waits for you at the hall', () => {
    const set = setFor(newGame(), 1);
    const away = notePromotions(onDay({ ...set, locationId: AWAY }, set.time.day + 1), ctx);
    expect(away.exams.ceremony).toBeNull();
    expect(away.exams.promotionDay?.missed).toBe(true);
    expect(lastEntry(away)?.heading).toBe('Raised in your absence');
    expect(blockerFor(away, { type: 'collectPromotion' }, ctx)).toMatch(/waits for you at/);
    expect(promotionNotice(away, ctx)?.collect?.blocker).not.toBeNull();

    const home = { ...away, locationId: newGame().locationId };
    expect(notePromotions(home, ctx).exams.ceremony).toBeNull(); // not until you report
    const collected = act(home, { type: 'collectPromotion' });
    expect(collected.exams.ceremony).toEqual(SENSEI);
    expect(collected.exams.promotionDay).toBeNull();
  });

  it('keeps you from a job that would take you away over it', () => {
    const soon = setFor(newGame({}, roadCtx), 1);
    expect(dateClash(soon, roadCtx, ROAD_JOB)).toMatchObject({ blocks: true });
    const later = setFor(newGame({}, roadCtx), 30);
    expect(dateClash(later, roadCtx, ROAD_JOB)).toBeNull();
  });
});
