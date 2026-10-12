import { RANGE_BANDS, RANGE_LABEL, type RangeBand } from '@/systems/combat';
import {
  MAX_RECON,
  RECON_REVEALS,
  stagePay,
  type Alertness,
  type ApproachId,
  type EncounterEnd,
  type EncounterFact,
  type JobKind,
} from '@/systems/missions';
import { STAT_INFO } from '@/systems/stats';

import type { GameAction } from '../actions/types';
import { enemyCombatantId } from '../combatants';
import type { GameContext } from '../context';
import { approachPlans, type ApproachPlan } from '../encounter/approaches';
import { encounterHere, type EncounterHere } from '../encounter/current';
import { reconPlans, type ReconCost, type ReconPlan } from '../encounter/recon';
import { scoutOpponents, traitNotes, type Threat, type TraitNote } from '../scouting';
import type { GameState } from '../state';
import { noteLine, type SceneLine } from './scene';

/**
 * The encounter scene: what you know of the foes, the ways to learn more, and the ways in.
 * Unknowns say which recon would reveal them; closed approaches say why.
 */

export interface FactLine {
  readonly fact: EncounterFact;
  readonly label: string;
  /** What you know, or null while it is unknown. */
  readonly value: string | null;
  /** While unknown: how to find out. */
  readonly hint: string;
}

export interface EncounterFoe {
  readonly name: string;
  readonly count: number;
  readonly threat: Threat;
  readonly threatLabel: string;
  /** Their tricks and counters, once you know their kit. */
  readonly traits: readonly TraitNote[] | null;
}

export interface ReconCard {
  readonly id: string;
  readonly label: string;
  /** The odds and who rolls, e.g. "Perception 62%, Kaen". */
  readonly odds: string;
  readonly cost: string;
  readonly blocker: string | null;
  readonly action: GameAction;
}

export interface ApproachCard {
  readonly id: ApproachId;
  readonly label: string;
  readonly detail: string;
  /** What it does to the pay on this job, when it changes it. */
  readonly pay: string | null;
  readonly needsRange: boolean;
  readonly blocker: string | null;
  /** The action to dispatch; the UI adds the chosen range when `needsRange`. */
  readonly action: Extract<GameAction, { type: 'encounterApproach' }>;
}

export interface EncounterScene {
  readonly title: string;
  readonly rank: string;
  readonly client: string;
  readonly kind: string;
  readonly lines: readonly SceneLine[];
  readonly facts: readonly FactLine[];
  readonly foes: readonly EncounterFoe[] | null;
  readonly reconLeft: number;
  readonly recon: readonly ReconCard[];
  readonly approaches: readonly ApproachCard[];
  readonly ranges: readonly { readonly id: RangeBand; readonly label: string }[];
}

const FACT_LABEL: Readonly<Record<EncounterFact, string>> = {
  count: 'How many',
  identity: 'Who',
  kit: 'How they fight',
  terrain: 'The ground',
  awareness: 'Are they watching',
};

const ALERTNESS_LABEL: Readonly<Record<Alertness, string>> = {
  unaware: 'They don’t know you’re here.',
  wary: 'Uneasy. They keep looking round.',
  alert: 'They know you’re coming.',
};

const END_OF: Partial<Record<ApproachId, EncounterEnd>> = {
  sneak: 'slipped-past',
  talk: 'talked-down',
  intimidate: 'talked-down',
  bribe: 'paid-off',
};

const FIXED_DETAIL: Readonly<Record<ApproachId, string>> = {
  'head-on': 'A straight fight',
  ambush: 'They reel, you strike first',
  sneak: '',
  talk: '',
  bribe: '',
  intimidate: '',
  'set-ground': '',
  withdraw: 'The job fails, but you’re unhurt',
};

