import { NOMINATION_REGARD } from '@/game/exam/entry';
import { evenAptitude, fightingPower } from '@/systems/stats';
import { newGame } from '@/test/gameFixtures';

import { playFocused, type FocusPlan } from './focusedPlayer';

/**
 * PACING THE SENSEI'S WEEK
 *
 * The same focused player, once keeping every session their sensei plans and once skipping
 * them (the weekly lesson they still take). Keeping them pays, in growth and in the sensei's
 * regard the nomination reads, but a daily sensei doesn't run away with the game.
 */

const MONTH = 30;
/** The follower is ahead, but by no more than this share of fighting power. */
const RUNAWAY_SHARE = 0.15;

const FOLLOWER: FocusPlan = {
  focus: 'taijutsu',
  drillId: 'post-kicks',
  missionEveryDays: 2,
  withTeachers: true,
};
const SKIPPER: FocusPlan = { ...FOLLOWER, skipsSessions: true };

function ordinaryTalent() {
  const game = newGame();
  return { ...game, character: { ...game.character, aptitude: evenAptitude(1) } };
}

describe('pacing: the sensei’s week', () => {
  const kept = playFocused(ordinaryTalent(), FOLLOWER, MONTH).state;
  const skipped = playFocused(ordinaryTalent(), SKIPPER, MONTH).state;

  it('keeping the sessions puts you ahead, but not by a runaway margin', () => {
    const ahead = fightingPower(kept.character.stats) / fightingPower(skipped.character.stats);
    expect(ahead).toBeGreaterThan(1);
    expect(ahead).toBeLessThan(1 + RUNAWAY_SHARE);
  });

  it('the sensei rates the one who comes, and won’t vouch for the one who doesn’t', () => {
    expect(kept.mentor.regard).toBeGreaterThanOrEqual(NOMINATION_REGARD);
    expect(skipped.mentor.regard).toBeLessThan(NOMINATION_REGARD);
  });
});
