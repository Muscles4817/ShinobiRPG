import { QUALITY_GRADES } from '@/content';
import { SWARM_GIFTS, SWARM_QUALITIES, type SwarmGift, type SwarmQuality } from '@/systems/combat';
import { BREED_AT_HOME, stabilityOf, understood, type StrainSheet } from '@/systems/hives';

import type { GameContext } from '../context';
import { qualitiesInBody, strainSheet, yourHive } from '../hives/hive';
import { choice, type Choice } from './common';
import type { GameState } from '../state';

/**
 * Your hive on the Shinobi tab: its strain, the share of chakra it took, and how full it is,
 * in words, with how soon it fills again.
 */

export interface HiveCard {
  readonly strain: string;
  readonly description: string;
  readonly share: string;
  /** How full it is, 0 to 1, for the bar. */
  readonly fill: number;
  readonly state: string;
  readonly breeding: string;
  /** What its species can do, in words ("Drains chakra, greatly"). */
  readonly gifts: readonly string[];
  /** Its qualities in your body, graded E to A. */
  readonly qualities: readonly { readonly name: string; readonly grade: string }[];
  /** What it can't stand ("Fire"). */
  readonly fears: readonly string[];
  /** Wild insects in jars at home: studied or not, how a cross would go, and what you can do. */
  readonly jars: readonly JarRow[];
  /** A cross breeding, in words, or null. */
  readonly brood: string | null;
  /** The strain is one you bred, so you may name it. */
  readonly nameable: boolean;
}

export interface JarRow {
  readonly strainId: string;
  readonly name: string;
  readonly known: boolean;
  /** How a cross with your hive would go, in a word, once you know them. */
  readonly stability: string | null;
  readonly study: Choice;
  readonly cross: Choice;
}

const STABILITY_WORDS = [
  [0.85, 'True-breeding: a cross would take'],
  [0.6, 'Settled: a cross should mostly take'],
  [0.35, 'Wavering: a cross could go either way'],
  [0, 'Wild: a cross is a gamble'],
] as const;

function stabilityWord(stability: number): string {
  return STABILITY_WORDS.find(([at]) => stability >= at)?.[1] ?? 'Wild: a cross is a gamble';
}

const GIFT_WORDS: Readonly<Record<SwarmGift, string>> = {
  drain: 'Drains chakra',
  camouflage: 'Hard to see coming',
  glow: 'Marks a foe with glowing dust',
  blinding: 'Blinds with its scales',
  venom: 'Venomous',
};
const STRENGTH = ['', 'a little', 'strongly', 'greatly'] as const;
const QUALITY_NAMES: Readonly<Record<SwarmQuality, string>> = {
  speed: 'Speed',
  bite: 'Bite',
  toughness: 'Toughness',
  brood: 'Brood',
  size: 'Smallness',
  senses: 'Senses',
};

const SHARE_LINE = {
  little: 'It took a quarter of your chakra.',
  half: 'It took half your chakra.',
  most: 'It took most of your chakra.',
} as const;

function stateWord(fill: number): string {
  if (fill >= 1) return 'Full';
  if (fill >= 0.6) return 'Thinned';
  return fill > 0 ? 'Thin' : 'Spent';
}

function breedingLine(fill: number): string {
  if (fill >= 1) return 'The hive is as full as your body can keep it.';
  const days = Math.ceil((1 - fill) / BREED_AT_HOME);
  return days <= 1
    ? 'A night at home will see it full again.'
    : 'A few days at home will see it full again; it breeds slowly away.';
}

export function hiveCard(state: GameState, ctx: GameContext): HiveCard | null {
  const yours = yourHive(state, ctx);
  if (!yours) return null;
  const inBody = qualitiesInBody(yours.strain);
  const fill = yours.cap > 0 ? Math.min(1, yours.hive.count / yours.cap) : 0;
  return {
    strain: yours.strain.name,
    description:
      ctx.content.strains.get(yours.strain.id)?.description ??
      `A ${yours.strain.species} you bred yourself.`,
    share: SHARE_LINE[yours.hive.share],
    fill,
    state: stateWord(fill),
    breeding: breedingLine(fill),
    gifts: SWARM_GIFTS.flatMap((gift) => {
      const strength = yours.strain.gifts[gift];
      return strength ? [`${GIFT_WORDS[gift]}, ${STRENGTH[strength]}`] : [];
    }),
    qualities: SWARM_QUALITIES.map((q) => ({
      name: QUALITY_NAMES[q],
      grade: QUALITY_GRADES[inBody[q] - 1] ?? 'A',
    })),
    fears: yours.strain.fears.map((e) => e.charAt(0).toUpperCase() + e.slice(1)),
    jars: jarRows(state, ctx, yours.strain),
    brood: broodLine(state),
    nameable: (yours.hive.bred ?? []).some((s) => s.id === yours.hive.strainId),
  };
}

function jarRows(state: GameState, ctx: GameContext, strain: StrainSheet): JarRow[] {
  return (state.hive?.jars ?? []).flatMap((jar) => {
    const sheet = strainSheet(state.hive, jar.strainId, ctx);
    if (!sheet) return [];
    const known = understood(jar);
    return [
      {
        strainId: jar.strainId,
        name: sheet.name,
        known,
        stability: known ? stabilityWord(stabilityOf(strain, sheet)) : null,
        study: choice(state, ctx, { type: 'studyJar', strainId: jar.strainId }),
        cross: choice(state, ctx, { type: 'crossJar', strainId: jar.strainId }),
      },
    ];
  });
}

function broodLine(state: GameState): string | null {
  const brood = state.hive?.breeding;
  if (!brood) return null;
  return brood.readyDay - state.time.day <= 1
    ? 'A brood is breeding in the hive. It hatches tomorrow.'
    : 'A brood is breeding in the hive. It hatches in a few days.';
}
