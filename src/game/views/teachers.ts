import type { PersonDef, TeachingQuirk } from '@/content';
import { stageForPair, stageOf } from '@/systems/bonds';
import { STAT_INFO, statTier, type StatGrade, type StatId } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import { TRAIN_WITH_ENERGY, TRAIN_WITH_SLOTS } from '../actions/trainWith';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { bondOf, everyone, fullName } from '../people/cast';
import { readPrice, type PricePart } from '../people/price';
import { personStats } from '../people/progress';
import { learnBlockerFor, learnBlockerText } from '../learning';
import { nextSignature, TEACHES_AT_STAGE } from '../people/signatures';
import {
  aheadIn,
  presentFor,
  sessionsUsed,
  steeredStat,
  steeringNote,
  teachingOf,
  type Teaching,
} from '../people/teachers';
import type { GameState } from '../state';
import { hardWorkEnergy } from '../profile';
import { choice, type Choice } from './common';
import { personFace, type PersonFace } from './people';

/**
 * "People here" at the training ground: who could train with you now, what each is ahead of
 * you in (their grade against yours), their price and how much of their time is left this week.
 * Stats you can't pick (they choose for you, or it will never take) fold away with the reason.
 */

export interface TeachStat extends Choice {
  readonly id: StatId;
  readonly label: string;
  /** Discipline colour, or the body/mind group. */
  readonly group: Discipline | 'body' | 'mind';
  readonly theirs: StatGrade;
  readonly yours: StatGrade;
}

export interface TeacherOffer {
  readonly person: PersonFace & { readonly fullName: string; readonly title: string };
  readonly isSensei: boolean;
  /** A genin like you: you practise together and both grow. */
  readonly isPeer: boolean;
  /** How they teach, in a phrase. */
  readonly manner: string;
  /** Empty when they ask nothing (your sensei). */
  readonly price: readonly PricePart[];
  readonly sessions: string;
  /** Who chooses what you train, while they do. */
  readonly steering: string | null;
  /** Stats you can pick now; their buttons share `blocker` when something else stops you. */
  readonly open: readonly TeachStat[];
  /** Why every open stat is refused right now (price, time, energy…), said once. */
  readonly blocker: string | null;
  readonly locked: readonly TeachStat[];
  /** Their next signature technique: progress once teaching has begun, or what unlocks it. */
  readonly signature: {
    readonly name: string;
    readonly progress: number;
    readonly locked: string | null;
  } | null;
  readonly energyCost: number;
  readonly slots: number;
}

/** How a quirk teaches, said after the person's own bio so no two teachers read the same. */
const QUIRK_MANNER: Readonly<Record<TeachingQuirk, string>> = {
  patient: 'A patient teacher: goes over it until it sticks.',
  harsh: 'A harsh teacher: drives you hard and doesn’t warm up quickly.',
  natural: 'A natural teacher: makes hard things look simple.',
  distracted: 'A distracted teacher: brilliant in patches.',
};

const PER_WEEK: Readonly<Record<number, string>> = {
  1: 'Once a week',
  2: 'Twice a week',
  7: 'Once a day',
};

function sessionsText(state: GameState, teaching: Teaching): string {
  const often = PER_WEEK[teaching.sessionsPerWeek] ?? `${teaching.sessionsPerWeek} times a week`;
  const left = Math.max(0, teaching.sessionsPerWeek - sessionsUsed(state, teaching.person.id));
  return teaching.sessionsPerWeek >= 7 ? often : `${often}, ${left} left this week`;
}

function groupOf(stat: StatId): TeachStat['group'] {
  const { group } = STAT_INFO[stat];
  return group === 'body' || group === 'mind' ? group : (stat as Discipline);
}

function teachStat(state: GameState, ctx: GameContext, person: PersonDef, id: StatId): TeachStat {
  return {
    ...choice(state, ctx, { type: 'trainWith', personId: person.id, statId: id }),
    id,
    label: STAT_INFO[id].label,
    group: groupOf(id),
    theirs: statTier(personStats(person, state)[id]).grade,
    yours: statTier(state.character.stats[id]).grade,
  };
}

