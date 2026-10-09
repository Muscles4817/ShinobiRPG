import type { BackdropId } from '@/content';
import { newTenancy } from '@/systems/housing';
import { EMPTY_JOURNAL } from '@/systems/journal';
import { NEW_GENIN } from '@/systems/standing';
import { createStats, STAT_INFO, type StatId } from '@/systems/stats';
import { START_TIME } from '@/systems/time';
import { fullVitals } from '@/systems/vitals';

import type { GameContext } from './context';
import { log, placeHere } from './ops';
import type { GameState } from './state';

export interface NewGameOptions {
  readonly name: string;
  readonly aptitudeId: string;
  readonly seed: number;
}

export const BASE_STAT = 5;

export function createNewGame(options: NewGameOptions, ctx: GameContext): GameState {
  const { content } = ctx;
  const aptitude = content.aptitudes.require(options.aptitudeId);
  const stats = createStats(BASE_STAT, aptitude.statBonuses);
  const name = options.name.trim() || 'Nameless';
  const base = {
    packId: content.packId,
    rngState: options.seed,
    time: START_TIME,
    locationId: content.startLocationId,
  };
  const home = placeHere(base, ctx, 'home');
  if (!home) throw new Error(`Start location "${content.startLocationId}" has no home`);

  const state: GameState = {
    ...base,
    character: {
      name,
      aptitudeId: aptitude.id,
      stats,
      startingStats: stats,
      vitals: fullVitals(stats),
    },
    wallet: { ryo: content.startingRyo },
    housing: newTenancy(home.id, home.rentPerWeek, START_TIME.day),
    techniques: {
      known: [...new Set([...content.academyTechniques, ...aptitude.techniqueIds])],
      progress: {},
    },
    standing: NEW_GENIN,
    journal: EMPTY_JOURNAL,
    mission: null,
    combat: null,
    reports: [],
  };
  return log(state, { heading: 'Graduation', text: content.text.intro, tone: 'success' });
}

export interface AptitudeChoice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly bonuses: readonly string[];
  readonly technique: string | null;
}

/** Gifts offered on the new-game screen, with their exact bonuses spelled out. */
export function aptitudeChoices(ctx: GameContext): readonly AptitudeChoice[] {
  return ctx.content.aptitudes.all.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    bonuses: (Object.entries(a.statBonuses) as [StatId, number][]).map(
      ([id, value]) => `${STAT_INFO[id].label} +${value}`,
    ),
    technique: a.techniqueIds[0]
      ? (ctx.content.techniques.get(a.techniqueIds[0])?.name ?? null)
      : null,
  }));
}

export interface NewGameView {
  readonly village: string;
  readonly backdrop: BackdropId;
  readonly epithet: string;
  readonly intro: string;
  readonly graduate: string;
  readonly aptitudes: readonly AptitudeChoice[];
}

/** What the new-game screen shows for the chosen world. */
export function newGameView(ctx: GameContext): NewGameView {
  const village = ctx.content.locations.require(ctx.content.startLocationId);
  return {
    village: village.name,
    backdrop: village.backdrop,
    epithet: village.epithet,
    intro: ctx.content.text.intro,
    graduate: ctx.content.text.graduate,
    aptitudes: aptitudeChoices(ctx),
  };
}
