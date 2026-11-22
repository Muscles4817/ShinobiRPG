import type { ReactNode } from 'react';

import type { GameContext, GameState } from '@/game';

import { ChoiceBarKeys } from '../../layout/ChoiceBarKeys';
import { useWideScreen } from '../../layout/useWideScreen';
import { SceneSide } from './SceneSide';

interface StorySceneFrameProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  /** The scene itself, read in the column. */
  readonly children: ReactNode;
}

/**
 * A story scene, at any width: the scene in a reading column (no box at all on a phone, where
 * `.story-column` is `display: contents`), and on the desktop layout the panel of what it is
 * about beside it and number keys for its choice bar. The scene sits in the same place either
 * way, so crossing the breakpoint never remounts it and loses what it holds.
 */
export function StorySceneFrame({ ctx, state, children }: StorySceneFrameProps) {
  const wide = useWideScreen();
  return (
    <>
      <div className="story-column">{children}</div>
      {wide && <SceneSide ctx={ctx} state={state} />}
      {wide && <ChoiceBarKeys />}
    </>
  );
}