/** An academy that also keeps this technique's scroll, so a teacher's art never hides one. */
function academyWith(ctx: GameContext, techniqueId: string): string | null {
  const places = ctx.content.locations.all.flatMap((l) => l.places);
  const shelf = places.find((p) => p.kind === 'academy' && p.techniqueIds.includes(techniqueId));
  return shelf?.name ?? null;
}

/**
 * What they'll teach next; failing that, the first one you can't learn yet, and why. A clan's
 * arts are never shown to outsiders.
 */
function signatureOf(state: GameState, ctx: GameContext, teaching: Teaching) {
  const nextId =
    nextSignature(state, teaching, ctx) ??
    teaching.teaches.find((id) => {
      const kind = learnBlockerFor(state, ctx.content.techniques.require(id), ctx)?.kind;
      return kind !== 'already-known' && kind !== 'clan';
    });
  if (!nextId) return null;
  const def = ctx.content.techniques.require(nextId);
  const stage = stageOf(bondOf(state, teaching.person.id).points);
  const blocker = learnBlockerFor(state, def, ctx);
  const shelf = academyWith(ctx, def.id);
  const orScroll = shelf ? `, or study the scroll at the ${shelf}` : '';
  const bondLock =
    stage < TEACHES_AT_STAGE
      ? `Taught once you and ${teaching.person.name} are ${stageForPair(TEACHES_AT_STAGE)}${orScroll}.`
      : null;
  return {
    name: def.name,
    progress: Math.min(1, (state.techniques.progress[def.id] ?? 0) / def.difficulty),
    locked: blocker ? learnBlockerText(blocker, def) : bondLock,
  };
}

function offerOf(state: GameState, ctx: GameContext, teaching: Teaching): TeacherOffer {
  const { person } = teaching;
  const stats = aheadIn(state, person).map((id) => teachStat(state, ctx, person, id));
  const steered = steeredStat(state, teaching);
  const lead = stats.find((s) => s.id === steered) ?? stats.find((s) => s.blocker === null);
  const shared = (lead ?? stats[0])?.blocker ?? null;
  const isOpen = (s: TeachStat) => s.blocker === null || s.blocker === shared;
  const quirk = person.teacher?.quirk;
  return {
    person: { ...personFace(state, person), fullName: fullName(person), title: person.title },
    isSensei: teaching.isSensei,
    isPeer: person.rank === 'genin',
    manner: teaching.isSensei
      ? (person.sensei?.style ?? '')
      : `${person.bio} ${quirk ? QUIRK_MANNER[quirk] : 'Happy to show you what they know.'}`,
    price: teaching.price ? readPrice(state, ctx, person, teaching.price) : [],
    sessions: sessionsText(state, teaching),
    steering: steered ? steeringNote(teaching) : null,
    open: stats.filter(isOpen),
    blocker: shared,
    locked: stats.filter((s) => !isOpen(s)),
    signature: signatureOf(state, ctx, teaching),
    energyCost: hardWorkEnergy(state.character, ctx, TRAIN_WITH_ENERGY),
    slots: TRAIN_WITH_SLOTS,
  };
}

/** Your sensei first, then teammates, then everyone else here by rank. */
function order(a: Teaching, b: Teaching): number {
  return Number(b.isSensei) - Number(a.isSensei) || b.factor - a.factor;
}

export function teacherOffers(state: GameState, ctx: GameContext): TeacherOffer[] {
  const place = placeHere(state, ctx, 'training');
  if (!place) return [];
  return everyone(state, ctx)
    .filter((p) => presentFor(state, ctx, p, place.id))
    .flatMap((p) => {
      const teaching = teachingOf(state, p);
      return teaching && aheadIn(state, p).length > 0 ? [teaching] : [];
    })
    .sort(order)
    .map((t) => offerOf(state, ctx, t));
}
