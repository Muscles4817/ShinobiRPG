import { HARM_STATUS, RANGE_BANDS, RANGE_LABEL, SHROUD_STATUS, stepStatus } from '@/systems/combat';
import {
  AFFLICTIONS,
  LADDER_TOP,
  SHROUD_KINDS,
  type AfflictionKind,
  type ShroudKind,
} from '@/systems/techniques';

import { glossaryEntry, type GlossaryEntry } from './fightGlossaryTypes';

/**
 * The fight glossary's entries for the words the fight screens put on a fighter: conditions,
 * what they have got ready, and how they stand with their side. Names built from a table in the
 * engine (lingering harms, cast armour, the gates) are read from that table, so a renamed status
 * can't leave its explanation behind. No numbers: the sentences say what a rule does in words.
 */

const condition = (name: string, rule: string, counter: string) =>
  glossaryEntry('conditions', name, rule, counter);
const readied = (name: string, rule: string, counter: string) =>
  glossaryEntry('readied', name, rule, counter);
const team = (name: string, rule: string, counter: string) =>
  glossaryEntry('team', name, rule, counter);

/** What each lingering harm does, keyed as the engine keys them. */
const HARMS: Readonly<Record<AfflictionKind, readonly [string, string]>> = {
  burn: [
    'Fire still clinging to them takes a little health at the end of every exchange until it dies down.',
    'It burns out on its own after a few exchanges, sooner for someone who ate an antidote dish.',
  ],
  bleed: [
    'An open wound takes health at the end of every exchange, and fresh cuts stack on it up to a point.',
    'It closes after a few exchanges, sooner after an antidote dish; keep clear of further cuts.',
  ],
  poison: [
    'Poison takes health at the end of every exchange and saps strength and speed while it lasts.',
    'It wears off after a few exchanges, sooner after an antidote dish, and gives back what it took.',
  ],
};

/** What each cast armour does, keyed as the engine keys them. */
const SHROUDS: Readonly<Record<ShroudKind, readonly [string, string]>> = {
  lightning: [
    'Lightning over the skin turns most of every blow and technique and makes its wearer faster, for chakra every exchange.',
    'Wind cuts through it, illusions go round it, and it drinks chakra fast: make them pay for it.',
  ],
  sand: [
    'A shell of sand stops nearly anything at first but wears away under steady hurt, for chakra every exchange.',
    'Keep hitting to wear it through; water soaks into it and illusions ignore it.',
  ],
  earth: [
    'Hardened skin stands up to blows and blades and slows its wearer a little, for chakra every exchange.',
    'Lightning splits it, and illusions ignore it.',
  ],
  chakra: [
    'Raw chakra takes a little off every kind of hurt, cheaply, for chakra every exchange.',
    'Hit harder than it can soften, or reach them with an illusion, which goes through.',
  ],
};

const GATES = Array.from({ length: LADDER_TOP.gates }, (_, i) =>
  stepStatus({ ladder: 'gates', step: i + 1 }),
);
const SAGE_STEPS = Array.from({ length: LADDER_TOP.sage }, (_, i) =>
  stepStatus({ ladder: 'sage', step: i + 1 }),
);
const WICKS = Array.from({ length: LADDER_TOP.wicks }, (_, i) =>
  stepStatus({ ladder: 'wicks', step: i + 1 }),
);
const KILN_STEPS = Array.from({ length: LADDER_TOP.kiln }, (_, i) =>
  stepStatus({ ladder: 'kiln', step: i + 1 }),
);

