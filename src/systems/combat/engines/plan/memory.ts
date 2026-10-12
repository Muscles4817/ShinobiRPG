import type { RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { keepsInLoadout, slotLimit } from './cards';
import {
  SLOT_CONDITIONS,
  TARGET_RULES,
  type Loadout,
  type PlanFighter,
  type Slot,
  type SlotCondition,
  type TargetRule,
} from './state';

/**
 * Your cards carry over from fight to fight. The game keeps the loadout the engine handed
 * back and offers it again; since it comes from a save, it is checked here: cards you no longer
 * know or that don't fit a distance are dropped (tools stay, for when you restock), unknown
 * conditions and target rules are forgotten, and each distance is trimmed to your slots.
 * Plans saved before slots had conditions are plain card ids, and read as slots that always
 * play.
 */

function isCondition(value: unknown): value is SlotCondition {
  return SLOT_CONDITIONS.some((c) => c === value);
}

function isTargetRule(value: unknown): value is TargetRule {
  return TARGET_RULES.some((r) => r === value);
}

/** One remembered slot, in either shape, or null when it can't be read. */
function slotFrom(entry: unknown): Slot | null {
  if (typeof entry === 'string') return { card: entry };
  if (typeof entry !== 'object' || entry === null) return null;
  // A remembered slot from a save; every field is checked before it's kept.
  const raw = entry as Readonly<Record<string, unknown>>;
  if (typeof raw.card !== 'string') return null;
  return {
    card: raw.card,
    ...(isCondition(raw.when) ? { when: raw.when } : {}),
    ...(isTargetRule(raw.target) ? { target: raw.target } : {}),
  };
}

function slotsFor(plan: Readonly<Record<string, unknown>>, band: RangeBand): Slot[] | null {
  const entries = plan[band];
  if (!Array.isArray(entries)) return null;
  return entries.flatMap((entry: unknown) => {
    const slot = slotFrom(entry);
    return slot ? [slot] : [];
  });
}

function cleaned(slots: readonly Slot[], fighter: PlanFighter, band: RangeBand): Slot[] {
  const kept = slots.filter((s) => keepsInLoadout(fighter, band, s.card));
  const unique = kept.filter((slot, i) => kept.findIndex((s) => s.card === slot.card) === i);
  return unique.slice(0, slotLimit(fighter));
}

/** The remembered loadout, cleaned up for this fighter, or null when there is none. */
export function rememberedLoadout(plan: unknown, fighter: PlanFighter): Loadout | null {
  if (typeof plan !== 'object' || plan === null) return null;
  // The plan comes from a save; each distance is checked by `slotsFor`.
  const record = plan as Readonly<Record<string, unknown>>;
  const [close, mid, far] = RANGE_BANDS.map((band) => slotsFor(record, band));
  if (!close || !mid || !far) return null;
  return {
    close: cleaned(close, fighter, 'close'),
    mid: cleaned(mid, fighter, 'mid'),
    far: cleaned(far, fighter, 'far'),
  };
}
