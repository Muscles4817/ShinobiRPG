import type { SceneKind } from '@/game';

/**
 * How the app is laid out around what has the screen: the phone's column, the desktop layout of
 * rail, main column and you panel, or a scene's own desktop arrangement.
 */

/**
 * Scenes with a desktop arrangement of panes of their own; the rest are story scenes, read in
 * one wider column with keys for their choice bar.
 */
const WIDE_SCENES: readonly SceneKind[] = ['mission', 'journey', 'combat'];

export function isStoryScene(scene: SceneKind | null): boolean {
  return scene !== null && !WIDE_SCENES.includes(scene);
}

/** The app's classes: the desktop layout outside scenes and in them. */
export function appClass(wide: boolean, scene: SceneKind | null): string {
  if (!wide) return 'app';
  if (!scene) return 'app wide';
  return `app wide scene-${scene}${isStoryScene(scene) ? ' scene-story' : ''}`;
}
