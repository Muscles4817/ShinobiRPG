import type { GameAction, GameContext, GameState } from '@/game';

/** Props shared by every in-game screen and place page. */
export interface ScreenProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/** Props for a page inside a village (a place). */
export interface PlaceProps extends ScreenProps {
  readonly onBack: () => void;
}

/** Props for the Bonds tab, which opens people and your companion. */
export interface BondsProps extends ScreenProps {
  readonly onOpenPerson: (personId: string) => void;
  readonly onOpenCompanion: () => void;
}
