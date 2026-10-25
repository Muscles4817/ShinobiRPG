/**
 * The bestiary's foes are written once for every pack, but techniques are each pack's own. A
 * foe asks for a technique by its **role** (a plain cut, an earth shot, a smoke tag), and each
 * pack's `FoeKit` names the technique of its own that plays it (validated like any foe's
 * techniques: every id must be one of the pack's), and the gear of its own a foe carries.
 */

export const FOE_ROLES = [
  // Hand to hand.
  'palm',
  'sweep',
  'grapple',
  'lock',
  'throw',
  // The blade, plain to masterly.
  'cut',
  'bleedCut',
  'sweepCut',
  'heavyCut',
  'drawStrike',
  'breakCut',
  'masterCut',
  // Elements, a shot and something heavier.
  'earthShot',
  'earthGrip',
  'fireShot',
  'fireBreath',
  'waterShot',
  'waterLash',
  'fog',
  // Tags and tricks.
  'smoke',
  'blastTag',
  'snare',
  'substitute',
  'conceal',
  'move',
  // The mind.
  'feint',
  'dread',
  'heavyLimbs',
  'heal',
  'sense',
] as const;
export type FoeRole = (typeof FOE_ROLES)[number];

/**
 * The gear the bestiary's foes carry, by role, each a piece of the pack's own gear: a knife, a
 * sword and a fine one, a spear, knuckles, thrown kunai and needles, and three weights of armour.
 */
export const FOE_GEAR_ROLES = [
  'knife',
  'sword',
  'fineSword',
  'spear',
  'knuckles',
  'kunai',
  'needles',
  'lightArmour',
  'heavyArmour',
  'plate',
] as const;
export type FoeGearRole = (typeof FOE_GEAR_ROLES)[number];
export type FoeGear = Readonly<Record<FoeGearRole, string>>;

/** A pack's technique for every role the bestiary asks for, and its gear for every gear role. */
export type FoeKit = Readonly<Record<FoeRole, string>> & { readonly gear: FoeGear };
