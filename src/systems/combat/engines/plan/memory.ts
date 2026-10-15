import type { RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { cardId, keepsInLoadout, slotLimit } from './cards';
import type { HoldOff } from './footing';
import { cleanReactions, reactionAt, type Reactions } from './readiness';
import { defaultHoldOff, holdOffChoices } from './zoning';
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
 * play. Plans saved before readiness are bare loadouts whose defences sat in the slots: the
 * first defence slotted at a distance becomes its reaction, and footwork and plain blows go.
 */

/** A plan as the engine hands it back: its actions, its defences, and where it fights. */
export interface PlanMemory {
  readonly loadout: Loadout;
  readonly reactions: Reactions;
  readonly holdOff?: HoldOff;
  readonly keepAt?: RangeBand;
}

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

function isBand(value: unknown): value is RangeBand {
  return RANGE_BANDS.some((b) => b === value);
}

type Record_ = Readonly<Record<string, unknown>>;

function asRecord(value: unknown): Record_ | null {
  // Remembered plans come from a save; every field read from one is checked.
  return typeof value === 'object' && value !== null ? (value as Record_) : null;
}

function reactionsFrom(value: unknown): Reactions {
  const raw = asRecord(value) ?? {};
  const pick = (band: RangeBand) => {
    const id = raw[band];
    return typeof id === 'string' ? id : null;
  };
  return { close: pick('close'), mid: pick('mid'), far: pick('far') };
}

/**
 * A remembered hold-off, kept where it is still something this fighter can fire from there;
 * plans saved before it (or a card since forgotten) fall back to the default.
 */
function holdOffFrom(value: unknown, fighter: PlanFighter): HoldOff {
  const raw = asRecord(value);
  const fallback = defaultHoldOff(fighter);
  if (!raw) return fallback;
  const pick = (band: RangeBand): string | null => {
    const id = raw[band];
    if (id === null) return null;
    const valid = holdOffChoices(fighter, band).some((c) => cardId(c) === id);
    return typeof id === 'string' && valid ? id : fallback[band];
  };
  return { close: pick('close'), mid: pick('mid'), far: pick('far') };
}

/** The defence each distance of an old, bare loadout had slotted first. */
function slottedReactions(loadout: Loadout, fighter: PlanFighter): Reactions {
  const old = { loadout, techniques: fighter.techniques, items: fighter.items };
  const pick = (band: RangeBand) => {
    const card = reactionAt(old, band);
    return card ? cardId(card) : null;
  };
  return { close: pick('close'), mid: pick('mid'), far: pick('far') };
}

/** The remembered plan, cleaned up for this fighter, or null when there is none. */
export function rememberedPlan(plan: unknown, fighter: PlanFighter): PlanMemory | null {
  const record = asRecord(plan);
  if (!record) return null;
  const shaped = asRecord(record.loadout);
  const source = shaped ?? record;
  const [close, mid, far] = RANGE_BANDS.map((band) => slotsFor(source, band));
  if (!close || !mid || !far) return null;
  const raw = { close, mid, far };
  const reactions = shaped ? reactionsFrom(record.reactions) : slottedReactions(raw, fighter);
  return {
    loadout: {
      close: cleaned(close, fighter, 'close'),
      mid: cleaned(mid, fighter, 'mid'),
      far: cleaned(far, fighter, 'far'),
    },
    reactions: cleanReactions(fighter, reactions),
    holdOff: holdOffFrom(record.holdOff, fighter),
    ...(isBand(record.keepAt) ? { keepAt: record.keepAt } : {}),
  };
}
