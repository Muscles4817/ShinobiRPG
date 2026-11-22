import {
  CAUSE_KIND,
  CAUSE_KINDS,
  type CauseKind,
  type CombatantView,
  type CombatView,
  type NarrationCause,
  type NarrationOffPlan,
  type NarrationReaction,
  type ToldEvent,
  type ToldReaction,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

import { CAUSE_LABEL, OFF_PLAN_LABEL, REACTION_LABEL } from './combatLog';
import { causeSubject, lastRound, type RoundRead } from './roundEvents';

/**
 * Why the last round went as it did, for the plan screen: a few rows read from the round's own
 * events (from the divider that opens it), each a short phrase with its numbers in chips. Turns
 * of yours that went off your plan and why, how your attacks fared, who hurt you and how much,
 * foes who kept a distance other than yours, which of your defences worked, and what the round
 * cost you. Where the engine said why, the rows say it too, sorted by what the cause is about
 * (`CAUSE_KIND`) and counted for whom it is about: why your attacks were slipped, why your steps
 * failed, why your holds didn't take, why your techniques came apart, and moves that cost no
 * turn. Everything is read from what the engine recorded, so the strip says only what happened.
 */

export interface WhyRow {
  readonly text: string;
  readonly chips: readonly JournalChip[];
}

/** Reactions that mean an attack never landed. */
const MISSES: readonly NarrationReaction[] = ['dodged', 'missed', 'swapped', 'shielded'];
/** Pools whose spending the strip reports. */
const POOLS_SHOWN = [
  ['chakra', 'Chakra'],
  ['breath', 'Breath'],
] as const;
/** How many of those who hurt you get a row of their own. */
const HURT_ROWS = 3;
/** Health lost that counts as someone's hit: theirs, or a clone of yours burst by it. */
const HITS = new Set(['hit', 'popped']);

/** Each kind of cause, the row that says it for whom it is about. */
export const CAUSE_ROWS: Readonly<Record<CauseKind, string>> = {
  slipped: 'Why your attacks were slipped',
  'step-failed': 'Why your steps failed',
  'hold-failed': 'Why your holds didn’t take',
  'cast-broken': 'Why your techniques came apart',
  moved: 'Moves that cost you no turn',
};

/** How often each key comes up, weighted (by one each when unweighted). */
function counted<K>(entries: readonly (readonly [K, number])[]): Map<K, number> {
  const counts = new Map<K, number>();
  for (const [key, by] of entries) counts.set(key, (counts.get(key) ?? 0) + by);
  return counts;
}

/** Every defence at work in the round's lines. */
export function reactionsIn(told: readonly ToldEvent[]): ToldReaction[] {
  return told.flatMap((t) => t.reactions ?? []);
}

/** Your attacks a foe's defence met (`on` you, kept by someone else), by what it did. */
export function yourAttacksMet(round: RoundRead, you: string): ToldReaction[] {
  return reactionsIn(round.told).filter((r) => r.on === you && r.by !== you);
}

function attackRow(round: RoundRead, you: string): WhyRow[] {
  const dealt = round.harms.filter((h) => h.by === you && h.who !== you && HITS.has(h.cause));
  const missed = yourAttacksMet(round, you).filter((r) => MISSES.includes(r.reaction)).length;
  if (dealt.length + missed === 0) return [];
  const total = dealt.reduce((sum, h) => sum + h.amount, 0);
  const chips: JournalChip[] = [
    { label: `${dealt.length} landed`, tone: 'info' },
    ...(missed > 0 ? [{ label: `${missed} missed`, tone: 'info' as const }] : []),
    ...(total > 0 ? [{ label: `−${total}`, tone: 'harm' as const }] : []),
  ];
  return [{ text: 'Your attacks', chips }];
}

function hurtRows(round: RoundRead, you: string, fighters: readonly CombatantView[]): WhyRow[] {
  const hurt = round.harms.flatMap((h): (readonly [string, number])[] =>
    h.who === you && h.by !== undefined && h.by !== you ? [[h.by, h.amount]] : [],
  );
  return [...counted(hurt).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, HURT_ROWS)
    .map(([id, harm]) => ({
      text: `Hurt by ${fighters.find((f) => f.id === id)?.name ?? 'someone'}`,
      chips: [{ label: `−${harm}`, tone: 'harm' }],
    }));
}

const DISTANCE_CHIP = { close: 'Close', mid: 'Mid range', far: 'Far' } as const;

/** Foes still standing at a distance other than yours: who kept off, or got in, and where. */
function distanceRow(view: CombatView): WhyRow[] {
  const apart = view.combatants.filter(
    (f) => f.side === 'enemy' && f.health > 0 && f.distance && f.distance !== view.range,
  );
  if (apart.length === 0) return [];
  const chips = apart.map((f): JournalChip => {
    const where = f.distance ? DISTANCE_CHIP[f.distance] : '';
    return { label: `${f.name}: ${where}`, tone: 'info' };
  });
  return [{ text: 'Kept a distance of their own', chips }];
}

/** Your defences at work: each a defence you kept, whatever it met. */
function defenceRow(round: RoundRead, you: string): WhyRow[] {
  const kept = reactionsIn(round.told).filter((r) => r.by === you);
  if (kept.length === 0) return [];
  const chips = [...counted(kept.map((r) => [r.reaction, 1] as const)).entries()].map(
    ([r, n]): JournalChip => ({ label: `${REACTION_LABEL[r]} ×${n}`, tone: 'info' }),
  );
  return [{ text: 'Your defences', chips }];
}

/** Where your pools stand now, as the screen shows them (chakra, and breath when it is a meter). */
function poolsNow(you: CombatantView): Readonly<Record<string, number>> {
  const breath = you.meters?.find((m) => m.id === 'breath');
  return { chakra: you.chakra, ...(breath ? { breath: breath.value } : {}) };
}

/**
 * What the round cost you: where your pools stood as it opened against where they stand now,
 * after what came back as it ended, so the chips match your bars.
 */
function costRow(round: RoundRead, you: CombatantView): WhyRow[] {
  const opened = round.opened.pools[you.id];
  if (!opened) return [];
  const now = poolsNow(you);
  const chips = POOLS_SHOWN.flatMap(([pool, label]): JournalChip[] => {
    const was = opened[pool];
    const is = now[pool];
    const spent = was === undefined || is === undefined ? 0 : was - is;
    return spent > 0 ? [{ label: `${label} −${spent}`, tone: 'cost' }] : [];
  });
  return chips.length > 0 ? [{ text: 'What it cost you', chips }] : [];
}

/** The causes the round's lines gave about you, by what each is about. */
export function causesFor(round: RoundRead, you: string): Map<CauseKind, NarrationCause[]> {
  const byKind = new Map<CauseKind, NarrationCause[]>();
  for (const told of round.told) {
    if (!told.cause || causeSubject(told) !== you) continue;
    const kind = CAUSE_KIND[told.cause.cause];
    byKind.set(kind, [...(byKind.get(kind) ?? []), told.cause.cause]);
  }
  return byKind;
}

function causeRows(round: RoundRead, you: string): WhyRow[] {
  const byKind = causesFor(round, you);
  return CAUSE_KINDS.flatMap((kind): WhyRow[] => {
    const causes = byKind.get(kind);
    if (!causes) return [];
    const chips = [...counted(causes.map((c) => [c, 1] as const)).entries()].map(
      ([c, n]): JournalChip => ({ label: `${CAUSE_LABEL[c]} ×${n}`, tone: 'info' }),
    );
    return [{ text: CAUSE_ROWS[kind], chips }];
  });
}

function offPlanRows(round: RoundRead, you: string): WhyRow[] {
  const off = round.told.flatMap((t) =>
    t.actor === you && t.offPlan ? [[t.offPlan, 1] as const] : [],
  );
  return [...counted<NarrationOffPlan>(off).entries()].map(([why, n]) => ({
    text: OFF_PLAN_LABEL[why],
    chips: [{ label: `×${n}`, tone: 'info' }],
  }));
}

/** The strip for the round just played; empty before any round has been. */
export function roundWhy(view: CombatView): WhyRow[] {
  const you = view.combatants.find((c) => c.side === 'player');
  const round = lastRound(view.story);
  if (!you || !round) return [];
  return [
    ...offPlanRows(round, you.id),
    ...attackRow(round, you.id),
    ...causeRows(round, you.id),
    ...hurtRows(round, you.id, view.combatants),
    ...distanceRow(view),
    ...defenceRow(round, you.id),
    ...costRow(round, you),
  ];
}
