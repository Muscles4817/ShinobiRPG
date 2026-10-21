import { ctx, newGame, withAllStats } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { fighterSight, gaugeRead, SEEN_IN_FULL } from './gaugeSight';
import { SHARP_EYES } from '../scouting';

/** How much of a fighter's bars you see: your side in full, foes by your eyes. */

const ME = { side: 'player' } as const;
const FOE = { side: 'enemy' } as const;

function withPerception(state: GameState, perception: number): GameState {
  const { character } = state;
  return { ...state, character: { ...character, stats: { ...character.stats, perception } } };
}

function awakenedClan(): string {
  const clan = ctx.content.clans.all.find((c) => c.kekkeiGenkai?.dormant === false);
  if (!clan) throw new Error('the original pack has an awakened bloodline');
  return clan.id;
}

describe('fighter sight', () => {
  it('shows your side in full, whatever your eyes', () => {
    const state = withPerception(newGame(), 0);
    expect(fighterSight(state, ctx)(ME)).toEqual(SEEN_IN_FULL);
  });

  it('reads a foe by eye: health as a bar, pools in words, chakra not at all', () => {
    const state = withPerception(newGame(), SHARP_EYES - 1);
    expect(fighterSight(state, ctx)(FOE)).toEqual({
      health: 'bar',
      chakra: 'hidden',
      pools: 'read',
    });
  });

  it('puts numbers to what sharp eyes see, and reads a foe’s chakra in a word', () => {
    const state = withPerception(newGame(), SHARP_EYES);
    expect(fighterSight(state, ctx)(FOE)).toEqual({
      health: 'exact',
      chakra: 'read',
      pools: 'exact',
    });
  });

  it('sees a foe in full with an awakened bloodline', () => {
    const base = withAllStats(newGame(), 1);
    const state = { ...base, character: { ...base.character, clanId: awakenedClan() } };
    expect(fighterSight(state, ctx)(FOE)).toEqual(SEEN_IN_FULL);
  });
});

describe('a pool read in a word', () => {
  it('reads chakra by how much is left', () => {
    expect(gaugeRead('chakra', 90, 100)).toBe('Plenty');
    expect(gaugeRead('chakra', 45, 100)).toBe('Flagging');
    expect(gaugeRead('chakra', 10, 100)).toBe('Nearly spent');
    expect(gaugeRead('chakra', 0, 100)).toBe('Spent');
  });

  it('has words of its own for breath and a hive, and plain ones for any other store', () => {
    expect(gaugeRead('breath', 20, 30)).toBe('Fresh');
    expect(gaugeRead('breath', 5, 30)).toBe('Gasping');
    expect(gaugeRead('hive', 100, 100)).toBe('A full cloud');
    expect(gaugeRead('dust', 100, 390)).toBe('Almost gone');
    expect(gaugeRead('dust', 0, 0)).toBe('Gone');
  });
});
