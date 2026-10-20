import type { PersonDef } from '@/content';
import { oldEnoughToFight } from '@/systems/companions';
import { answers } from '@/systems/contracts';
import type { CombatSwarm } from '@/systems/combat';
import { fightingPower, type Stats } from '@/systems/stats';

import { stageOfLife } from '../companions/body';
import { yourCompanion } from '../companions/care';
import type { GameContext } from '../context';
import { personHive, swarmOf, yourHive } from '../hives/hive';
import { heldContract } from '../contracts/summons';
import { personStats } from '../people/progress';
import type { GameState } from '../state';
import type { ReadinessLine } from './fighterTypes';

/**
 * What a fighter brings besides their own stats, read for readiness on the same scale
 * (`fighterTypes.ts`): a companion's fighting level (none while it is too young to fight), a
 * hive's strain graded by its qualities and how full it is, and the strongest summon that
 * answers at the standing you have with your contract. Nothing here is a cause for a sensei
 * to set work; it is what lets a beast partner, a hive user or a summoner be judged as one.
 */

/** What a strain grade (1 for E to 5 for A) is worth on the stat scale: about the grade's middle. */
const GRADE_VALUE: readonly number[] = [4, 10, 16, 24, 34];

/** A hive as a fighter: its strain's fighting qualities, by how full it is. */
export function hiveValue(swarm: CombatSwarm): number {
  const { speed, bite, toughness, brood } = swarm.strain.qualities;
  const grade = (speed + bite + toughness + brood) / 4;
  const low = Math.floor(grade);
  const at = (g: number) => GRADE_VALUE[Math.min(GRADE_VALUE.length, Math.max(1, g)) - 1] ?? 0;
  const value = at(low) + (at(low + 1) - at(low)) * (grade - low);
  const full = swarm.cap > 0 ? Math.min(1, swarm.count / swarm.cap) : 0;
  return value * full;
}

function companionValue(state: GameState, ctx: GameContext): number {
  const yours = yourCompanion(state, ctx);
  if (!yours || !oldEnoughToFight(stageOfLife(yours.companion, yours.kind))) return 0;
  return fightingPower(yours.companion.stats);
}

function summonsValue(state: GameState, ctx: GameContext): number {
  const held = heldContract(state, ctx);
  if (!held) return 0;
  const answering = held.def.summons.filter((s) => answers(held.contract, s.standing));
  return Math.max(0, ...answering.map((s) => fightingPower(s.stats)));
}

/** What readiness reads of you: your stats, and the partner, hive and summons you bring. */
export function readinessLine(state: GameState, ctx: GameContext): ReadinessLine {
  const hive = yourHive(state, ctx);
  return {
    ...state.character.stats,
    companion: companionValue(state, ctx),
    hive: hive ? hiveValue(swarmOf(hive.strain, hive.hive.count, hive.cap)) : 0,
    summons: summonsValue(state, ctx),
  };
}

/** What readiness reads of someone else: their stats, and the hive their clan gives them. */
export function personReadinessLine(
  person: PersonDef,
  state: GameState,
  ctx: GameContext,
): ReadinessLine {
  const stats: Stats = personStats(person, state);
  const clan = person.clanId ? ctx.content.clans.get(person.clanId) : undefined;
  const { swarm } = personHive(stats, clan, ctx);
  return { ...stats, ...(swarm ? { hive: hiveValue(swarm) } : {}) };
}
