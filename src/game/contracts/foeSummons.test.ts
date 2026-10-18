import { ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { enemyParty } from '../combatants';
import { summonsSeen } from '../retinueSight';
import { scoutOpponents } from '../scouting';

const chief = ctx.content.enemies.require('bandit-chief');

describe('foes who summon', () => {
  it('a foe with a contract goes into the fight with the call and its technique', () => {
    const [them] = enemyParty(chief, 0, ctx);
    expect(them?.calls?.map((c) => c.id)).toEqual(['undercroft-rat']);
    expect(them?.calls?.[0]?.body.tag).toBe('Summon');
    expect(them?.techniques.map((t) => t.id)).toContain('summon-undercroft-rat');
  });

  it('a kept contract escapes dull eyes at a glance and shows in full to a report', () => {
    const dull = withAllStats(newGame(), 1);
    expect(summonsSeen(dull, chief, 'glance')).toEqual([]);
    expect(summonsSeen(dull, chief, 'full')).toEqual(chief.summons);
  });

  it('scouting counts a summon you can tell they hold, with how to deal with it', () => {
    const id = 'bandit-chief#0';
    const read = scoutOpponents(newGame(), ctx, [id], 'full')[id];
    const rat = read?.companions.find((c) => c.name === 'Undercroft Rat');
    expect(rat?.counter).toMatch(/call it into the fight/);
  });
});
