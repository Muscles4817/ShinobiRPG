import { reachOf } from '@/systems/combat';
import type { TechniqueDef, Verb } from '@/systems/techniques';

/**
 * What kind of technique something is, read from what it does rather than tagged by hand: a
 * blade art needs an edge, a power-up empowers or needs a gate open, a projectile wounds from
 * far off. A technique may be several kinds (a fire clone is a clone and a nin-taijutsu
 * attacker is not); a new technique finds its kinds with no code.
 */

export const TECHNIQUE_KINDS = [
  'blade',
  'body',
  'nin-tai',
  'projectile',
  'area',
  'defence',
  'clone',
  'power-up',
  'hold',
  'illusion',
  'healing',
  'stealth',
  'lingering',
  'movement',
  'combination',
  'summoning',
] as const;
export type TechniqueKind = (typeof TECHNIQUE_KINDS)[number];

export const TECHNIQUE_KIND_LABEL: Readonly<Record<TechniqueKind, string>> = {
  blade: 'Blade arts',
  body: 'Body arts',
  'nin-tai': 'Nin-taijutsu',
  projectile: 'Projectiles',
  area: 'Area attacks',
  defence: 'Shields and swaps',
  clone: 'Clones',
  'power-up': 'Power-ups and gates',
  hold: 'Holds, stuns and seals',
  illusion: 'Illusions',
  healing: 'Healing',
  stealth: 'Stealth and sensing',
  lingering: 'Drains and lingering harm',
  movement: 'Movement',
  combination: 'Combinations',
  summoning: 'Summoning',
};

const WOUNDING: ReadonlySet<Verb> = new Set(['damage', 'break', 'area', 'afflict']);

/** The verbs that make a technique a kind, where a verb is all it takes. */
const BY_VERB: readonly (readonly [TechniqueKind, readonly Verb[]])[] = [
  ['area', ['area']],
  ['defence', ['substitute', 'counter']],
  ['clone', ['clone']],
  ['power-up', ['empower']],
  ['hold', ['pin', 'seal', 'trap']],
  ['illusion', ['confuse']],
  ['healing', ['heal']],
  ['stealth', ['conceal', 'sense', 'field', 'shroud']],
  ['lingering', ['afflict', 'drain']],
  ['movement', ['move', 'knock']],
  ['summoning', ['summon']],
];

const PHYSICAL = new Set(['taijutsu', 'kenjutsu']);

/** A strike up close that runs on chakra: a charged fist or edge, or a jutsu held in the hand. */
function isNinTai(def: TechniqueDef, wounds: boolean, reach: readonly string[]): boolean {
  if (PHYSICAL.has(def.discipline)) return def.moulded === true || def.element !== undefined;
  return (
    def.discipline === 'ninjutsu' && wounds && reach.includes('close') && !reach.includes('far')
  );
}

/** Wounds from a distance: thrown, shot or breathed, never an illusion or a blast of ground. */
function isProjectile(def: TechniqueDef, wounds: boolean, reach: readonly string[]): boolean {
  if (!wounds || def.discipline === 'genjutsu') return false;
  if (def.effects.some((e) => e.verb === 'area')) return false;
  return reach.includes('far') || !reach.includes('close');
}

/** The kinds a technique is, in `TECHNIQUE_KINDS` order. */
export function techniqueKinds(def: TechniqueDef): readonly TechniqueKind[] {
  const verbs = new Set(def.effects.map((e) => e.verb));
  const wounds = def.effects.some((e) => WOUNDING.has(e.verb));
  const kinds = new Set<TechniqueKind>(
    BY_VERB.filter(([, vs]) => vs.some((v) => verbs.has(v))).map(([kind]) => kind),
  );
  const reach = reachOf(def);
  const projectile = isProjectile(def, wounds, reach);
  if (projectile) kinds.add('projectile');
  if (def.discipline === 'kenjutsu' || def.needs?.weapon === 'blade') kinds.add('blade');
  if (isNinTai(def, wounds, reach)) kinds.add('nin-tai');
  else if (def.discipline === 'taijutsu' && !projectile) kinds.add('body');
  if (def.needsOpen !== undefined) kinds.add('power-up');
  // A daze that rides on a blow is the blow's; one that is all a technique does is a stun.
  if (verbs.has('daze') && !wounds) kinds.add('hold');
  if (def.discipline === 'genjutsu') kinds.add('illusion');
  if (def.combo) kinds.add('combination');
  return TECHNIQUE_KINDS.filter((k) => kinds.has(k));
}
