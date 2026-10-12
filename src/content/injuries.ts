import type { ModifierSpec } from '@/systems/modifiers';
import type { StatScale } from '@/systems/stats';

/**
 * Content schema for named injuries: where it hurts, what it slows down outside fights (a
 * ModifierSpec, like hunger), how much weaker it leaves each stat in a fight, and how long it
 * lasts before stamina shortens it.
 */

export const INJURY_SITES = [
  'head',
  'eyes',
  'ribs',
  'shoulder',
  'arm',
  'hand',
  'leg',
  'chakra',
  'body',
] as const;
export type InjurySite = (typeof INJURY_SITES)[number];

/** How each site reads on the Shinobi screen. */
export const INJURY_SITE_LABELS: Readonly<Record<InjurySite, string>> = {
  head: 'Head',
  eyes: 'Eyes',
  ribs: 'Ribs',
  shoulder: 'Shoulder',
  arm: 'Arm',
  hand: 'Hand',
  leg: 'Leg',
  chakra: 'Chakra network',
  body: 'Whole body',
};

/**
 * Where an injury can come from: losing a fight (`defeat`), straining one stat with a trump
 * card (`strain`, matched by its fight effect), or a trump that puts you in a hospital bed
 * (`collapse`).
 */
export const INJURY_CAUSES = ['defeat', 'strain', 'collapse'] as const;
export type InjuryCause = (typeof INJURY_CAUSES)[number];

export interface InjuryDef {
  readonly id: string;
  readonly name: string;
  readonly where: InjurySite;
  readonly description: string;
  /** What it slows outside fights: training, study. */
  readonly modifiers: ModifierSpec;
  /** Your stats in a fight are multiplied by these while it lasts (each between 0 and 1). */
  readonly fight: StatScale;
  /** How long it lasts, before stamina shortens it. */
  readonly days: number;
  readonly causes: readonly InjuryCause[];
  /** Laid up: no training, sparring or jobs until it heals. */
  readonly bedridden?: boolean;
}