export const STATUS_ENTRIES: readonly GlossaryEntry[] = [
  condition(
    'Dazed',
    'They lose their next turn and stand open: no dodging, and a target for finishing blows, though a Guard still works.',
    'Strike while it lasts; once it wears off they are steady for an exchange, so dazes cannot be chained. Brace makes one take hold less often.',
  ),
  condition(
    'Sealed',
    'Their chakra is shut: no technique that needs chakra, no summons, but body moves paid in breath still work.',
    'Good chakra control shakes a seal sooner; under one, fight with body moves until it lifts.',
  ),
  condition(
    'Hidden',
    'They cannot be picked as a target, and their attacks from hiding hit harder.',
    'Search finds them, more surely with every glimpse of them; sharp eyes or a hive help.',
  ),
  {
    ...condition(
      'Hidden, but you see them',
      'They are hidden from everyone else, but your eyes find them all the same, so you can aim at them.',
      'Nothing to answer: strike while the others cannot.',
    ),
    id: 'hidden-seen',
  },
  condition(
    'Confused',
    'An illusion has hold of them: their actions may misfire until willpower shakes it off.',
    'Dispel breaks illusions; good chakra control makes a confusion shorter.',
  ),
  condition(
    'Pinned',
    'Held in place: they cannot step or flee and slip blows far less, struggling against the hold at the end of each exchange.',
    'Strength, chakra control or willpower breaks it (whatever breaks a hold of its art), a teammate can pull them free, and hurting a caster who channels it lets go.',
  ),
  ...AFFLICTIONS.map((harm) => condition(HARM_STATUS[harm], ...HARMS[harm])),
  condition(
    'Blinded',
    'A field over the fight (mist, dust, darkness) dulls their perception: they read attacks worse and miss more.',
    'Sharp enough perception sees through it, eyes that read foes ignore it, and every field fades in time.',
  ),
  condition(
    'Down',
    'They have fallen and take no further part in the fight.',
    'A side whose fighters are all down has lost.',
  ),
  readied(
    'Empowered',
    'A technique has raised their body or arts for a while.',
    'Keep clear until it runs out: Evade, back off or hold them off.',
  ),
  {
    ...readied(
      'A gate open',
      'An inner gate lifts the body far beyond itself, paid in breath and then health every exchange, with a heavy price once it shuts.',
      'Outlast it: Evade, back off, keep them at a distance. The gate burns its user out.',
    ),
    id: 'gate-open',
    also: GATES,
  },
  {
    ...readied(
      'Sage mode open',
      'Natural energy drawn in from stillness lifts body and arts alike; it runs out unless perched toads renew it.',
      'Outlast it, or catch them while they go still to draw it in.',
    ),
    id: 'sage-open',
    also: SAGE_STEPS,
  },
  {
    ...readied(
      'A wick lit',
      'An inner lamp burns the body hotter, paid in breath and then health every exchange; the last one lit brings it down.',
      'Outlast it: Evade, back off, keep them at a distance. The wicks burn their user out.',
    ),
    id: 'wick-open',
    also: WICKS,
  },
  {
    ...readied(
      'Kiln calm open',
      'Heat drawn in from stillness beside a summoned newt lifts body and arts for a few exchanges, at no cost to the body.',
      'Outlast it, or catch them while they sit still to draw it in.',
    ),
    id: 'kiln-open',
    also: KILN_STEPS,
  },
  readied(
    'Meditating',
    'They have gone still to draw in natural energy: open this turn, it takes hold as their next begins.',
    'Hurt them now: a real hurt breaks the stillness and wastes the turn.',
  ),
  readied(
    'Sage toads perched',
    'Toads on their shoulders keep their sage mode from running out, paid for every exchange.',
    'Drain or seal their chakra so they cannot keep the toads; the mode runs out after them.',
  ),
  ...SHROUD_KINDS.map((kind) => readied(SHROUD_STATUS[kind], ...SHROUDS[kind])),
  {
    ...readied(
      'Clones',
      'Copies stand round their maker: an attack aimed at the maker may strike a clone instead, and solid clones strike too.',
      'An area technique bursts them all; sharp eyes pick out the real one more often.',
    ),
    pattern: /^Clones ×\d+$/,
  },
  {
    ...readied(
      'Trap',
      'A trap waits at that distance, sprung by the first foe who moves into it or acts there from the next exchange.',
      'Sharp eyes may spot it and step round it; otherwise fight from another distance.',
    ),
    also: RANGE_BANDS.map((band) => `Trap at ${RANGE_LABEL[band].toLowerCase()} range`),
  },
  readied(
    'Ready to answer',
    'A readied riposte: the next hand-to-hand or blade attack at them up close is answered before it lands.',
    'Attack from further off, or with a technique that is not a blow, until it lapses.',
  ),
  team(
    'Behind the front row',
    'A back-row fighter cannot be reached up close while someone of their side stands in front.',
    'Throws, longer-reaching techniques and areas reach the back row; or bring the front row down first.',
  ),
  team(
    'Pressing the attack',
    'A teammate going after the foes with everything they have.',
    'Change their stance from your team orders once their bond lets you.',
  ),
  team(
    'Supporting from behind',
    'A teammate setting the others up: dazes, seals and confusion first, on foes not already held.',
    'Change their stance from your team orders once their bond lets you.',
  ),
  team(
    'Holding back',
    'A teammate keeping to where their kit fights best and sparing chakra: emergencies, else plain blows.',
    'Change their stance from your team orders once their bond lets you.',
  ),
  {
    ...team(
      'Covering',
      'A teammate keeping a guard ready and stepping in front of single attacks aimed at the one they cover.',
      'An area technique reaches past a cover; against foes, bring the cover down first.',
    ),
    pattern: /^Covering .+$/,
  },
  team(
    "Your side's target",
    'The foe your side goes for together.',
    'Change the mark from your team orders.',
  ),
  team(
    "The foes' target",
    'The one on your side the foes go for together: whoever would fall soonest.',
    'Cover them, keep them at the back, or bring them out of reach.',
  ),
];
