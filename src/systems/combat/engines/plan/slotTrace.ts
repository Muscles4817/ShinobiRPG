import { numberWord } from '@/core';

import type { CombatOption, RangeBand } from '../../contract';
import { bandOf } from './distance';
import { slotVerdict } from './slots';
import type { SlotTally, SlotTrace, TraceReason } from './traceShape';
import type { CardId, PlanFighter, Round } from './state';

/**
 * The slot trace (audit P1.2): for each of the player's turns, which slot played and why each
 * slot above it passed (`slots.ts` `slotVerdict`), or that something came first (an emergency
 * slot, a step towards where they fight, a teammate to pull free). A round's turns are tallied
 * per slot, and the plan screen shows the tally beside each slot until the next round begins.
 */

/** What one turn did to each slot at its distance, the slot that played last. */
export type TurnTrace = readonly {
  readonly card: CardId;
  readonly verdict: 'played' | TraceReason;
}[];

/** One turn of the player's, traced against the round it was taken in. */
export function traceTurn(self: PlanFighter, round: Round, played: CardId): TurnTrace {
  const trace: { card: CardId; verdict: 'played' | TraceReason }[] = [];
  for (const slot of self.loadout[bandOf(round, self)]) {
    const verdict = slotVerdict(self, round, slot);
    if (!('plays' in verdict)) {
      trace.push({ card: slot.card, verdict: verdict.passed });
      continue;
    }
    trace.push({ card: slot.card, verdict: slot.card === played ? 'played' : 'preempted' });
    break;
  }
  return trace;
}

function counted(tally: SlotTally | undefined, verdict: 'played' | TraceReason): SlotTally {
  if (verdict === 'played') return { ...tally, played: (tally?.played ?? 0) + 1 };
  const passed = tally?.passed ?? {};
  return { ...tally, passed: { ...passed, [verdict]: (passed[verdict] ?? 0) + 1 } };
}

/** The round's trace with one more turn in it. */
export function withTurn(
  trace: SlotTrace | undefined,
  band: RangeBand,
  turn: TurnTrace,
): SlotTrace {
  const atBand = { ...trace?.[band] };
  for (const { card, verdict } of turn) atBand[card] = counted(atBand[card], verdict);
  return { ...trace, [band]: atBand };
}

/** A player's turn just taken (`round.ts`), added to the round's trace. */
export function tracedTurn(before: Round, after: Round, actorId: string): Round {
  const self = before.fighters.find((f) => f.id === actorId);
  const took = !before.acted?.includes(actorId) && after.acted?.includes(actorId) === true;
  if (!self?.isPlayer || before.watching === true || !took || after.played === undefined) {
    return after;
  }
  const turn = traceTurn(self, before, after.played);
  return { ...after, slotTrace: withTurn(after.slotTrace, bandOf(before, self), turn) };
}

const REASON_WORDS: Readonly<Record<TraceReason, string>> = {
  missing: 'none left',
  'out-of-reach': 'out of reach from here',
  'cannot-use': 'couldn’t be used then',
  saving: 'saving chakra',
  'not-needed': 'nothing for it to do',
  condition: 'its condition didn’t hold',
  'no-target': 'no foe it could aim at',
  preempted: 'something else came first',
};

function times(n: number): string {
  if (n === 1) return 'once';
  return n === 2 ? 'twice' : `${numberWord(n)} times`;
}

/** What the plan screen says beside a slot: how it fared last round, in words. */
export function traceNote(tally: SlotTally | undefined): string | undefined {
  if (!tally) return undefined;
  const played = tally.played ? `Played ${times(tally.played)}` : 'Never played';
  const passed = Object.entries(tally.passed ?? {}).map(
    ([why, n]) => `${times(n)}: ${REASON_WORDS[why as TraceReason]}`,
  );
  return passed.length === 0 ? `${played}.` : `${played}. Passed over ${passed.join('; ')}.`;
}

/** A slot at a distance you fought at that no turn ever looked at. */
const NEVER_REACHED = 'Never reached: a slot above it played every turn.';

/** The table's options, each of your own slotted cards noted with how it fared last round. */
export function withTraceNotes(
  options: readonly CombatOption[],
  trace: SlotTrace | undefined,
): CombatOption[] {
  return options.map((o) => {
    const [kind, band, ...rest] = o.id.split(':');
    if (kind !== 'slot' || o.owner !== undefined || !o.selected) return o;
    const atBand = trace?.[band as RangeBand];
    const note = atBand ? (traceNote(atBand[rest.join(':')]) ?? NEVER_REACHED) : undefined;
    return note ? { ...o, note } : o;
  });
}
