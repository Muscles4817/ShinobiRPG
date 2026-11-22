import type { SceneKind } from '@/game';

import { isStoryScene } from '../layout/sceneLayout';
import { ChakraPaperScene } from './scenes/ChakraPaperScene';
import { CombatScene } from './scenes/CombatScene';
import { ConversationScene } from './scenes/ConversationScene';
import { EncounterScene } from './scenes/EncounterScene';
import { ExamScene } from './scenes/ExamScene';
import { JourneyScene } from './scenes/journey/JourneyScene';
import { MissionScene } from './scenes/MissionScene';
import { PromotionScene } from './scenes/PromotionScene';
import { RaceScene } from './scenes/RaceScene';
import { RivalScene } from './scenes/RivalScene';
import { SenseiTestScene } from './scenes/SenseiTestScene';
import { StorySceneFrame } from './scenes/StorySceneFrame';
import { TeamScene } from './scenes/TeamScene';
import type { ScreenProps } from './types';

/** The scene that has the screen, by kind, in the box the desktop layout arranges. */

function Scene({ kind, ...props }: ScreenProps & { readonly kind: SceneKind }) {
  switch (kind) {
    case 'combat':
      return <CombatScene {...props} />;
    case 'encounter':
      return <EncounterScene {...props} />;
    case 'mission':
      return <MissionScene {...props} />;
    case 'journey':
      return <JourneyScene {...props} />;
    case 'exam':
      return <ExamScene {...props} />;
    case 'promotion':
      return <PromotionScene {...props} />;
    case 'conversation':
      return <ConversationScene {...props} />;
    case 'team':
      return <TeamScene {...props} />;
    case 'chakra-paper':
      return <ChakraPaperScene {...props} />;
    case 'sensei-test':
      return <SenseiTestScene {...props} />;
    case 'rival':
      return <RivalScene {...props} />;
    case 'race':
      return <RaceScene {...props} />;
  }
}

/**
 * A scene in its box: a story scene always in its frame, at any width, so crossing the
 * breakpoint never remounts it.
 */
export function SceneBox({ kind, ...props }: ScreenProps & { readonly kind: SceneKind }) {
  return (
    <div className="wide-scene">
      {isStoryScene(kind) ? (
        <StorySceneFrame ctx={props.ctx} state={props.state}>
          <Scene {...props} kind={kind} />
        </StorySceneFrame>
      ) : (
        <Scene {...props} kind={kind} />
      )}
    </div>
  );
}
