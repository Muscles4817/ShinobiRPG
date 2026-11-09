import { signPass } from '@/systems/travel';
import { act, ctx, keepClear, newGame } from '@/test/gameFixtures';

import { dispatch } from './dispatch';
import { HEART_IS_FOR_CHUNIN, PASS_DAYS, VENTURE_PASS_NEEDED } from './leave';
import { activeStage, endMission } from './missionFlow';
import { roadEventOn } from './story/roadEvents';
import type { GameState } from './state';
import { ventureMission } from './ventures';
import { wildsView } from './views/wilds';

const WOODS = 'lantern-woods';

/** A genin at home in the morning, on a pass. */
function onPass(): GameState {
  const game = newGame();
  return { ...game, leave: signPass(game.leave, game.time.day, PASS_DAYS) };
}

/** Plays the venture out: round whatever the wild brings, the first way past each check. */
function walk(start: GameState): GameState {
  let state = start;
  for (let step = 0; state.mission && step < 30; step++) {
    if (state.mission.roadEvent) state = act(state, keepClear(state));
    else if (activeStage(state, ctx)?.kind === 'check') {
      state = act(state, { type: 'missionChoose', approachIndex: 0 });
    } else state = act(state, { type: 'missionContinue' });
  }
  return state;
}

describe('going off the paths', () => {
  it('goes into the woods and comes back out where it went in', () => {
    const start = newGame();
    const going = act(start, { type: 'venture', placeId: WOODS, depth: 'edge' });
    expect(going.mission?.venture).toMatchObject({
      placeId: WOODS,
      country: 'woods',
      depth: 'edge',
    });
    const back = walk(going);
    expect(back.mission).toBeNull();
    expect(back.locationId).toBe(start.locationId);
    expect(back.time.day).toBeGreaterThan(start.time.day);
    expect(back.journal.entries.at(-1)?.heading).toBe('Out of the deep woods');
  });

  it('keeps a genin out of the deep without a pass, and out of the heart', () => {
    const game = newGame();
    expect(dispatch(game, { type: 'venture', placeId: WOODS, depth: 'deep' }, ctx)).toEqual({
      ok: false,
      error: VENTURE_PASS_NEEDED,
    });
    const passed = onPass();
    expect(dispatch(passed, { type: 'venture', placeId: WOODS, depth: 'deep' }, ctx).ok).toBe(true);
    expect(dispatch(passed, { type: 'venture', placeId: WOODS, depth: 'heart' }, ctx)).toEqual({
      ok: false,
      error: HEART_IS_FOR_CHUNIN,
    });
  });

  it('offers no way in where the country has no depths', () => {
    const river = wildsView(newGame(), ctx, 'canal-river');
    expect(river?.venture).toBeNull();
    expect(wildsView(newGame(), ctx, WOODS)?.venture?.depths.map((d) => d.depth)).toEqual([
      'edge',
      'deep',
      'heart',
    ]);
  });

  it('turns back at a camp and walks out from the depth it reached', () => {
    let state = act(onPass(), { type: 'venture', placeId: WOODS, depth: 'deep' });
    for (let step = 0; activeStage(state, ctx)?.kind !== 'camp' && step < 10; step++) {
      state = act(state, state.mission?.roadEvent ? keepClear(state) : { type: 'missionContinue' });
    }
    const run = state.mission;
    if (!run) throw new Error('expected the venture under way');
    const met = { stageIndex: 0, text: 'Weeded a hermit’s beans.', tone: 'plain' as const };
    const turned = act(
      { ...state, mission: { ...run, ledger: [...run.ledger, met] } },
      { type: 'turnBack' },
    );
    expect(turned.mission?.venture).toMatchObject({ depth: 'deep', out: 'edge' });
    const back = walk(turned);
    expect(back.mission).toBeNull();
    expect(back.journal.entries.at(-1)?.chips?.map((c) => c.label)).toEqual(['A day in the wild']);
    expect(back.reports.at(-1)).toMatchObject({
      kind: 'venture-over',
      reached: 'As far as the edge, then back',
      days: 1,
      road: [expect.objectContaining({ text: 'You weeded a hermit’s beans.' })],
    });
  });

  it('comes out with a card of what the wild gave since you went in', () => {
    const going = act(newGame(), { type: 'venture', placeId: WOODS, depth: 'edge' });
    const finds = { ...going.fieldBook.finds, 'wild-mushrooms': 2 };
    const foes = { ...going.fieldBook.foes, 'grey-wolf': { fought: 1, beaten: 1 } };
    const out = walk({ ...going, fieldBook: { ...going.fieldBook, finds, foes } });
    expect(out.reports.at(-1)).toMatchObject({
      kind: 'venture-over',
      country: 'the deep woods',
      reached: 'As far as the edge',
      days: 1,
      gave: { found: 2, fought: 1, beaten: 1 },
    });
  });

  it('meets foes in the wild, as on a trip of your own', () => {
    const going = act(onPass(), { type: 'venture', placeId: WOODS, depth: 'deep' });
    const kinds = Array.from({ length: 40 }, (_, i) => {
      const day = { ...going, time: { ...going.time, day: going.time.day + i } };
      return roadEventOn(day, ctx, { region: 'woods-deep', danger: 'deadly' })?.kind;
    });
    expect(kinds).toContain('encounter');
  });

  it('lets nobody down when it ends badly', () => {
    const going = act(newGame(), { type: 'venture', placeId: WOODS, depth: 'edge' });
    const { state } = endMission(going, ctx, 'You were beaten.');
    expect(state.mission).toBeNull();
    expect(state.standing).toEqual(going.standing);
    expect(state.journal.entries.at(-1)?.heading).toBe('Into the deep woods cut short');
  });

  it('camps between the days back out', () => {
    const chunin = { ...newGame(), standing: { ...newGame().standing, rank: 'chunin' as const } };
    const going = act(chunin, { type: 'venture', placeId: WOODS, depth: 'heart' });
    expect(going.leave).not.toEqual(chunin.leave);
    const kinds = ventureMission(going.mission!.venture!, ctx).stages.map((s) => s.kind);
    expect(kinds.slice(-4)).toEqual(['leg', 'camp', 'leg', 'narrative']);
  });
});
