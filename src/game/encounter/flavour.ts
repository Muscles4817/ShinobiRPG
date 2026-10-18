import { freshIndex } from '@/core';
import { flavourChoices, type EncounterStage, type EncounterTemplate } from '@/systems/missions';
import { noteTold, recentlyTold, type Told } from '@/systems/telling';

/**
 * Which way an encounter reads: the template's own words or one of its sets that fits the job
 * and the ground, drawn by a hash of the moment and passing over the sets met lately, so a save
 * doesn't walk into the same bandit camp twice running. The memory is kept per template.
 */

export interface DrawnFlavour {
  /** An index into the template's `variants`, or -1 for its own words. */
  readonly set: number;
  readonly told: Told;
}

export function drawFlavour(
  told: Told,
  at: { readonly stage: EncounterStage; readonly template: EncounterTemplate },
  key: string,
): DrawnFlavour {
  const bank = `encounter-flavour:${at.template.id}`;
  const size = (at.template.variants?.length ?? 0) + 1;
  // The memory counts the template's own words as 0 and each set as its index plus one.
  const choices = flavourChoices(at.stage, at.template).map((set) => set + 1);
  const recent = recentlyTold(told, bank);
  const fresh = choices.filter((c) => !recent.includes(c));
  const pool = fresh.length > 0 ? fresh : choices;
  const picked = pool[freshIndex(`${bank}|${key}`, pool.length, [])] ?? 0;
  return { set: picked - 1, told: noteTold(told, bank, { index: picked, size }) };
}
