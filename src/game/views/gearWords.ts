import type { GearDef } from '@/content';
import {
  armourKept,
  armourSlows,
  focusScale,
  weaponNumbers,
  type ArmourLevel,
  type FocusTarget,
  shapeOf,
  speedOf,
  WEAPON_CLASSES,
  strikeReach,
  weaponGuard,
  type WeaponClass,
  type WeaponMastery,
  type WeaponShape,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';
import { STAT_INFO } from '@/systems/stats';
import type { Verb } from '@/systems/techniques';

import { masteryWord } from '../weaponMastery';

/**
 * Gear in words: what kind of piece it is, and what it does in a fight as chips. The numbers
 * come from the same combat rules the fight applies, so what a shop says is what a fight does.
 */

const CLASS_LABEL: Readonly<Record<WeaponClass, string>> = {
  'light-blade': 'Light blade',
  sword: 'Sword',
  greatsword: 'Greatsword',
  polearm: 'Polearm',
  fan: 'War fan',
  chain: 'Chain weapon',
  staff: 'Staff',
  blunt: 'Blunt weapon',
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
  knock: 'Throws',
  pin: 'Holds',
  drain: 'Chakra drains',
  afflict: 'Lingering harm',
  counter: 'Ripostes',
  summon: 'Summons',
};

/** How well you know each class you have practised, strongest first: "Throwing steel seasoned". */
export function weaponsKnown(mastery: WeaponMastery | undefined): string | null {
  if (!mastery) return null;
  const known = WEAPON_CLASSES.flatMap((c) => {
    const m = mastery[c] ?? 0;
    return m > 0 ? [{ c, m }] : [];
  }).sort((a, b) => b.m - a.m);
  if (known.length === 0) return null;
  return known.map(({ c, m }) => `${CLASS_LABEL[c]} ${masteryWord(m)}`).join(', ');
}

/** "Blade", "Flak jacket", "Focus": what kind of piece this is. */
export function gearKindLabel(def: GearDef): string {
  switch (def.kind) {
    case 'weapon':
      return CLASS_LABEL[def.weaponClass];
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

const SPEED_WORDS: Readonly<Record<number, string>> = {
  [-1]: 'Slow in the hand',
  1: 'Quick in the hand',
  2: 'Very quick in the hand',
};

/** What the piece is to the cards: a cut, a weapon's blows, senbon for kunai. */
const SHAPE_CHIPS: Readonly<Record<WeaponShape, readonly string[]>> = {
  blade: ['Strike becomes a cut', 'Strikes first up close', 'Needed for kenjutsu'],
  blunt: ['Blows of the weapon art'],
  knuckles: [],
  throwing: [],
  senbon: ['Kunai become senbon'],
};

const HIT_WORD: Readonly<Record<WeaponShape, string>> = {
  blade: 'Cuts',
  blunt: 'Blows',
  knuckles: 'Blows',
  throwing: 'Kunai',
  senbon: 'Kunai',
};

/** How it handles: quick or slow in the hand, the guard it gives. */
function handlingChips(def: Extract<GearDef, { kind: 'weapon' }>): JournalChip[] {
  const speed = speedOf(def);
  const guard = weaponGuard(def);
  return [
    ...(speed > 0 ? [gain(SPEED_WORDS[speed] ?? 'Quick in the hand')] : []),
    ...(speed < 0 ? [cost(SPEED_WORDS[speed] ?? 'Slow in the hand')] : []),
    ...(guard > 0 ? [gain(`Guards ${change(1 + guard)}`)] : []),
    ...(strikeReach({ gear: { held: def } }).includes('mid') ? [gain('Strikes at mid range')] : []),
  ];
}

function hitChips(def: Extract<GearDef, { kind: 'weapon' }>): JournalChip[] {
  const n = weaponNumbers(def);
  const what = HIT_WORD[shapeOf(def)];
  return [
    ...(n.scale === 1 ? [] : [(n.scale > 1 ? gain : cost)(`${what} ${change(n.scale)}`)]),
    ...(n.pierce >= 1 ? [gain('Through any guard')] : []),
    ...(n.pierce > 0 && n.pierce < 1 ? [gain(`${percent(n.pierce)}% through a guard`)] : []),
    ...(n.daze > 0 ? [gain(`May daze ${percent(n.daze)}%`)] : []),
  ];
}

function weaponChips(def: Extract<GearDef, { kind: 'weapon' }>): JournalChip[] {
  return [
    ...SHAPE_CHIPS[shapeOf(def)].map(info),
    ...(def.blades ? [gain(`${def.blades} blades: a flurry a guard meets once`)] : []),
    ...hitChips(def),
    ...handlingChips(def),
    ...(def.boosts ? [gain(`${focusLabel(def.boosts)} ${change(focusScale(def))}`)] : []),
    ...((def.effects ?? []).includes('drain') ? [gain('Drinks chakra')] : []),
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

/** How well you know a weapon's class, for a save that keeps mastery. */
function handChips(
  def: Extract<GearDef, { kind: 'weapon' }>,
  mastery?: WeaponMastery,
): JournalChip[] {
  if (!mastery) return [];
  return [info(`In your hand: ${masteryWord(mastery[def.weaponClass] ?? 0)}`)];
}

/**
 * What a piece does in a fight, as chips; armour's weight is read against your strength, and a
 * weapon says how well you know its kind.
 */
export function gearChips(def: GearDef, strength: number, mastery?: WeaponMastery): JournalChip[] {
  switch (def.kind) {
    case 'weapon':
      return [...weaponChips(def), ...handChips(def, mastery)];
    case 'armour':
      return armourChips(def, strength);
    case 'focus':
      return [gain(`${focusLabel(def.boosts)} ${change(focusScale(def))}`)];
  }
}
