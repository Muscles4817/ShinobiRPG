import type { CombatCall, CombatTechnique, SummonFate } from '../../contract';

/**
 * What a fighter can call (`summons.ts` plays the call): the summons they hold, which of them
 * are out now, and how each one called this fight ended its part. Kept apart so card rules can
 * ask whether a summoning card is ready without reaching the play.
 */
export interface Caller {
  readonly calls?: readonly CombatCall[];
  /** Call ids of the summons out on the field now. */
  readonly summonsOut?: readonly string[];
  /** How each summon called this fight ended its part, by call id (the last call of each). */
  readonly summonFates?: Readonly<Record<string, SummonFate>>;
  /** Calls that won't answer again this fight: beaten, or sent home hurt to save them. */
  readonly summonsLost?: readonly string[];
  /** Call ids of sage toads perched on them (`perching.ts`), off the field but still out. */
  readonly perched?: readonly string[];
}

/** Every call a technique summons: one, or a pair that answer together (the sage toads). */
export function callsOf(technique: Pick<CombatTechnique, 'effects'>): string[] {
  return technique.effects.flatMap((e) => (e.verb === 'summon' ? [e.call] : []));
}

/** Whether a call's summon is out: on the field, or perched on its caller. */
export function isOut(fighter: Caller, callId: string): boolean {
  return (fighter.summonsOut ?? []).includes(callId);
}

/**
 * Whether a summoning technique can be played now: it holds every call, none of them is out, and
 * none was lost this fight; and the summons the technique needs (`needsCalls`) are out.
 */
export function canCall(fighter: Caller, technique: CombatTechnique): boolean {
  const ready = (technique.needsCalls ?? []).every((id) => isOut(fighter, id));
  const calls = callsOf(technique);
  return ready && calls.every((call) => answers(fighter, call));
}

/** Whether a call would answer now: held, not out, not lost. */
export function answers(fighter: Caller, callId: string): boolean {
  const holds = (fighter.calls ?? []).some((c) => c.id === callId);
  return holds && !isOut(fighter, callId) && !(fighter.summonsLost ?? []).includes(callId);
}

/** A fighter who is a summon, while it is out: whose it is, which call, and what it costs. */
export interface Summoned {
  readonly summoner?: string;
  readonly callId?: string;
  readonly upkeep?: number;
  /** A puppet on its maker's threads rather than a summon. */
  readonly puppet?: true;
  /** Big enough to carry its caller (`riding.ts`). */
  readonly mount?: true;
}
