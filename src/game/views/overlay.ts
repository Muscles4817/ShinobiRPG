import type { GameContext } from '../context';
import type { Report } from '../reports';
import type { SceneKind } from './peopleScenes';
import type { GameState } from '../state';
import { dayEndView, type DayEndView } from './dayEnd';

/**
 * What is laid over play, if anything: the one place that decides which card is on top, so the
 * screen draws it and keeps everything under it (its choices, its keys) out of reach until it
 * is dismissed. A report waits for a fight's or a trip's last moments to play out; the
 * end-of-day sheet waits for scenes and reports, and is laid over play only in its full setting
 * (the morning slip sits on the village screen instead).
 */

export type Overlay =
  | { readonly kind: 'report'; readonly report: Report }
  | { readonly kind: 'day'; readonly view: DayEndView };

/** `scene` is what has the screen (`sceneOnScreen`), worked out once by the caller. */
export function overlayOnScreen(
  state: GameState,
  ctx: GameContext,
  scene: SceneKind | null,
): Overlay | null {
  // A fight's last exchange and a trip's title card play before any card covers them.
  if (state.combatFinale !== null || state.journeyEnd !== null) return null;
  const report = state.reports[0];
  if (report) return { kind: 'report', report };
  if (scene !== null) return null;
  const day = dayEndView(state, ctx);
  return day?.mode === 'full' ? { kind: 'day', view: day } : null;
}
