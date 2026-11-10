import type { PuppetFrameDef } from '@/content';
import {
  buildStarted,
  keepsTooMany,
  nextPuppetId,
  renamed,
  stockTaken,
  stocked,
  workedOn,
  type BuildJob,
} from '@/systems/puppets';
import { STAT_GRADES, statTier } from '@/systems/stats';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { chip, log, placesHere } from '../ops';
import type { GameState } from '../state';
import { sealCap, SEAL_RYO, sealsProblem } from './seals';
import { atABench, atWorkshop, puppetRoom, WORKSHOP_REACH } from './workshop';
import { knowsPuppetry } from './yours';

/**
 * Building puppets at a bench (`docs/design/retinue-plan.md`, step 5b-ii; your own at home, or a
 * workshop's, `workshop.ts`): materials
 * bought by the lot where a shop sells them, a frame your craft can manage, mechanisms for its
 * slots, and days of work, one session a day. A rebuild puts one of your built puppets back on
 * the bench with new mechanisms or material, for half the materials and half the days.
 */

/** Longest name a puppet takes. */
export const NAME_MAX = 24;

/** What you set on the bench: a new puppet, or one of yours to rebuild. */
export interface BuildOrder {
  readonly frameId: string;
  readonly partIds: readonly string[];
  readonly materialId: string;
  readonly name: string;
  /** Your own techniques to seal into its slots (`seals.ts`). */
  readonly seals?: readonly string[];
  /** One of your built puppets, to rebuild; absent for a new one. */
  readonly puppetId?: string;
}

/** Why you can't buy a lot of this material here now, or null. */
export function buyMaterialBlocker(
  state: GameState,
  ctx: GameContext,
  sale: { readonly placeId: string; readonly materialId: string },
): string | null {
  const sold = placesHere(state, ctx, 'gear').some(
    (p) => p.id === sale.placeId && (p.materialIds ?? []).includes(sale.materialId),
  );
  const material = ctx.content.puppetMaterials.get(sale.materialId);
  if (!sold || !material) return 'Nobody here sells that.';
  return state.wallet.ryo < material.price ? `A lot costs ${material.price} ryo.` : null;
}

export function buyMaterial(state: GameState, ctx: GameContext, materialId: string): GameState {
  const material = ctx.content.puppetMaterials.require(materialId);
  const paid = spend(state.wallet, material.price);
  if (!paid.ok) return state;
  return log(
    { ...state, wallet: paid.value, puppetry: stocked(state.puppetry, materialId, 1) },
    {
      text: `You buy a lot of ${material.name.toLowerCase()} for the bench.`,
      tone: 'success',
      chips: [chip(`−${material.price} ryo`, 'cost'), chip('+1 lot', 'gain')],
    },
  );
}

/** Lots and days a build of this frame takes: half of each for a rebuild. */
export function buildNeeds(
  frame: PuppetFrameDef,
  rebuild: boolean,
): { readonly lots: number; readonly days: number } {
  return rebuild
    ? { lots: Math.ceil(frame.lots / 2), days: Math.ceil(frame.days / 2) }
    : { lots: frame.lots, days: frame.days };
}

/** Ryo the mechanisms and seals cost. */
export function partsCost(
  ctx: GameContext,
  partIds: readonly string[],
  seals: readonly string[] = [],
): number {
  const parts = partIds.reduce((sum, id) => sum + (ctx.content.puppetParts.get(id)?.cost ?? 0), 0);
  return parts + seals.length * SEAL_RYO;
}

/** Whether your craft can manage a frame here: a workshop's bench reaches a grade further. */
export function craftManages(state: GameState, ctx: GameContext, frame: PuppetFrameDef): boolean {
  const reach = atWorkshop(state, ctx) ? WORKSHOP_REACH : 0;
  const yours = STAT_GRADES.indexOf(statTier(state.puppetry.craft).grade) + reach;
  return yours >= STAT_GRADES.indexOf(frame.craft);
}

function orderProblem(state: GameState, ctx: GameContext, order: BuildOrder): string | null {
  const frame = ctx.content.puppetFrames.get(order.frameId);
  if (!frame || !ctx.content.puppetMaterials.get(order.materialId)) return 'No such frame.';
  if (!craftManages(state, ctx, frame))
    return `${frame.name} asks for more craft than your hands have.`;
  const seals = order.seals ?? [];
  const parts = new Set(order.partIds);
  if (parts.size !== order.partIds.length || order.partIds.length + seals.length === 0)
    return 'Fit at least one mechanism or seal, each once.';
  if (order.partIds.length + seals.length > frame.slots)
    return `${frame.name} holds ${frame.slots} mechanisms and seals.`;
  if (order.partIds.some((id) => !ctx.content.puppetParts.get(id))) return 'No such mechanism.';
  const sealed = sealsProblem(state, ctx, seals);
  if (sealed) return sealed;
  const name = order.name.trim();
  return name.length === 0 || name.length > NAME_MAX ? 'Give it a short name.' : null;
}

