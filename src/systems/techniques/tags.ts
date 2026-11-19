/**
 * How a technique works, as tags (`docs/design/technique-tags.md`): how it reaches its target,
 * what ground it covers, what the target must be for it to work, what it does when it lands, what
 * answers it, and how it is done. Effects say what a technique does; tags say how. They are read
 * from what a technique already has (`tagsOf` in the combat rules) and written by hand where the
 * reading would be wrong (`TechniqueDef.tags`), and the engine and the story read them.
 */

/** How a technique reaches its target. */
export const DELIVERIES = [
  /** A blow or a technique held in the hand, driven into the target. */
  'strike',
  /** A straight, committed run at the target (Chidori). */
  'charge',
  /** Caught and lifted or thrown (Liger Bomb). */
  'grapple',
  /** A blade or other weapon in hand. */
  'weapon',
  /** Steel or something moulded, thrown or shot across the gap. */
  'thrown',
  /** Set where the target will be: tags, mines, traps. */
  'placed',
  /** Breathed or spat out towards the target (Great Fireball). */
  'breath',
  /** A cloud that hangs and spreads: poison, smoke. */
  'gas',
  /** Through meeting the user's eyes (Sharingan illusions). */
  'eye-contact',
  /** Through what the target hears. */
  'sound',
  /** An illusion laid over the target's senses with no meeting of eyes. */
  'senses',
  /** A hand laid on the target: a seal, a medic's palm. */
  'touch',
  /** Along the ground to the target (a shadow). */
  'along-ground',
  /** Up out of the ground under or around the target (trees, sand). */
  'from-ground',
  /** Down from overhead, or a pull up into it. */
  'from-above',
  /** Out from the user in every direction (Almighty Push, Palm Rotation). */
  'burst',
  /** Fills the ground everyone stands on (a mist). */
  'field',
  /** Chakra threads or wire. */
  'threads',
  /** Bodies joining the fight: summons, clones, puppets. */
  'body',
  /** On the user alone: a power-up, armour, healing. */
  'self',
] as const;
export type Delivery = (typeof DELIVERIES)[number];

/** What ground a technique covers. An area's size (small, wide, vast) stays on its effect. */
export const SHAPES = ['one', 'spread', 'line', 'cone', 'burst', 'zone', 'none'] as const;
export type Shape = (typeof SHAPES)[number];

/** What a target must be, as things stand at that moment, for the technique to work at all. */
export const TARGET_NEEDS = [
  /** Light enough for the user to lift, by the user's strength against the target's size. */
  'liftable',
  /** A mind to fool: not a puppet or a body of the dead. */
  'mind',
  /** Meeting the user's eyes, close up. */
  'meets-eyes',
  /** On the ground, not in the air. */
  'on-ground',
  /** Casting a shadow the user's can reach. */
  'casts-shadow',
  /** Chakra points to strike: a person, not a beast without chakra. */
  'chakra-points',
  /** In a straight line from the user. */
  'straight-line',
] as const;
export type TargetNeed = (typeof TARGET_NEEDS)[number];

/** What a technique does to a body or a mind when it lands. */
export const LANDINGS = [
  'harmed',
  'thrown-back',
  'slammed',
  'bound',
  'mirrored',
  'crushed',
  'frozen',
  'stunned',
  'dreaming',
  'confused',
  'sealed',
  'drained',
  'burning',
  'lingering',
  'blast',
  'mended',
  'strengthened',
  'hidden',
] as const;
export type Landing = (typeof LANDINGS)[number];

/** How much of a body a technique catches: a point (a pinprick on a giant) or the whole of it. */
export const CATCHES = ['point', 'whole', 'none'] as const;
export type Catches = (typeof CATCHES)[number];

/** What stops or escapes a technique. */
export const ANSWERS = [
  'slip',
  'guard',
  'armour',
  'wall',
  'swap',
  'deflect',
  'look-away',
  'cover-ears',
  'hold-breath',
  'wind',
  'cut-free',
  'burn',
  'break-free',
  'distance',
  'jump',
  'dig-in',
  'see-through',
  'ally-frees',
] as const;
export type Answer = (typeof ANSWERS)[number];

/** How loudly a technique gives itself away as it comes. */
export const TELLS = ['loud', 'plain', 'quiet'] as const;
export type Tell = (typeof TELLS)[number];

/** How a technique is done. */
export interface Execution {
  /** Hand signs: can be broken up close. */
  readonly handSigns: boolean;
  readonly tell: Tell;
  /** Kept up for chakra every exchange it holds. */
  readonly held?: true;
  /** Its user does nothing else while it holds. */
  readonly channelled?: true;
  /** Exchanges before it can be used again. */
  readonly recovery?: number;
  /** Two steps: something to fight, then what it does (a pull, then the crush). */
  readonly stages?: true;
  /** Only after this technique (an id) has landed on the target. */
  readonly follows?: string;
  /** A miss leaves its user open. */
  readonly opensUser?: true;
  /** Arrives late at range. */
  readonly travels?: true;
}

/** Every tag of a technique, read and written together. */
export interface TechniqueTags {
  readonly delivery: readonly Delivery[];
  readonly shape: Shape;
  readonly needs: readonly TargetNeed[];
  readonly lands: readonly Landing[];
  readonly catches: Catches;
  readonly answeredBy: readonly Answer[];
  readonly execution: Execution;
}

/** Tags written by hand on a technique: each axis given replaces what would be read. */
export type WrittenTags = Partial<Omit<TechniqueTags, 'execution'>> & {
  readonly execution?: Partial<Execution>;
};
