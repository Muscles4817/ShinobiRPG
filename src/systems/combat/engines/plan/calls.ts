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
  /** A hard hit made their puppets' threads slip, until their next turn (`puppets.ts`). */
  readonly threadsSlipped?: boolean;
}

/** The call a technique's `summon` effect names, if it has one. */
export function callOf(technique: CombatTechnique): string | undefined {
  const effect = technique.effects.find((e) => e.verb === 'summon');
  return effect?.verb === 'summon' ? effect.call : undefined;
}

/** Whether a summoning technique can be played now: it holds the call, and that summon isn't out. */
export function canCall(fighter: Caller, technique: CombatTechnique): boolean {
  const call = callOf(technique);
  if (call === undefined) return true;
  const holds = (fighter.calls ?? []).some((c) => c.id === call);
  return holds && !(fighter.summonsOut ?? []).includes(call);
}

/** A fighter who is a summon, while it is out: whose it is, which call, and what it costs. */
export interface Summoned {
  readonly summoner?: string;
  readonly callId?: string;
  readonly upkeep?: number;
  /** A puppet on its maker's threads rather than a summon. */
  readonly puppet?: true;
  /** A puppet its maker fights from inside, taking the blows aimed at them (`puppets.ts`). */
  readonly worn?: true;
}
