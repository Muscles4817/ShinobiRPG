import type { GearDef } from '@/content';
import {
  armourKept,
  armourSlows,
  focusScale,
  weaponNumbers,
  type ArmourLevel,
  type FocusTarget,
  type WeaponShape,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';
import { STAT_INFO } from '@/systems/stats';
import type { Verb } from '@/systems/techniques';

/**
 * Gear in words: what kind of piece it is, and what it does in a fight as chips. The numbers
 * come from the same combat rules the fight applies, so what a shop says is what a fight does.
 */

const SHAPE_LABEL: Readonly<Record<WeaponShape, string>> = {
  blade: 'Blade',
  knuckles: 'Knuckles',
  throwing: 'Throwing steel',
  senbon: 'Senbon',
};

const ARMOUR_LABEL: Readonly<Record<ArmourLevel, string>> = {
  light: 'Light armour',
  flak: 'Flak jacket',
  heavy: 'Heavy armour',
  plate: 'Full plate',
};

/** What a focus on a verb sharpens, in words. */
const VERB_FOCUS: Readonly<Record<Verb, string>> = {
  damage: 'Attacks',
  daze: 'Dazes',
  seal: 'Seals',
  heal: 'Healing',
  area: 'Area attacks',
  confuse: 'Confusion',
  conceal: 'Hiding',
  sense: 'Sensing',
  break: 'Breaks',
  field: 'Mist and smoke',
  move: 'Footwork',
  substitute: 'Substitutions',
  empower: 'Empowering',
  clone: 'Clones',
  trap: 'Traps',
};

/** "Blade", "Flak jacket", "Focus": what kind of piece this is. */
export function gearKindLabel(def: GearDef): string {
  switch (def.kind) {
    case 'weapon':
      return SHAPE_LABEL[def.shape];
    case 'armour':
      return ARMOUR_LABEL[def.level];
    case 'focus':
      return 'Focus';
  }
}

function percent(share: number): number {
  return Math.round(share * 100);
}

const gain = (label: string): JournalChip => ({ label, tone: 'gain' });
const cost = (label: string): JournalChip => ({ label, tone: 'cost' });
const info = (label: string): JournalChip => ({ label, tone: 'info' });

/** "+10%" or "−20%" from a multiplier around 1. */
function change(scale: number): string {
  const delta = percent(scale - 1);
  return delta >= 0 ? `+${delta}%` : `−${-delta}%`;
}

function weaponChips(def: Extract<GearDef, { kind: 'weapon' }>): JournalChip[] {
  const n = weaponNumbers(def);
  const effects = def.effects ?? [];
  const what = def.shape === 'blade' ? 'Cuts' : def.shape === 'knuckles' ? 'Blows' : 'Kunai';
  return [
    ...(def.shape === 'blade' ? [info('Strike becomes a cut'), info('Needed for kenjutsu')] : []),
    ...(def.shape === 'senbon' ? [info('Kunai become senbon')] : []),
    ...(n.scale === 1 ? [] : [(n.scale > 1 ? gain : cost)(`${what} ${change(n.scale)}`)]),
    ...(n.pierce >= 1 ? [gain('Through any guard')] : []),
    ...(n.pierce > 0 && n.pierce < 1 ? [gain(`${percent(n.pierce)}% through a guard`)] : []),
    ...(n.daze > 0 ? [gain(`May daze ${percent(n.daze)}%`)] : []),
    ...(effects.includes('drain') ? [gain('Drinks chakra')] : []),
  ];
}

function armourChips(def: Extract<GearDef, { kind: 'armour' }>, strength: number): JournalChip[] {
  const slows = armourSlows(def, strength);
  return [
    gain(`Blows and blades ${change(armourKept(def))}`),
    slows > 0 ? cost(`Speed −${Math.max(1, percent(slows))}% for you`) : info('No weight to it'),
  ];
}

function focusLabel(boosts: FocusTarget): string {
  return 'verb' in boosts ? VERB_FOCUS[boosts.verb] : STAT_INFO[boosts.discipline].label;
}

/** What a piece does in a fight, as chips; armour's weight is read against your strength. */
export function gearChips(def: GearDef, strength: number): JournalChip[] {
  switch (def.kind) {
    case 'weapon':
      return weaponChips(def);
    case 'armour':
      return armourChips(def, strength);
    case 'focus':
      return [gain(`${focusLabel(def.boosts)} ${change(focusScale(def))}`)];
  }
}
