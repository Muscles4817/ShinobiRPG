import {
  splitNarration,
  type CombatantView,
  type CombatView,
  type Narration,
  type NarrationOffPlan,
  type NarrationReaction,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

import { OFF_PLAN_LABEL, REACTION_LABEL } from './combatLog';
import { amountOwner, lineTarget } from './fightReplay';

/**
 * Why the last round went as it did, for the plan screen: a few rows read from the round's
 * own lines (from the divider that opens it, `roundStart`), each a short phrase with its
 * numbers in chips. Turns of yours that went off your plan and why, how your attacks fared,
 * who hurt you and how much, which of your defences worked, and what the round cost you.
 * Everything is read from what the engine told, so the strip says only what happened.
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

interface Line {
  readonly said: Narration;
  readonly target: string | null;
  readonly owner: string | null;
  readonly harm: number;
}

interface Tally {
  readonly offPlan: ReadonlyMap<NarrationOffPlan, number>;
  readonly landed: number;
  readonly missed: number;
  readonly dealt: number;
  readonly hurtBy: ReadonlyMap<string, number>;
  readonly defences: ReadonlyMap<NarrationReaction, number>;
}

/** The round's lines: everything from the last round's opening divider on. */
function lastRound(log: readonly string[]): Narration[] {
  const said = log.map(splitNarration);
  const start = said.map((s) => s.roundStart === true).lastIndexOf(true);
  return start < 0 ? [] : said.slice(start);
}

/** How often each key comes up, weighted (by one each when unweighted). */
function counted<K>(entries: readonly (readonly [K, number])[]): Map<K, number> {
  const counts = new Map<K, number>();
  for (const [key, by] of entries) counts.set(key, (counts.get(key) ?? 0) + by);
  return counts;
}

function read(said: Narration, fighters: readonly CombatantView[]): Line {
  const target = lineTarget(said, fighters);
  const harm = said.amounts.reduce((sum, a) => sum + (a.kind === 'harm' ? a.amount : 0), 0);
  return { said, target, owner: amountOwner(said, target), harm };
}

/** A hit of yours: it hurt someone other than you. */
const landedBy = (you: string) => (l: Line) =>
  l.said.actorId === you && l.harm > 0 && l.owner !== you;

/** Who hurt you with a line: a Counter's hurt is from whoever it answered. */
function hurtFrom({ said, target }: Line): string | null {
  return said.reactions.includes('countered') ? target : (said.actorId ?? null);
}

function tallied(lines: readonly Line[], you: string): Tally {
  const yours = lines.filter((l) => l.said.actorId === you);
  const landed = yours.filter(landedBy(you));
  const missed = yours.filter(
    (l) =>
      !landedBy(you)(l) && l.target !== you && l.said.reactions.some((r) => MISSES.includes(r)),
  );
  const hurt = lines.flatMap((l): (readonly [string, number])[] => {
    const from = l.owner === you && l.harm > 0 ? hurtFrom(l) : null;
    return from !== null && from !== you ? [[from, l.harm]] : [];
  });
  return {
    offPlan: counted(yours.flatMap((l) => (l.said.offPlan ? [[l.said.offPlan, 1] as const] : []))),
    landed: landed.length,
    missed: missed.length,
    dealt: landed.reduce((sum, l) => sum + l.harm, 0),
    hurtBy: counted(hurt),
    defences: counted(
      lines
        .filter((l) => l.target === you)
        .flatMap((l) => l.said.reactions.map((r) => [r, 1] as const)),
    ),
  };
}

function attackRow({ landed, missed, dealt }: Tally): WhyRow[] {
  if (landed + missed === 0) return [];
  const chips: JournalChip[] = [
    { label: `${landed} landed`, tone: 'info' },
    ...(missed > 0 ? [{ label: `${missed} missed`, tone: 'info' as const }] : []),
    ...(dealt > 0 ? [{ label: `−${dealt}`, tone: 'harm' as const }] : []),
  ];
  return [{ text: 'Your attacks', chips }];
}

function hurtRows({ hurtBy }: Tally, fighters: readonly CombatantView[]): WhyRow[] {
  return [...hurtBy.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, HURT_ROWS)
    .map(([id, harm]) => ({
      text: `Hurt by ${fighters.find((f) => f.id === id)?.name ?? 'someone'}`,
      chips: [{ label: `−${harm}`, tone: 'harm' }],
    }));
}

function defenceRow({ defences }: Tally): WhyRow[] {
  if (defences.size === 0) return [];
  const chips = [...defences.entries()].map(([r, n]): JournalChip => {
    return { label: `${REACTION_LABEL[r]} ×${n}`, tone: 'info' };
  });
  return [{ text: 'Your defences', chips }];
}

/** Where your pools stand now, as the screen shows them (chakra, and breath when it is a meter). */
function poolsNow(you: CombatantView): Readonly<Record<string, number>> {
  const breath = you.meters?.find((m) => m.id === 'breath');
  return { chakra: you.chakra, ...(breath ? { breath: breath.value } : {}) };
}

/**
 * What the round cost you: where your pools stood as it opened (its divider says) against where
 * they stand now, after what came back as it ended, so the chips match your bars.
 */
function costRow(lines: readonly Line[], you: CombatantView): WhyRow[] {
  const opened = lines.find((l) => l.said.pools?.[you.id])?.said.pools?.[you.id];
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

/** The strip for the round just played; empty before any round has been. */
export function roundWhy(view: CombatView): WhyRow[] {
  const you = view.combatants.find((c) => c.side === 'player');
  if (!you) return [];
  const lines = lastRound(view.log).map((said) => read(said, view.combatants));
  const tally = tallied(lines, you.id);
  const offPlan = [...tally.offPlan.entries()].map(([why, n]): WhyRow => {
    return { text: OFF_PLAN_LABEL[why], chips: [{ label: `×${n}`, tone: 'info' }] };
  });
  return [
    ...offPlan,
    ...attackRow(tally),
    ...hurtRows(tally, view.combatants),
    ...defenceRow(tally),
    ...costRow(lines, you),
  ];
}
