import { ORIGINAL_FOE_KIT } from '@/content/packs/original/bestiaryKit';
import { bestiary } from '@/content/shared/bestiary';
import { enemyParty } from '@/game/combatants';
import type { CombatantSetup } from '@/systems/combat';
import { identityOf, identityProblems, type Identity } from '@/systems/combat/engines/plan/mind';
import { initialFighters, type PlanFighter } from '@/systems/combat/engines/plan/state';
import { ctx } from '@/test/gameFixtures';

import { SCALES, toSetup } from './fighters';
import { castMember, CAST_IDS } from './matrixCast';

/**
 * Every fighter has a fighting identity for free (`engines/plan/mind/identity.ts`): derived from
 * body, kit and traits, it holds together for the whole bench cast at every scale and for every
 * bestiary foe and its retinue, and it reads each kind of fighter the way they fight. Set
 * `VITE_BENCH_REPORT=true` to print the cast's identities.
 */

function asFighter(setup: CombatantSetup): PlanFighter {
  const [f] = initialFighters({ player: setup, allies: [], enemies: [], canFlee: false });
  return f!;
}

const CAST = SCALES.flatMap((scale) =>
  CAST_IDS.map(
    (id) => [`${id} (${scale})`, asFighter(toSetup(castMember(id, scale), 'p'))] as const,
  ),
);
const FOES = bestiary(ORIGINAL_FOE_KIT).flatMap((e) =>
  enemyParty(ctx.content.enemies.require(e.id), 0, ctx).map((s) => [s.id, asFighter(s)] as const),
);

const chunin = (id: (typeof CAST_IDS)[number]) =>
  identityOf(asFighter(toSetup(castMember(id, 'chunin'), 'p')));

describe('a fighting identity for every fighter', () => {
  it.each([...CAST, ...FOES])('%s holds together', (_, f) => {
    expect(identityProblems(f, identityOf(f))).toEqual([]);
  });

  it('reads each kind of fighter the way it fights', () => {
    const rusher = chunin('rusher');
    const illusionist = chunin('illusionist');
    const medic = chunin('medic');
    expect(rusher.range).toBe('close');
    expect(rusher.aggression).toBeGreaterThan(illusionist.aggression);
    expect(illusionist.deception).toBeGreaterThan(rusher.deception);
    expect(medic.philosophy.protect).toBeGreaterThan(rusher.philosophy.protect);
  });

  it('gives foes of different trades different identities', () => {
    const kinds = new Set(FOES.map(([, f]) => JSON.stringify(rounded(identityOf(f)))));
    expect(kinds.size).toBeGreaterThan(FOES.length / 3);
  });

  it.runIf(import.meta.env.VITE_BENCH_REPORT === 'true')('prints the cast', () => {
    for (const id of CAST_IDS) console.warn(`${id}: ${JSON.stringify(rounded(chunin(id)))}`);
  });
});

function rounded(i: Identity) {
  const r = (n: number) => Math.round(n * 10) / 10;
  const philosophy = Object.fromEntries(Object.entries(i.philosophy).map(([k, v]) => [k, r(v)]));
  return {
    range: i.range,
    pull: r(i.rangePull),
    aggression: r(i.aggression),
    risk: r(i.risk),
    resources: r(i.resources),
    deception: r(i.deception),
    discipline: r(i.discipline),
    philosophy,
  };
}
