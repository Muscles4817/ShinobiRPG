/**
 * Why a fighter chose what they chose: the decision log (`docs/design/combat-ai-plan.md` Part
 * 13, step 1). Every way a card is picked says which rule picked it, so a fight can be read
 * back move by move and a new planner has today's reasons to beat. The reasons are tags on the
 * picks themselves, never worked out again afterwards, so they can't drift from what was done.
 * A shape only, importing nothing, so the fight state can hold it. A fight keeps them only when its setup asks (`CombatSetup.trace`); the story never reads them.
 */

/** Ways a plan picks (`priority.ts`): the player's, a teammate's, a foe keeping to its plan. */
export const PLAN_WHYS = [
  /** An emergency slot (healing when badly hurt, finding a hidden foe). */
  'emergency',
  /** A ladder step from the kit (the Gates, Sage Mode: `climbing.ts`). */
  'climb',
  /** A set-up from the kit: hide, hold, finish (`setups.ts`). */
  'setup',
  /** Playing for time against a killer (`survival.ts`). */
  'survival',
  /** A summoner's call from the kit (`calling.ts`). */
  'call',
  /** Readying the charge before making for their distance (an empower, clones, an entry). */
  'charge',
  /** A step towards the distance they fight from. */
  'step-to',
  /** The first slot at this distance that would do something. */
  'slot',
  /** A later slot, because the first walks into a defence they've seen (`adapt.ts`). */
  'counter-pick',
  /** A later slot, because the foe has read the first by now (`familiarity.ts`). */
  'change-up',
  /** Nothing slotted played and someone is hidden: a look round. */
  'looking',
  /** Nothing slotted played: a plain blow or a step. */
  'improvised',
] as const;

/** Ways instinct picks (`choose.ts`), in the order instinct asks them. */
export const INSTINCT_WHYS = [
  'sight',
  'senses',
  'killer',
  'kit-call',
  'kit-setup',
  'prep',
  'tool',
  'heal',
  'shelter',
  'gather',
  'entry',
  'footwork',
  'trump',
  'daze-first',
  'finisher',
  /** Among the attacks and footwork on offer, by weight (`weighing.ts`). */
  'weighted',
  /** Nothing to play: a look round or an improvised blow. */
  'nothing',
] as const;

/** What overrides a choice at the turn itself. */
export const TURN_WHYS = [
  /** A foe played the card it announced. */
  'announced',
  /** A technique thrown early to meet an elemental attack in the air (`clash.ts`). */
  'clash',
  /** A teammate's hold came first: pulling them free, or going for its caster (`struggle.ts`). */
  'aid',
] as const;

export type PlanWhy = (typeof PLAN_WHYS)[number];
export type InstinctWhy = (typeof INSTINCT_WHYS)[number];
export type Why = PlanWhy | InstinctWhy | (typeof TURN_WHYS)[number];

/** How likely each card on offer was, when the pick was weighted. */
export interface Odds {
  readonly card: string;
  readonly share: number;
}

/** One line of the decision log. */
export interface Decision {
  /** The exchange (`PlanState.round`). */
  readonly round: number;
  /** A foe's telegraph between exchanges, or anyone's turn within one. */
  readonly phase: 'announce' | 'turn';
  readonly fighterId: string;
  /** Whether it came from their plan or their instinct (`planAdherence` decides for a foe). */
  readonly source: 'plan' | 'instinct' | 'turn';
  readonly why: Why;
  readonly card: string;
  readonly targetId?: string;
  readonly odds?: readonly Odds[];
}

const PLAN_SET: ReadonlySet<Why> = new Set(PLAN_WHYS);
const INSTINCT_SET: ReadonlySet<Why> = new Set(INSTINCT_WHYS);

/** Which way of choosing a reason belongs to. */
export function sourceOf(why: Why): Decision['source'] {
  if (PLAN_SET.has(why)) return 'plan';
  return INSTINCT_SET.has(why) ? 'instinct' : 'turn';
}
