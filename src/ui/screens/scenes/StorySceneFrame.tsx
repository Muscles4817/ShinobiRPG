import type { ReactNode } from 'react';

import type { GameContext, GameState } from '@/game';

import { ChoiceBarKeys } from '../../layout/ChoiceBarKeys';
import { SceneSide } from './SceneSide';

interface StorySceneFrameProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  /** The scene itself, read in the column. */
  readonly children: ReactNode;
}

/**
 * A story scene on the desktop layout: the scene in a reading column, the panel of what it is
 * about beside it, and number keys for its choice bar. On a phone the scene renders alone.
 */
export function StorySceneFrame({ ctx, state, children }: StorySceneFrameProps) {
  return (
    <>
      <div className="story-column">{children}</div>
      <SceneSide ctx={ctx} state={state} />
      <ChoiceBarKeys />
    </>
  );
}
