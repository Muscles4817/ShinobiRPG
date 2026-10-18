import {
  combatScene,
  dispatch,
  encounterScene,
  missionScene,
  type GameContext,
  type GameState,
} from '@/game';

import type { Recorder } from './recorder';

/**
 * Playing scenes through for a golden transcript, the way a steady player would: fights
 * watched round by round with the plan as it stands, encounters scouted once then met head-on,
 * and each choice the first one open unless a test prefers another.
 */

const MAX_STEPS = 120;

export function fightThrough(r: Recorder, ctx: GameContext, start: GameState): GameState {
  let s = start;
  for (let i = 0; i < MAX_STEPS && s.combat; i++) {
    const options = (combatScene(s, ctx)?.options ?? []).filter((o) => !o.disabledReason);
    const pick =
      options.find((o) => o.id === 'begin' || o.id === 'round') ??
      options.find((o) => o.targeted) ??
      options.find((o) => o.kind === 'end') ??
      options[0];
    if (!pick) break;
    s = r.play(s, { type: 'combatAct', optionId: pick.id }, pick.label);
  }
  return s.combatFinale ? r.play(s, { type: 'leaveFight' }) : s;
}

function encounterStep(r: Recorder, ctx: GameContext, s: GameState, scouted: boolean): GameState {
  const recon = encounterScene(s, ctx)?.recon.find((x) => !x.blocker);
  if (recon && !scouted) return r.play(s, recon.action, recon.label);
  return r.play(s, { type: 'encounterApproach', approach: 'head-on' });
}

/** Plays a job from the notice to the debrief. */
export function jobThrough(
  r: Recorder,
  ctx: GameContext,
  start: GameState,
  missionId: string,
): GameState {
  let s = r.play(start, { type: 'startMission', missionId });
  let scouted = false;
  for (let i = 0; i < MAX_STEPS && (s.mission || s.combat || s.combatFinale); i++) {
    if (s.combat || s.combatFinale) {
      s = fightThrough(r, ctx, s);
    } else if (s.mission?.encounter) {
      s = encounterStep(r, ctx, s, scouted);
      scouted = !scouted;
    } else {
      const choice = missionScene(s, ctx)?.choices.find((c) => !c.closed);
      if (choice) s = r.play(s, choice.action, choice.label);
      else if (dispatch(s, { type: 'missionContinue' }, ctx).ok) {
        s = r.play(s, { type: 'missionContinue' });
      } else break;
    }
  }
  while (s.reports.length > 0) s = r.play(s, { type: 'dismissReport' });
  return s;
}
