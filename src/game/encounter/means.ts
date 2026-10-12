import type { ToolDef } from '@/content';
import { fieldPotencyOf } from '@/systems/combat';
import { restockPouch, toolCount } from '@/systems/inventory';
import type { StatId } from '@/systems/stats';
import type { FieldId, TechniqueDef, Verb } from '@/systems/techniques';

import { hasInsight } from '../combatants';
import type { GameContext } from '../context';
import { combatStats } from '../gear';
import type { GameState } from '../state';

/**
 * What the character can bring to an encounter besides plain stats: a way to feel chakra, a
 * technique or tool to hide behind, something to prepare the ground with. Access is the throttle:
 * without the means, the approach stays closed and says what would open it.
 */

/** Ninjutsu at which a shinobi can feel chakra without a sensing technique (grade D). */
export const SENSE_NINJUTSU = 10;

export type SenseMeans = 'insight' | 'technique' | 'ninjutsu';

function knownWith(state: GameState, ctx: GameContext, verb: Verb): TechniqueDef[] {
  return state.techniques.known
    .map((id) => ctx.content.techniques.require(id))
    .filter((t) => t.effects.some((e) => e.verb === verb));
}

/** How you could sense the foes: an awakened bloodline (certain), a technique, or raw ninjutsu. */
export function senseMeans(state: GameState, ctx: GameContext): SenseMeans | null {
  if (hasInsight(state, ctx)) return 'insight';
  if (knownWith(state, ctx, 'sense').length > 0) return 'technique';
  return state.character.stats.ninjutsu >= SENSE_NINJUTSU ? 'ninjutsu' : null;
}

/** A tool in your pouch that does `effect`, if any. */
export function toolInPouch(
  state: GameState,
  ctx: GameContext,
  effect: ToolDef['effect'],
): ToolDef | null {
  return (
    ctx.content.tools.all.find(
      (t) => t.effect === effect && toolCount(state.inventory, t.id) > 0,
    ) ?? null
  );
}

/** Uses one of a tool up. */
export function useTool(state: GameState, tool: ToolDef): GameState {
  const left = toolCount(state.inventory, tool.id) - 1;
  return { ...state, inventory: restockPouch(state.inventory, { [tool.id]: left }) };
}

/** How you'd slip past: your speed, or your genjutsu when you know how to hide in it. */
export function stealthOf(state: GameState, ctx: GameContext): { stat: StatId; value: number } {
  const { stats } = state.character;
  const hides = knownWith(state, ctx, 'conceal').length + knownWith(state, ctx, 'field').length;
  return hides > 0 && stats.genjutsu > stats.speed
    ? { stat: 'genjutsu', value: stats.genjutsu }
    : { stat: 'speed', value: stats.speed };
}

/** What you'd set the ground with: a field to raise, a trap to lay, or a smoke bomb. */
export type GroundMeans =
  | {
      readonly kind: 'field';
      readonly name: string;
      readonly field: FieldId;
      readonly potency: number;
    }
  | { readonly kind: 'trap'; readonly name: string }
  | {
      readonly kind: 'smoke';
      readonly name: string;
      readonly tool: ToolDef;
      readonly potency: number;
    };

function bestField(state: GameState, ctx: GameContext): GroundMeans | null {
  const stats = combatStats(state, ctx);
  const fields = knownWith(state, ctx, 'field').flatMap((t) =>
    t.effects.flatMap((e) =>
      e.verb === 'field'
        ? [{ name: t.name, field: e.field, potency: fieldPotencyOf(stats[t.discipline], e.power) }]
        : [],
    ),
  );
  const best = fields.sort((a, b) => b.potency - a.potency)[0];
  return best ? { kind: 'field', ...best } : null;
}

export function groundMeans(state: GameState, ctx: GameContext): GroundMeans | null {
  const field = bestField(state, ctx);
  if (field) return field;
  const trap = knownWith(state, ctx, 'trap')[0];
  if (trap) return { kind: 'trap', name: trap.name };
  const smoke = toolInPouch(state, ctx, 'smoke');
  if (!smoke) return null;
  const { fuuinjutsu, intellect } = state.character.stats;
  return { kind: 'smoke', name: smoke.name, tool: smoke, potency: Math.max(fuuinjutsu, intellect) };
}
