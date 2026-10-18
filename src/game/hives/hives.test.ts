import { ctx, draft } from '@/test/gameFixtures';
import { maxChakra } from '@/systems/vitals';

import { playerCombatant } from '../combatants';
import { createNewGame } from '../creation';
import { spendTime } from '../ops';
import { companionCombatant } from '../people/companions';
import { slotsUntilNextMorning } from '@/systems/time';
import { chakraBody, yourHive } from './hive';
import { afterHiveFight, hiveDayPassed } from './keeping';

/** A hive in the body: born with the clan, paid for in chakra, spent in fights, bred back. */

function moth(share: 'little' | 'half' | 'most' = 'half') {
  return createNewGame({ draft: draft({ clanId: 'toga', hiveShare: share }), seed: 1234 }, ctx);
}

const victory = (swarm: number) => ({
  result: 'victory' as const,
  rounds: 2,
  player: { health: 80, chakra: 10 },
  swarm,
});

describe('a hive in the body', () => {
  it('a child of a hive clan is born with a full hive; others have none', () => {
    const state = moth();
    const yours = yourHive(state, ctx);
    expect(yours?.strain.id).toBe('lantern-moth');
    expect(yours?.hive.count).toBe(yours?.cap);
    expect(yourHive(createNewGame({ draft: draft(), seed: 1234 }, ctx), ctx)).toBeNull();
  });

  it('a bigger share keeps more insects and leaves less chakra', () => {
    const little = moth('little');
    const most = moth('most');
    expect(yourHive(most, ctx)!.cap).toBeGreaterThan(yourHive(little, ctx)!.cap);
    expect(maxChakra(chakraBody(most))).toBeLessThan(maxChakra(chakraBody(little)));
    expect(most.character.vitals.chakra).toBe(maxChakra(chakraBody(most)));
  });

  it('goes into a fight and comes back with what survived', () => {
    const state = moth();
    const swarm = playerCombatant(state, ctx).swarm;
    expect(swarm?.count).toBe(yourHive(state, ctx)!.cap);
    expect(afterHiveFight(state, victory(5), ctx).hive?.count).toBe(5);
  });

  it('breeds back each day, faster in the home village', () => {
    const thinned = afterHiveFight(moth(), victory(5), ctx);
    const morning = spendTime(thinned, slotsUntilNextMorning(thinned.time), ctx);
    expect(morning.hive!.count).toBeGreaterThan(5);
  });

  it('gives an old save of a hive clan its hive the first time a day passes', () => {
    const old = { ...moth(), hive: null };
    expect(hiveDayPassed(old, ctx).hive?.strainId).toBe('lantern-moth');
  });

  it('the clan’s people fight with a hive of their own', () => {
    const mayu = ctx.content.people.require('mayu');
    expect(companionCombatant(mayu, moth(), ctx, 'Ally').swarm?.strain.name).toBe('Lantern Moths');
  });
});
