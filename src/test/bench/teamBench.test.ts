import type { CombatTechnique } from '@/systems/combat';

import { foe, plainAtGrade } from './archetypes';
import { techniques, type FighterSpec } from './fighters';
import { benchSkirmish, summarise, type BenchReport, type Skirmish } from './runner';

/**
 * THE TEAM BENCH (step 1.7)
 *
 * Team fights through the Plan & Watch engine: teammates fight by their stance, the side's
 * combos land harder. Checks that each team tool earns its place:
 *  - a teammate covering the back row keeps it in better shape than one pressing;
 *  - element combos (earth and water) end fights sooner than the same team without them;
 *  - a pair who know a combination technique end fights sooner than the same pair without it.
 * Set VITE_BENCH_REPORT=true to print every measurement.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';

function skirmish(label: string, fight: Skirmish): BenchReport {
  const report = benchSkirmish(fight);
  if (REPORT) console.warn(`${label}: ${summarise(fight.player, fight.foes[0]!, report)}`);
  return report;
}

/** A technique without its element, to compare the same team with and without a combo. */
function plain(t: CombatTechnique): CombatTechnique {
  const { element: _none, ...rest } = t;
  return { ...rest, id: `${t.id}-plain` };
}

/** A teammate as plain as the player, knowing the given techniques. */
function mate(name: string, known: readonly CombatTechnique[]): FighterSpec {
  return { ...plainAtGrade('C'), name, techniques: known };
}

describe('team fights (step 1.7)', () => {
  it('a teammate covering the back row keeps it in better shape than one pressing', () => {
    // You stand at the back; three archers' kunai reach you over your teammate.
    const you: FighterSpec = { ...plainAtGrade('D'), row: 'back' };
    const archers = [foe('archer', 'chunin'), foe('archer', 'chunin'), foe('archer', 'chunin')];
    const guard = (stance: FighterSpec['stance']): Skirmish => ({
      player: you,
      allies: [{ ...plainAtGrade('C'), name: 'Mate', row: 'front', ...(stance ? { stance } : {}) }],
      foes: archers,
    });
    const covered = skirmish('Covered back row', guard({ kind: 'cover', covers: 'player' }));
    const pressed = skirmish('Pressing teammate', guard({ kind: 'press' }));
    expect(covered.avgHealthLeft).toBeGreaterThan(pressed.avgHealthLeft);
    expect(covered.stalemateRate).toBe(0);
  });

  it('element combos fire: earth and water together end fights sooner', () => {
    const [pebbles, tide] = techniques(['pebble-volley', 'tide-lash']);
    const foes = [foe('guardian', 'chunin'), foe('brute', 'chunin')];
    const team = (water: CombatTechnique): Skirmish => ({
      player: { ...plainAtGrade('C'), techniques: [pebbles!] },
      allies: [mate('Water mate', [water])],
      foes,
    });
    const combo = skirmish('Earth and water', team(tide!));
    const without = skirmish('Earth and plain', team(plain(tide!)));
    expect(combo.avgExchanges).toBeLessThan(without.avgExchanges);
  });

  it('a pair who know a combination technique end fights sooner', () => {
    const [snare, anvil] = techniques(['shrine-snare', 'anvil-fall']);
    const foes = [foe('guardian', 'chunin'), foe('brute', 'chunin')];
    const pair = (lead: CombatTechnique, partner: CombatTechnique): Skirmish => ({
      player: { ...plainAtGrade('C'), techniques: [lead] },
      allies: [mate('Blade mate', [partner])],
      foes,
    });
    const together = skirmish('Snare and anvil, together', pair(snare!, anvil!));
    const { combo: _a, ...soloSnare } = snare!;
    const { combo: _b, ...soloAnvil } = anvil!;
    const apart = skirmish('Snare and anvil, apart', pair(soloSnare, soloAnvil));
    expect(together.avgExchanges).toBeLessThan(apart.avgExchanges);
  });

  it('a team in its default stances wins cleanly against a mixed band', () => {
    const report = skirmish('C team v brute, archer and trickster', {
      player: plainAtGrade('C'),
      allies: [
        { ...foe('trickster', 'chunin'), name: 'Illusion mate' },
        {
          ...foe('guardian', 'chunin'),
          name: 'Blade mate',
          stance: { kind: 'cover', covers: 'player' },
        },
      ],
      foes: [foe('brute', 'chunin'), foe('archer', 'chunin'), foe('trickster', 'chunin')],
    });
    expect(report.stalemateRate).toBe(0);
    expect(report.winRate).toBeGreaterThan(0.5);
  });
});
