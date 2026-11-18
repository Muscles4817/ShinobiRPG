import { statTier, STAT_GRADES } from '@/systems/stats';

import type { CombatGround } from '../../contract';
import type { WeaponClass } from '../../gearContract';
import { footingOf } from '../../rules/ground';
import { hasTrait } from '../../rules/kit';
import { readLine } from '../../rules/narration';
import { sizeGap } from '../../rules/size';
import { tell } from '../../rules/telling';
import type { PlanFighter } from './state';

/**
 * What the player's fighter notices of the foes before the first exchange: the fight as they
 * live it (`docs/design/combat-ai-plan.md` Part 13b). The obvious first (a blade in hand, armour,
 * a big body, a foe out of their footing), then what takes a sharper eye (who is quicker, who
 * hits harder). Perception sets how many reads they make; a keen eye says them plainly, a dull
 * one says how it looks. Each is a `readLine`, for the plan screen and the watch log.
 */

/** Reads a fighter makes before the fight, by perception grade. */
const OPENING_READS = [1, 2, 3, 4, 5, 6] as const;
/** Grade index (E 0 … S 5) from which a read is said as sure. */
const SURE_FROM = 3;
/** Grade index from which the subtler reads (pace, weight) are made at all. */
const SUBTLE_FROM = 2;
/** Foes read at most, nearest the front first. */
const FOES_READ = 3;
/** How much quicker or stronger a foe must be before it shows. */
const SHOWS_FROM = 1.25;

/** A read said surely and as it only looks. */
interface Read {
  readonly sure: string;
  readonly looks: string;
}

const WEAPON_WORDS: Readonly<Record<WeaponClass, string>> = {
  'light-blade': 'a short blade',
  sword: 'a sword',
  greatsword: 'a great sword',
  polearm: 'a long spear',
  fan: 'a war fan',
  chain: 'a chain',
  staff: 'a staff',
  blunt: 'a club',
  knuckles: 'knuckle blades',
  throwing: 'throwing steel',
  senbon: 'senbon',
};

/** A fighter's perception as a grade index, E 0 to S 5. */
export function eyeFor(f: Pick<PlanFighter, 'attributes'>): number {
  return STAT_GRADES.indexOf(statTier(f.attributes.perception).grade);
}

function armed(foe: PlanFighter): Read | null {
  const held = foe.gear?.held;
  if (!held) return null;
  const what = WEAPON_WORDS[held.weaponClass];
  return {
    sure: `{b} {b.has} ${what} in hand: mind its reach.`,
    looks: `{b} has ${what} in hand.`,
  };
}

function armoured(foe: PlanFighter): Read | null {
  const level = foe.gear?.armour?.level;
  const heavy = level === 'heavy' || level === 'plate' || hasTrait(foe, 'armoured');
  if (!heavy) return null;
  return {
    sure: '{b} {b.is} armoured: plain blows will glance off.',
    looks: '{b} looks well protected.',
  };
}

function big(self: PlanFighter, foe: PlanFighter): Read | null {
  if (sizeGap(foe, self) <= 0) return null;
  return {
    sure: '{b} {b.is} big: hard to hurt, harder still braced, and hard to throw.',
    looks: '{b} {b.is} bigger than {a.them}.',
  };
}

function offFooting(foe: PlanFighter, ground: CombatGround | undefined): Read | null {
  if (footingOf(ground, foe) >= 1) return null;
  return {
    sure: "{b} {b.is} unsure of {b.their} footing here: {b.they} won't slip much.",
    looks: '{b} looks unsteady on this ground.',
  };
}

function pace(self: PlanFighter, foe: PlanFighter): Read | null {
  const ratio = (foe.attributes.speed + 1) / (self.attributes.speed + 1);
  if (ratio >= SHOWS_FROM) {
    return {
      sure: '{b} {b.is} quicker than {a.them}.',
      looks: '{b} looks quick on {b.their} feet.',
    };
  }
  if (ratio <= 1 / SHOWS_FROM) {
    return {
      sure: '{b} {b.is} slower than {a.them}.',
      looks: '{b} looks heavy on {b.their} feet.',
    };
  }
  return null;
}

function weight(self: PlanFighter, foe: PlanFighter): Read | null {
  const ratio = (foe.attributes.strength + 1) / (self.attributes.strength + 1);
  if (ratio < SHOWS_FROM) return null;
  return { sure: '{b} hit{b.s} harder than {a} {a.does}.', looks: '{b} looks strong.' };
}

/** Every read there is to make of one foe, the obvious first. */
function readsOf(self: PlanFighter, foe: PlanFighter, ground: CombatGround | undefined): Read[] {
  const obvious = [armed(foe), armoured(foe), big(self, foe), offFooting(foe, ground)];
  const subtle = eyeFor(self) >= SUBTLE_FROM ? [pace(self, foe), weight(self, foe)] : [];
  return [...obvious, ...subtle].filter((r): r is Read => r !== null);
}

/** Each foe's reads in turn, one of each foe's before the next of anyone's. */
function interleaved(lists: readonly (readonly string[])[]): string[] {
  const longest = Math.max(0, ...lists.map((l) => l.length));
  return Array.from({ length: longest }, (_, i) => lists.flatMap((l) => l[i] ?? [])).flat();
}

/** What the player's fighter notices of the foes as the fight opens, as lines. */
export function openingReads(
  fighters: readonly PlanFighter[],
  ground: CombatGround | undefined,
): string[] {
  const self = fighters.find((f) => f.isPlayer);
  if (!self) return [];
  const eye = eyeFor(self);
  const sure = eye >= SURE_FROM;
  const foes = fighters
    .filter((f) => f.side !== self.side && !f.hidden && f.health > 0 && !f.shadowOf)
    .slice(0, FOES_READ);
  const lists = foes.map((foe) =>
    readsOf(self, foe, ground).map((r) =>
      readLine(tell(sure ? r.sure : r.looks, { a: self, b: foe })),
    ),
  );
  return interleaved(lists).slice(0, OPENING_READS[eye] ?? 1);
}
