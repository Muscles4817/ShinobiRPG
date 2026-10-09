import { WORLD } from '@/content';
import { EMPTY_JOURNAL } from '@/systems/journal';
import { NEW_GENIN } from '@/systems/standing';
import { createStats } from '@/systems/stats';
import { START_TIME } from '@/systems/time';
import { fullVitals } from '@/systems/vitals';

import type { GameContext } from './context';
import { log } from './ops';
import type { GameState } from './state';

export interface NewGameOptions {
  readonly name: string;
  readonly aptitudeId: string;
  readonly seed: number;
}

export const BASE_STAT = 5;

export function createNewGame(options: NewGameOptions, ctx: GameContext): GameState {
  const aptitude = ctx.content.aptitudes.require(options.aptitudeId);
  const stats = createStats(BASE_STAT, aptitude.statBonuses);
  const name = options.name.trim() || 'Nameless';

  const state: GameState = {
    rngState: options.seed,
    time: START_TIME,
    character: { name, aptitudeId: aptitude.id, stats, vitals: fullVitals(stats) },
    wallet: { ryo: WORLD.startingRyo },
    techniques: {
      known: [...new Set([...ctx.content.academyTechniques, ...aptitude.techniqueIds])],
      progress: {},
    },
    standing: NEW_GENIN,
    journal: EMPTY_JOURNAL,
    mission: null,
    combat: null,
  };
  return log(state, `${WORLD.intro} Your name is ${name}.`);
}

export interface AptitudeChoice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export function aptitudeChoices(ctx: GameContext): readonly AptitudeChoice[] {
  return ctx.content.aptitudes.all.map(({ id, name, description }) => ({ id, name, description }));
}
