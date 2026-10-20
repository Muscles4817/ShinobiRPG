import type { Element } from '@/systems/techniques';

import type { SceneLines } from './fresh';

/**
 * The fight's beats told for where they happen (`scene.ts`): the trees, the walls, the water,
 * the streets; the first exchange and the long end of a fight; someone near the end of their
 * strength; a spar with a teammate or a rival; a beast, a swarm, a spirit. `voice.ts` and
 * `sceneVoice.ts` hand these to their banks, which prefer them when they fit (`fresh.ts`).
 */

/** Someone using a technique, wherever it is. */
const CASTING: SceneLines = {
  desperate: [
    '{a} scrape{a.s} together what chakra {a.they} can for {what}.',
    'Hurt and running short of time, {a} reach{a.es} for {what}.',
  ],
  opening: ['{a} open{a.s} with {what}.', '{a} start{a.s} with {what} before anyone has settled.'],
  late: ['Tired now, {a} still go{a.es} to {what}.'],
  spirit: [
    '{what} rises off {a} like the cold off a well.',
    'The air around {a} turns cold, and {what} comes with it.',
  ],
  rival: ['{a} {a.has} been keeping {what} for this, and use{a.s} it now.'],
};

/** Techniques of an element meeting ground that feeds them. */
const FED: Readonly<Partial<Record<Element, SceneLines>>> = {
  water: { lake: ['The lake itself rises at {a.poss} call and becomes {what}.'] },
  fire: {
    forest: ['{a} loose{a.s} {what}, and the dry leaves around it catch.'],
    desert: ['{a} loose{a.s} {what}, and the hot air over the sand roars with it.'],
  },
  earth: {
    forest: ['{a} drive{a.s} chakra down into the roots, and {what} tears up out of them.'],
  },
  wind: {
    town: ['{a} send{a.s} {what} down the street, rattling every shutter on it.'],
    desert: ['{a} send{a.s} {what} over the dunes, and it comes back full of sand.'],
  },
};

const FED_CASTING: Readonly<Partial<Record<Element, SceneLines>>> = Object.fromEntries(
  Object.entries(FED).map(([element, lines]) => [element, { ...CASTING, ...lines }]),
);

/** The scene lines for a technique of this element (or of none). */
export function castScenes(element: Element | undefined): SceneLines {
  return (element && FED_CASTING[element]) ?? CASTING;
}

/** An attack slipped, by a ready Dodge or by luck. */
export const MISSING: SceneLines = {
  desperate: ['{t} scramble{t.s} clear of {a.poss} {what} with nothing to spare.'],
  teammate: [
    '{t} know{t.s} {a.poss} {what} from a hundred drills and {t.is} gone before it lands.',
  ],
  rival: ['{t} slip{t.s} {a.poss} {what} and make{t.s} a point of how easily.'],
  spirit: ['{a.poss} {what} passes through {t} as if through mist.'],
  beast: ['{t} twist{t.s} away from {a.poss} {what}.'],
  swarm: ['{t} part{t.s} around {a.poss} {what} and close{t.s} again behind it.'],
  forest: ['{t} put{t.s} a trunk between {t.themself} and {a.poss} {what}.'],
  town: ['{t} vault{t.s} a handcart, and {a.poss} {what} finds only the cart.'],
  room: ['{t} roll{t.s} under {a.poss} {what}, and it splinters the wall instead.'],
  lake: ['{t} slide{t.s} away across the water, and {a.poss} {what} raises only spray.'],
  desert: ['{t} drop{t.s} behind the crest of a dune, and {a.poss} {what} only blows up sand.'],
};

/** Closing in. */
export const CLOSING_IN: SceneLines = {
  desperate: ['{a} throw{a.s} {a.themself} in close, with nothing left to wait for.'],
  opening: ['{a} close{a.s} in at once.'],
  beast: ['{a} lunge{a.s} in close.'],
  swarm: ['{a} boil{a.s} in close around {f}.'],
  spirit: ['{a} drift{a.s} in close, too smoothly for anything with feet.'],
  forest: ['{a} come{a.s} in through the trees.'],
  room: ['{a} cross{a.es} the floor in two strides.'],
  town: ['{a} cut{a.s} across the street and into {f.poss} reach.'],
  lake: ['{a} skim{a.s} across the water and in close.'],
  desert: ['{a} come{a.s} down the face of the dune in a slide of sand.'],
};

/** Getting back out of reach. */
export const FALLING_BACK: SceneLines = {
  beast: ['{a} back{a.s} off, wary.'],
  spirit: ['{a} drift{a.s} back out of reach.'],
  forest: ['{a} fall{a.s} back among the trees.'],
  town: ['{a} take{a.s} to the rooftops, out of reach.'],
  lake: ['{a} slide{a.s} back across the water, out of reach.'],
  desert: ['{a} fall{a.s} back over the crest of a dune, out of reach.'],
};

/** A search that finds no one. */
export const SEARCHING: SceneLines = {
  forest: ['{a} search{a.es} the undergrowth and find{a.s} no one.'],
  town: ['{a} check{a.s} the doorways and find{a.s} no one in them.'],
  room: ['{a} search{a.es} the corners of the room and find{a.s} them empty.'],
  lake: ['{a} scan{a.s} the reeds along the shore and find{a.s} no one.'],
  desert: ['{a} scan{a.s} the dunes through the haze and find{a.s} no one.'],
};

/** A search that finds someone. */
export const FINDING: SceneLines = {
  forest: ['{a} catch{a.es} {found} moving between the trunks.'],
  town: ['{a} spot{a.s} {found} on a rooftop.'],
  room: ['{a} find{a.s} {found} in a corner of the room.'],
};

/** A daze taking hold. */
export const DAZING: SceneLines = {
  desperate: ['{t} sway{t.s} on {t.their} feet, close to done.'],
  beast: ['{t} shake{t.s} {t.their} head, dazed.'],
  swarm: ['{t} scatter{t.s} and {t.is} slow to come back together.'],
  spirit: ['{t} thin{t.s} and waver{t.s}, dazed.'],
  room: ['{t} reel{t.s} into the wall, dazed.'],
  forest: ['{t} stagger{t.s} against a tree, dazed.'],
  lake: ['{t} stagger{t.s}, and {t.their} footing on the water nearly goes.'],
  desert: ['{t} stagger{t.s} in the soft sand, dazed.'],
};

/** Someone thrown back across the ground. */
export const THROWN_BACK: SceneLines = {
  room: ['{t} {t.is} thrown back across the room.'],
  forest: ['{t} {t.is} thrown back through the brush to {where} range.'],
  lake: ['{t} {t.is} sent skidding across the water to {where} range.'],
  desert: ['{t} {t.is} sent tumbling down the dune to {where} range.'],
};

/** Someone getting through a hold-off. */
export const RUNNING_IN: SceneLines = {
  forest: ['{c} come{c.s} through the trees under {h.poss} fire.'],
  town: ['{c} dart{c.s} from doorway to doorway through {h.poss} fire.'],
  lake: ['{c} race{c.s} across the open water through {h.poss} fire.'],
  desert: ['{c} run{c.s} the hollows between the dunes through {h.poss} fire.'],
};

/** An illusionist slipping back out of sight. */
export const VANISHING: SceneLines = {
  forest: ['{a} fade{a.s} back among the trees.'],
  town: ['{a} slip{a.s} into a doorway and {a.is} gone.'],
};
