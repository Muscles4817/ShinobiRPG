import type { GameContext } from '../context';
import { buildNeeds, craftManages, NAME_MAX } from '../puppetry/bench';
import { knowsPuppetry } from '../puppetry/yours';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { MATERIAL_GRADES } from './materialsOnShelf';

/**
 * The bench on the puppet card: what is on it and how many days it needs, the materials you
 * keep, and everything a new build or a rebuild is chosen from (frames your craft can and can't
 * manage yet, mechanisms with their cost, materials with your stock). The choice itself is made
 * on the screen and checked with `blockerFor` before it is set on the bench.
 */

export interface BenchFrame {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly slots: number;
  /** Lots and days a new build takes. */
  readonly lots: number;
  readonly days: number;
  /** Lots and days a rebuild on it takes. */
  readonly rebuild: { readonly lots: number; readonly days: number };
  /** Why your craft can't manage it yet, or null. */
  readonly beyond: string | null;
}

export interface BenchPart {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
}

export interface BenchMaterial {
  readonly id: string;
  readonly name: string;
  readonly grade: string;
  readonly held: number;
}

export interface BenchJob {
  readonly name: string;
  readonly daysLeft: number;
  readonly work: Choice;
}

export interface BenchView {
  readonly job: BenchJob | null;
  readonly frames: readonly BenchFrame[];
  readonly parts: readonly BenchPart[];
  readonly materials: readonly BenchMaterial[];
  readonly nameMax: number;
}

/** The bench, for someone who knows the art; null for anyone else. */
export function benchView(state: GameState, ctx: GameContext): BenchView | null {
  if (!knowsPuppetry(state, ctx)) return null;
  const job = state.puppetry.build;
  return {
    job: job
      ? {
          name: job.name,
          daysLeft: job.daysLeft,
          work: choice(state, ctx, { type: 'workOnBuild' }),
        }
      : null,
    frames: ctx.content.puppetFrames.all.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      slots: f.slots,
      ...buildNeeds(f, false),
      rebuild: buildNeeds(f, true),
      beyond: craftManages(state, f) ? null : `Asks for ${f.craft}-grade craft.`,
    })),
    parts: ctx.content.puppetParts.all.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cost: p.cost,
    })),
    materials: ctx.content.puppetMaterials.all.map((m) => ({
      id: m.id,
      name: m.name,
      grade: MATERIAL_GRADES[m.quality],
      held: state.puppetry.stock[m.id] ?? 0,
    })),
    nameMax: NAME_MAX,
  };
}
