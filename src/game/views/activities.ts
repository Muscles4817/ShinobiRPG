import { STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';

import type { GameAction } from '../actions/types';
import { STUDY_ENERGY_COST } from '../actions/study';
import type { GameContext } from '../context';
import { blockerFor } from '../dispatch';
import type { GameState } from '../state';

/**
 * A generic "thing you can do" card. Every activity list in the UI is rendered from these,
 * and each carries the exact action to dispatch, so the UI needs no game knowledge.
 */
export interface ActionOption {
  readonly key: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly action: GameAction;
  /** Why it can't be done now; null when available. */
  readonly blocker: string | null;
}

function statList(delta: StatDelta, prefix = ''): string[] {
  return (Object.entries(delta) as [StatId, number][]).map(
    ([id, value]) => `${STAT_INFO[id].label} ${prefix}${value}`,
  );
}

function option(
  state: GameState,
  ctx: GameContext,
  fields: Omit<ActionOption, 'blocker'>,
): ActionOption {
  return { ...fields, blocker: blockerFor(state, fields.action, ctx) };
}

export function trainingOptions(state: GameState, ctx: GameContext): ActionOption[] {
  return ctx.content.training.all.map((t) =>
    option(state, ctx, {
      key: t.id,
      title: t.name,
      subtitle: t.location,
      description: t.description,
      tags: [`−${t.energyCost} energy`, ...statList(t.gains, '↑')],
      action: { type: 'train', trainingId: t.id },
    }),
  );
}

export function foodOptions(state: GameState, ctx: GameContext): ActionOption[] {
  return ctx.content.foods.all.map((f) =>
    option(state, ctx, {
      key: f.id,
      title: f.name,
      subtitle: `${f.cost} ryo`,
      description: f.description,
      tags: [
        `+${f.satiety} fullness`,
        ...(f.energy > 0 ? [`+${f.energy} energy`] : []),
        ...(f.slots > 0 ? [`${f.slots} time slot`] : []),
      ],
      action: { type: 'eat', foodId: f.id },
    }),
  );
}

export function restOptions(state: GameState, ctx: GameContext): ActionOption[] {
  return [
    option(state, ctx, {
      key: 'rest',
      title: 'Nap',
      subtitle: 'At home',
      description: 'Lie down for a while.',
      tags: ['+30 energy', '1 time slot'],
      action: { type: 'rest' },
    }),
    option(state, ctx, {
      key: 'sleep',
      title: 'Sleep',
      subtitle: 'At home',
      description: 'Sleep until morning. Recover energy, chakra and some health.',
      tags: ['Until morning'],
      action: { type: 'sleep' },
    }),
  ];
}

export function missionOptions(state: GameState, ctx: GameContext): ActionOption[] {
  return ctx.content.missions.all.map((m) =>
    option(state, ctx, {
      key: m.id,
      title: `[${m.rank}] ${m.title}`,
      subtitle: m.client,
      description: m.summary,
      tags: [
        `${m.reward.ryo} ryo`,
        `+${m.reward.reputation} rep`,
        `−${m.energyCost} energy`,
        `${m.slots} time slots`,
      ],
      action: { type: 'startMission', missionId: m.id },
    }),
  );
}

export interface TechniqueEntry extends ActionOption {
  readonly known: boolean;
  readonly progress: number;
  readonly difficulty: number;
}

export function techniqueOptions(state: GameState, ctx: GameContext): TechniqueEntry[] {
  return ctx.content.techniques.all.map((t) => {
    const known = state.techniques.known.includes(t.id);
    const requirements = statList(t.requirements, '≥');
    return {
      ...option(state, ctx, {
        key: t.id,
        title: t.name,
        subtitle: [t.discipline, t.element, t.effect].filter(Boolean).join(' · '),
        description: t.description,
        tags: [
          `${t.chakraCost} chakra`,
          `power ${t.power}`,
          ...(known ? [] : [...requirements, `study −${STUDY_ENERGY_COST} energy`]),
        ],
        action: { type: 'study', techniqueId: t.id },
      }),
      known,
      progress: known ? t.difficulty : (state.techniques.progress[t.id] ?? 0),
      difficulty: t.difficulty,
    };
  });
}
