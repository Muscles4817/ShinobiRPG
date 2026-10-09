import type { StatDelta } from '@/systems/stats';

import type { Stall } from './stall';

/**
 * Village life: what people gossip about, what walks the streets at night, and the days the
 * whole village celebrates. All of it is data; the game decides what shows up on which day.
 */

/**
 * Gossip heard around the village. A rumour about a job goes round the day before the job is
 * posted; one about a person can come up any day; the rest is colour.
 */
export interface RumourDef {
  readonly id: string;
  readonly text: string;
  readonly missionId?: string;
  readonly personId?: string;
}

/**
 * Something that drifts through the village at night. Only eyes like an awakened bloodline's
 * see it for what it is and can follow it; everyone else notices only `unseen`.
 */
export interface SightDef {
  readonly id: string;
  /** What you see, for those who can. */
  readonly title: string;
  readonly text: string;
  /** What following it shows you, written as the outcome. */
  readonly outcome: string;
  /** What everyone else notices. */
  readonly unseen: string;
  readonly reward: StatDelta;
}

/** A day the whole village celebrates, every year. */
export interface FestivalDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** 0 = first season of the year. */
  readonly season: number;
  /** Day of the season, 1-based. */
  readonly day: number;
  /** Market prices are multiplied by this on the day (e.g. 0.5 for half price). */
  readonly marketPrices: number;
  /** Extra bond points from every conversation on the day. */
  readonly bondBonus: number;
  /** Stalls that set up in the market only on the day. */
  readonly stalls?: readonly Stall[];
}

export interface VillageLife {
  readonly rumours: readonly RumourDef[];
  readonly sights: readonly SightDef[];
  readonly festivals: readonly FestivalDef[];
}