function factValue(here: EncounterHere, fact: EncounterFact): string {
  switch (fact) {
    case 'count':
      return here.foes.length === 1 ? 'One, alone' : `${here.foes.length} of them`;
    case 'identity':
      return [...new Set(here.foes.map((f) => f.name))].join(', ');
    case 'kit': {
      const notes = traitNotes([...new Set(here.foes.flatMap((f) => f.traits ?? []))]);
      return notes.length > 0 ? notes.map((n) => n.label).join(', ') : 'No tricks. Just a fight.';
    }
    case 'terrain':
      return here.flavour.terrain;
    case 'awareness':
      return ALERTNESS_LABEL[here.encounter.alertness];
  }
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function factHint(here: EncounterHere, fact: EncounterFact): string {
  const ways = here.template.recon.filter((r) => RECON_REVEALS[r.id].includes(fact));
  return ways.length > 0
    ? `Unknown. ${ways.map((r, i) => (i === 0 ? r.label : lowerFirst(r.label))).join(' or ')}.`
    : 'Unknown. You’ll find out when it starts.';
}

function factLines(here: EncounterHere): FactLine[] {
  return (['count', 'identity', 'kit', 'awareness', 'terrain'] as const).map((fact) => {
    const known = here.encounter.known.includes(fact);
    return {
      fact,
      label: FACT_LABEL[fact],
      value: known ? factValue(here, fact) : null,
      hint: factHint(here, fact),
    };
  });
}

function foesOf(state: GameState, ctx: GameContext, here: EncounterHere): EncounterFoe[] | null {
  if (!here.encounter.known.includes('identity')) return null;
  const ids = here.foes.map((f, i) => enemyCombatantId(f.id, i));
  const reads = scoutOpponents(state, ctx, ids);
  const kit = here.encounter.known.includes('kit');
  return [...new Set(here.foes.map((f) => f.id))].flatMap((id) => {
    const index = here.foes.findIndex((f) => f.id === id);
    const def = here.foes[index];
    const read = reads[enemyCombatantId(id, index)];
    if (!def || !read) return [];
    const count = here.foes.filter((f) => f.id === id).length;
    const { threat, threatLabel } = read;
    return [{ name: def.name, count, threat, threatLabel, traits: kit ? read.traits : null }];
  });
}

function costLabel(cost: ReconCost): string {
  if (cost.energy) return `${cost.energy} energy`;
  if (cost.chakra) return `${cost.chakra} chakra`;
  return `${cost.ryo ?? 0} ryo`;
}

function percent(chance: number): string {
  return `${Math.round(chance * 100)}%`;
}

function reconCard(plan: ReconPlan): ReconCard {
  const who = plan.hand.personId ? `, ${plan.hand.name}` : '';
  const odds =
    plan.stat && plan.chance < 1
      ? `${STAT_INFO[plan.stat].label} ${percent(plan.chance)}${who}`
      : 'Certain';
  return {
    id: plan.id,
    label: plan.label,
    odds,
    cost: costLabel(plan.cost),
    blocker: plan.blocker,
    action: { type: 'encounterRecon', recon: plan.id },
  };
}

/** What a way past does to the pay on this kind of job, in words. */
export function payNote(job: JobKind, approach: ApproachId): string | null {
  const end = END_OF[approach];
  if (!end) return null;
  const pay = stagePay(job, end);
  if (!pay.jobDone) return 'Leaves the job undone. Nobody pays for it.';
  if (pay.ryo < 1 && pay.reputation > 1) return 'Less ryo, more reputation.';
  if (pay.ryo < 1 || pay.reputation < 1) return 'Pays less on this job.';
  return null;
}

function approachCard(here: EncounterHere, plan: ApproachPlan): ApproachCard {
  // A closed way shows why, not odds it can't use.
  const odds = plan.blocker === null ? percent(plan.chance) : '';
  const pace = plan.pace ? `, at ${plan.pace}’s pace` : '';
  const detail = plan.stat
    ? odds && `${STAT_INFO[plan.stat].label} ${odds}${pace}`
    : plan.ryo > 0
      ? `${plan.ryo} ryo`
      : FIXED_DETAIL[plan.id];
  return {
    id: plan.id,
    label: plan.label,
    detail,
    pay: payNote(here.stage.job, plan.id),
    needsRange: plan.needsRange,
    blocker: plan.blocker,
    action: { type: 'encounterApproach', approach: plan.id },
  };
}

export function encounterScene(state: GameState, ctx: GameContext): EncounterScene | null {
  const here = encounterHere(state, ctx);
  if (!here) return null;
  return {
    title: here.def.title,
    rank: here.def.rank,
    client: here.def.client,
    kind: here.template.name,
    lines: here.run.notes.slice(here.encounter.notesFrom).map(noteLine),
    facts: factLines(here),
    foes: foesOf(state, ctx, here),
    reconLeft: Math.max(0, MAX_RECON - here.encounter.recons),
    recon: reconPlans(state, ctx, here).map(reconCard),
    approaches: approachPlans(state, ctx, here).map((p) => approachCard(here, p)),
    ranges: RANGE_BANDS.map((id) => ({ id, label: RANGE_LABEL[id] })),
  };
}
