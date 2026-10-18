import { act, ctx, fightOut, newGame } from '@/test/gameFixtures';
import { createStats } from '@/systems/stats';

import { createNewGame } from '../creation';
import { closeDay } from '../daybook/close';
import { openDay } from '../daybook/open';
import { draft, formTeam } from '@/test/gameFixtures';
import type { GameState } from '../state';
import { momentRows } from '../views/dayEndRows';
import { rivalChallengeView } from '../views/rival';
import { rivalryView } from '../views/rivalry';
import { newFirsts } from './grades';
import { rivalLine } from './lines';
import { TELL } from './raceLines';
import { noteRival } from './record';
import { RIVAL_SHAPES, type Rival } from './state';

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 104729 + 7);

function withRival(state: GameState, patch: Partial<Rival>): GameState {
  return { ...state, rival: { ...state.rival!, ...patch } };
}

describe('choosing a rival', () => {
  it('picks a classmate from another team once your team is settled, and they come to find you', () => {
    const fresh = createNewGame({ draft: draft(), seed: 99 }, ctx);
    expect(fresh.rival).toBeNull();
    const game = formTeam(fresh);
    const rival = game.rival!;
    expect(game.people.team!.teammateIds).not.toContain(rival.personId);
    expect(
      game.people.generated.some((p) => p.id === rival.personId) ||
        ctx.content.people.get(rival.personId)?.role === 'genin',
    ).toBe(true);
    expect(rival.beat).toBeNull(); // the fixture answers the meeting
  });

  it('draws a different gap and temperament from year to year', () => {
    const rivals = SEEDS.map(
      (seed) => formTeam(createNewGame({ draft: draft(), seed }, ctx)).rival!,
    );
    const shapes = new Set(rivals.map((r) => r.shape));
    const temperaments = new Set(rivals.map((r) => r.temperament));
    expect(shapes.size).toBeGreaterThanOrEqual(3);
    for (const s of shapes) expect(RIVAL_SHAPES).toContain(s);
    expect(temperaments.size).toBeGreaterThanOrEqual(2);
  });
});

describe('answering your rival', () => {
  it('moves the heat by the moment: rubbing a win in cools it more than grace', () => {
    const game = withRival(newGame(), { heat: 50, beat: { kind: 'after-spar', won: true } });
    const gracious = act(game, { type: 'answerRival', choiceIndex: 0 }).rival!;
    const gloating = act(game, { type: 'answerRival', choiceIndex: 1 }).rival!;
    expect(gracious.heat).toBeGreaterThan(gloating.heat);
    expect(gracious.beat).toBeNull();
  });

  it('holds everything else up until you answer', () => {
    const waiting = withRival(newGame(), { beat: { kind: 'meeting' } });
    expect(() => act(waiting, { type: 'sleep' })).toThrow(/rival is waiting/);
  });
});

describe('challenges', () => {
  it('are taken up as a spar that goes in the tally, with words after', () => {
    const challenged = withRival(newGame(), {
      challenge: { day: 1, line: 'Spar.', contest: 'spar' },
    });
    expect(rivalChallengeView(challenged, ctx)?.accept.blocker).toBeNull();
    const fought = fightOut(act(challenged, { type: 'acceptChallenge' }));
    const rival = fought.rival!;
    expect(rival.challenge).toBeNull();
    expect(rival.spars.you + rival.spars.them).toBe(1);
    expect(rival.beat?.kind).toBe('after-spar');
  });

  it('cost a proud rival’s goodwill more than a kind one’s when turned down', () => {
    const base = withRival(newGame(), {
      heat: 50,
      challenge: { day: 1, line: 'Spar.', contest: 'spar' },
    });
    const proud = act(withRival(base, { temperament: 'proud' }), { type: 'declineChallenge' });
    const kind = act(withRival(base, { temperament: 'kind' }), { type: 'declineChallenge' });
    expect(proud.rival!.heat).toBeLessThan(kind.rival!.heat);
  });

  it('come for a reason as a day turns: they got somewhere first', () => {
    const game = withRival(newGame(), { lastChallengeDay: -10, challenge: null, beat: null });
    const before = withRival(game, { firsts: {} });
    const after = {
      ...withRival(game, { firsts: { 'taijutsu:2': 'them' } }),
      time: { day: 2, slot: 0 },
    };
    const next = noteRival(before, after, ctx).rival!;
    expect(next.challenge?.day).toBe(2);
  });

  it('lapse when left standing, and that cools things a little', () => {
    const game = withRival(newGame(), {
      heat: 50,
      challenge: { day: 1, line: 'Spar.', contest: 'spar' },
    });
    const later = { ...game, time: { day: 3, slot: 0 } };
    const next = noteRival(game, later, ctx).rival!;
    expect(next.challenge).toBeNull();
    expect(next.heat).toBeLessThan(50);
  });
});

describe('the race to each grade', () => {
  it('scores whoever gets there first, past where you both started', () => {
    const rival = { ...newGame().rival!, startGrades: { taijutsu: 0 }, firsts: {} };
    const you = createStats(5, { taijutsu: 9 });
    const them = createStats(5, {});
    expect(newFirsts(rival, you, them).find((f) => f.stat === 'taijutsu')).toMatchObject({
      who: 'you',
    });
    expect(newFirsts(rival, them, you).find((f) => f.stat === 'taijutsu')).toMatchObject({
      who: 'them',
    });
  });

  it('shows on the day’s sheet in the rival’s ink', () => {
    const game = newGame();
    const start = openDay(game);
    const later = withRival(game, { firsts: { 'taijutsu:1': 'them' } });
    const rows = momentRows(closeDay(start, later, true), later, ctx);
    expect(rows.find((m) => m.rival)?.title).toMatch(/before you$/);
  });
});

describe('the Rivalry tab', () => {
  it('shows only on your rival’s sheet', () => {
    const game = newGame();
    const view = rivalryView(game, ctx, game.rival!.personId)!;
    expect(view.heat.stages).toHaveLength(4);
    expect(view.side.length).toBeGreaterThan(0);
    expect(rivalryView(game, ctx, game.people.team!.teammateIds[0]!)).toBeNull();
  });
});

describe('what a rival says of themself', () => {
  const kaen = ctx.content.people.require('kaen');
  const shiori = ctx.content.people.require('shiori');
  const sora = { ...kaen, id: 'sora', name: 'Sora', pronouns: 'they' as const };

  it('agrees with their pronouns', () => {
    expect(rivalLine(TELL.push, kaen)).toBe(
      'Kaen is up on his toes, breathing fast. He means to go hard.',
    );
    expect(rivalLine(TELL.push, shiori)).toBe(
      'Shiori is up on her toes, breathing fast. She means to go hard.',
    );
    expect(rivalLine(TELL.push, sora)).toBe(
      'Sora is up on their toes, breathing fast. They mean to go hard.',
    );
  });
});
