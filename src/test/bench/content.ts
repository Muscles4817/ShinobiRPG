import { createRng } from '@/core';
import { createNewGame, type GameState } from '@/game';
import { enemyCombatant, playerCombatant } from '@/game/combatants';
import { findPerson } from '@/game/people/cast';
import { companionCombatant } from '@/game/people/companions';
import { stageFoes } from '@/systems/missions';
import { createPlanEngine, type CombatSetup, type CombatantSetup } from '@/systems/combat';
import type { Discipline } from '@/systems/techniques';
import { ctx, draft, formTeam } from '@/test/gameFixtures';

import { STALEMATE_EXCHANGES } from './runner';

/**
 * The bench with the pack's own people: a character fresh out of creation, fighting the
 * classmates, rivals and D-rank foes the game actually puts in front of them. The archetype
 * bench (`bench.test.ts`) keeps its fighters' stats even; real people are not even (they
 * specialise), and that is where balance breaks first.
 */

/** The nature every bench character has, so the bench measures plans and not the paper's roll. */
const BENCH_NATURE = 'fire';

/**
 * A new game whose character is a steady student of `specialty` in the middle of the class,
 * team formed, with the bench's nature.
 */
export function freshCharacter(specialty: Discipline, talentId = 'sensor'): GameState {
  const quickPick = { archetype: 'steady', specialty } as const;
  const game = createNewGame({ draft: draft({ quickPick, talentId }), seed: 1234 }, ctx);
  return formTeam({ ...game, character: { ...game.character, nature: BENCH_NATURE } });
}

/** A genin of the cast (authored or generated) as a sparring opponent. */
export function classmate(state: GameState, personId: string): CombatantSetup {
  const person = findPerson(state, ctx, personId);
  if (!person) throw new Error(`No person ${personId}`);
  return companionCombatant(person, state, ctx, 'Sparring');
}

/** Every genin the character could spar with: the authored ones and their generated year. */
export function classmateIds(state: GameState): string[] {
  const authored = ctx.content.people.all.filter((p) => p.role === 'genin').map((p) => p.id);
  return [...authored, ...state.people.generated.map((p) => p.id)];
}

/** The foes a genin meets on D-rank jobs (alone or, for armed ones, with their team). */
export function dRankFoeIds(): string[] {
  const jobs = ctx.content.missions.all.filter((m) => m.rank === 'D');
  return [...new Set(jobs.flatMap((m) => m.stages.flatMap(stageFoes)))];
}

export function foe(enemyId: string): CombatantSetup {
  return enemyCombatant(ctx.content.enemies.require(enemyId), 0, ctx);
}

/** The character against one opponent, on their remembered (here: default) plan. */
export function against(state: GameState, opponent: CombatantSetup): CombatSetup {
  return { player: playerCombatant(state, ctx), allies: [], enemies: [opponent], canFlee: false };
}

/** The character against an AI copy of themselves: the plan against the foes' instincts. */
export function mirror(state: GameState): CombatSetup {
  const player = playerCombatant(state, ctx);
  return { player, allies: [], enemies: [{ ...player, id: 'mirror' }], canFlee: false };
}

export interface ContentReport {
  readonly winRate: number;
  readonly avgExchanges: number;
  /** Share of fights in which a single hit took half the player's health or more. */
  readonly heavyHitRate: number;
}

const HEAVY_HIT = 50;

/** `seeds` fights of one setup, played the way the bench plays them. */
export function contentBench(setup: CombatSetup, seeds = 60): ContentReport {
  const engine = createPlanEngine();
  let wins = 0;
  let exchanges = 0;
  let heavy = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const rng = createRng(seed * 7919);
    let state = engine.start(setup, rng);
    let count = 0;
    while (!engine.outcome(state) && count < STALEMATE_EXCHANGES) {
      const begin = engine.view(state).options.some((o) => o.id === 'begin');
      const next = engine.act(state, { optionId: begin ? 'begin' : 'next' }, rng);
      if (!next.ok) throw new Error(next.error);
      state = next.value;
      if (!begin) count += 1;
    }
    const hits = engine.view(state).log.flatMap((l) => [...l.matchAll(/⟦-(\d+)⟧/g)]);
    if (hits.some((m) => Number(m[1]) >= HEAVY_HIT)) heavy += 1;
    if (engine.outcome(state)?.result === 'victory') wins += 1;
    exchanges += count;
  }
  return { winRate: wins / seeds, avgExchanges: exchanges / seeds, heavyHitRate: heavy / seeds };
}