function rebuildProblem(state: GameState, order: BuildOrder): string | null {
  if (order.puppetId === undefined) return null;
  const puppet = state.puppetry.puppets.find((p) => p.id === order.puppetId);
  return puppet?.built ? null : 'Only a puppet you built can be rebuilt.';
}

/** Why you can't set this build on the bench now, or null. */
export function startBuildBlocker(
  state: GameState,
  ctx: GameContext,
  order: BuildOrder,
): string | null {
  if (!knowsPuppetry(state, ctx)) return 'Learn the art of the threads first.';
  if (!atABench(state, ctx)) return 'You build at a bench: your own at home, or a workshop’s.';
  if (state.puppetry.build) return 'Something is on the bench already.';
  const problem = orderProblem(state, ctx, order) ?? rebuildProblem(state, order);
  if (problem) return problem;
  const id = order.puppetId ?? nextPuppetId(state.puppetry);
  if (keepsTooMany(state.puppetry, id, puppetRoom(state, ctx)))
    return 'You keep as many puppets as your home has room for.';
  const frame = ctx.content.puppetFrames.require(order.frameId);
  const { lots } = buildNeeds(frame, order.puppetId !== undefined);
  if ((state.puppetry.stock[order.materialId] ?? 0) < lots)
    return `It takes ${lots} lots of material.`;
  const ryo = partsCost(ctx, order.partIds, order.seals);
  return state.wallet.ryo < ryo ? `The mechanisms and seals cost ${ryo} ryo.` : null;
}

export function startBuild(state: GameState, ctx: GameContext, order: BuildOrder): GameState {
  const frame = ctx.content.puppetFrames.require(order.frameId);
  const rebuild = order.puppetId !== undefined;
  const { lots, days } = buildNeeds(frame, rebuild);
  const taken = stockTaken(state.puppetry, order.materialId, lots);
  const ryo = partsCost(ctx, order.partIds, order.seals);
  const paid = spend(state.wallet, ryo);
  if (!taken || !paid.ok) return state;
  const job: BuildJob = {
    puppetId: order.puppetId ?? nextPuppetId(state.puppetry),
    name: order.name.trim(),
    frameId: order.frameId,
    partIds: order.partIds,
    materialId: order.materialId,
    ...(order.seals && order.seals.length > 0
      ? { seals: order.seals, sealCap: sealCap(state) }
      : {}),
    daysLeft: days,
  };
  return log(
    { ...state, wallet: paid.value, puppetry: buildStarted(taken, job) },
    {
      heading: rebuild ? `${job.name} goes back on the bench` : `${job.name} on the bench`,
      text: `You lay out the ${frame.name.toLowerCase()} and its mechanisms. A few days’ work will see it walk.`,
      tone: 'success',
      chips: [chip(`−${lots} lots`, 'cost'), ...(ryo > 0 ? [chip(`−${ryo} ryo`, 'cost')] : [])],
    },
  );
}

/** Why you can't work on the build today, or null. Energy and the slot are the action's. */
export function workBlocker(state: GameState, ctx: GameContext): string | null {
  const job = state.puppetry.build;
  if (!job) return 'Nothing is on the bench.';
  if (!atABench(state, ctx)) return 'Work on it at a bench: your own at home, or a workshop’s.';
  return job.workedDay === state.time.day ? 'You have worked on it today.' : null;
}

export function workOnBuild(state: GameState): GameState {
  const job = state.puppetry.build;
  if (!job) return state;
  const puppetry = workedOn(state.puppetry, state.time.day);
  const done = puppetry.build === null;
  return log(
    { ...state, puppetry },
    done
      ? {
          heading: `${job.name} is finished`,
          text: `The last joint goes in, the threads take, and ${job.name} stands up on its own.`,
          tone: 'success',
          chips: [chip('Puppet built', 'gain')],
        }
      : { text: `A day at the bench on ${job.name}. It is coming along.`, tone: 'info' },
  );
}

/** Why you can't give a puppet this name, or null. */
export function renameBlocker(state: GameState, puppetId: string, name: string): string | null {
  if (!state.puppetry.puppets.some((p) => p.id === puppetId))
    return 'That isn’t one of your puppets.';
  const trimmed = name.trim();
  return trimmed.length === 0 || trimmed.length > NAME_MAX ? 'Give it a short name.' : null;
}

export function renamePuppet(state: GameState, puppetId: string, name: string): GameState {
  return { ...state, puppetry: renamed(state.puppetry, puppetId, name.trim()) };
}
