import { listed } from '@/core';

import type { RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { familiarScale, runOf } from '../../rules/familiarity';
import { RANGE_BANDS } from '../../rules/range';
import { tell } from '../../rules/telling';
import { findCard } from './cards';
import { readsInTheMoment } from './judgement';
import { defenceKind, readOf } from './reads';
import { playerOf, type DefenceKind, type PlanFighter, type PlanState } from './state';

/**
 * What a foe has learned of you (audit P1.4), said where you can use it: the defences it has
 * seen you keep at each distance (reads are public, `reads.ts`) and, for a mind that reads the
 * fight, the moves you have leaned on until it reads them more easily (`rules/familiarity.ts`).
 * Between rounds, a foe that changes the defence it keeps says so (`adapt.ts`), plainly to eyes
 * as sharp as its own, as a change of stance to anyone else.
 */

const DEFENCE_WORD: Readonly<Record<DefenceKind, string>> = {
  guard: 'Guard',
  dodge: 'Dodge',
  counter: 'Counter',
  swap: 'substitution',
};

const AT: Readonly<Record<RangeBand, string>> = {
  close: 'up close',
  mid: 'at mid range',
  far: 'from far off',
};

function seenDefences(state: PlanState, you: PlanFighter): string[] {
  const seen = readOf(state.reads, you.id).defences;
  return RANGE_BANDS.flatMap((band) => {
    const kind = seen[band];
    return kind ? [`your ${DEFENCE_WORD[kind]} ${AT[band]}`] : [];
  });
}

/** Your technique a foe now reads more easily for your throwing it turns running. */
function readMoves(you: PlanFighter, foe: PlanFighter): string[] {
  const reader = readsInTheMoment(foe);
  return you.techniques
    .filter((t) => familiarScale(runOf(you, `jutsu:${t.id}`), reader) > 1)
    .map((t) => t.name);
}

/** What the screen says a foe has learned of you, if anything. */
export function learnedLine(state: PlanState, foe: PlanFighter): string | undefined {
  if (foe.side !== 'enemy' || !alive(foe) || state.result) return undefined;
  const you = playerOf(state);
  const seen = seenDefences(state, you);
  const read = readMoves(you, foe);
  const parts = [
    ...(seen.length > 0 ? [`Has seen ${listed(seen)}.`] : []),
    ...(read.length > 0 ? [`Has your ${listed(read)} read.`] : []),
  ];
  return parts.length > 0 ? parts.join(' ') : undefined;
}

/** Whether your eyes are as sharp as a foe's: then you see exactly what it changed. */
function sharpEnough(you: PlanFighter, foe: PlanFighter): boolean {
  return you.attributes.perception >= foe.attributes.perception;
}

function changedAt(before: PlanFighter, after: PlanFighter): RangeBand | undefined {
  return RANGE_BANDS.find(
    (b) => (before.reactions?.[b] ?? null) !== (after.reactions?.[b] ?? null),
  );
}

/** A line for each foe that changed the defence it keeps between rounds. */
export function adaptLines(
  before: readonly PlanFighter[],
  after: readonly PlanFighter[],
  you: PlanFighter,
): string[] {
  return after.flatMap((foe) => {
    const was = before.find((f) => f.id === foe.id);
    const band = was && foe.side === 'enemy' && alive(foe) ? changedAt(was, foe) : undefined;
    if (!was || !band) return [];
    const id = foe.reactions?.[band];
    const card = id ? findCard(foe, id) : null;
    if (!card || !sharpEnough(you, foe)) {
      return [tell('{f} shift{f.s} {f.their} stance, ready for you in some new way.', { f: foe })];
    }
    const kind = defenceKind(card);
    const what = kind ? `a ${DEFENCE_WORD[kind]}` : 'a new defence';
    return [
      tell(`{f} {f.has} seen enough of you, and keep{f.s} ${what} ready ${AT[band]} now.`, {
        f: foe,
      }),
    ];
  });
}
