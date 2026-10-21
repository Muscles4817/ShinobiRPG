import type { ArmourLevel, CombatGear } from '@/systems/combat';

import { foe, plainAtScale, plainFighter } from './archetypes';
import { SCALE_VALUES, statLine, type FighterSpec } from './fighters';
import { bench, summarise, type BenchReport } from './runner';

/**
 * THE GEAR BENCH (step 4.3)
 *
 * Gear changes how you fight, not your stats, so its worth is measured in fights:
 *  - Armour is a trade. Head-on against blows, heavier armour wins more often; against a
 *    fighter who keeps their distance, its weight loses the race to close in.
 *  - Strength carries armour: a strong wearer barely feels the weight.
 *  - A blade is worth carrying for someone who trained the sword.
 * Set VITE_BENCH_REPORT=true to print the measurements.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
/** Strength well into grade B: enough to carry plate. */
const STRONG = 30;

function wearing(base: FighterSpec, level: ArmourLevel | null, strength?: number): FighterSpec {
  const gear: CombatGear = level ? { armour: { name: level, level, rank: 'D' } } : {};
  const stats = strength === undefined ? base.stats : { ...base.stats, strength };
  const strong = strength === undefined ? '' : ` (strength ${strength})`;
  return { ...base, name: `${base.name} in ${level ?? 'no armour'}${strong}`, stats, gear };
}

function run(player: FighterSpec, opponent: FighterSpec): BenchReport {
  const report = bench(player, opponent);
  if (REPORT) console.warn(summarise(player, opponent, report));
  return report;
}

const me = plainAtScale('chunin');

describe('armour is a trade (step 4.3)', () => {
  it('head-on against blows, heavier armour wins more often', () => {
    const equal = plainAtScale('chunin');
    const rates = ([null, 'flak', 'heavy', 'plate'] as const).map(
      (level) => run(wearing(me, level), equal).winRate,
    );
    const [none, flak, heavy, plate] = rates;
    expect(flak).toBeGreaterThan(none!);
    expect(heavy).toBeGreaterThan(flak!);
    expect(plate).toBeGreaterThanOrEqual(heavy!);
    expect(plate! - none!).toBeGreaterThan(0.3);
  });

  it('against a fighter who keeps their distance, its weight loses', () => {
    const archer = foe('archer', 'chunin');
    const none = run(wearing(me, null), archer).winRate;
    const plate = run(wearing(me, 'plate'), archer).winRate;
    // An archer kites anyone who has to close in; plate only makes it worse.
    expect(none).toBeGreaterThan(plate);
  });

  it('strength carries it: a strong wearer barely feels the weight', () => {
    const archer = foe('archer', 'chunin');
    const none = run(wearing(me, null, STRONG), archer);
    const plate = run(wearing(me, 'plate', STRONG), archer);
    expect(Math.abs(none.winRate - plate.winRate)).toBeLessThanOrEqual(0.1);
    expect(plate.avgHealthLeft).toBeGreaterThanOrEqual(none.avgHealthLeft - 0.05);
  });
});

describe('a blade is worth carrying (step 4.3)', () => {
  it('for someone who trained the sword, the cut beats the bare blow', () => {
    const swordsman: FighterSpec = {
      name: 'Swordsman (chunin)',
      stats: statLine('chunin', { kenjutsu: 'peak', taijutsu: 'weak' }),
      techniques: [],
    };
    const blade: CombatGear = { held: { name: 'Blade', weaponClass: 'sword', rank: 'D' } };
    // Someone the swordsman can't beat bare-handed: their skill defends them either way, so
    // only a foe a match for them shows what the blade adds.
    const match = plainFighter(SCALE_VALUES.chunin.strong);
    const bare = run({ ...swordsman, gear: {} }, match);
    const armed = run({ ...swordsman, name: 'Swordsman with a blade', gear: blade }, match);
    expect(armed.winRate).toBeGreaterThan(bare.winRate + 0.2);
  });
});
