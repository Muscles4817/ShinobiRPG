import type { GameContext, SaveStore } from '@/game';

import { GameScreen } from './screens/GameScreen';
import { NewGameScreen } from './screens/NewGameScreen';
import { useGameSession } from './useGameSession';

interface AppProps {
  readonly ctx: GameContext;
  readonly store: SaveStore;
}

export function App({ ctx, store }: AppProps) {
  const session = useGameSession(ctx, store);
  return session.state ? (
    <GameScreen ctx={ctx} state={session.state} session={session} />
  ) : (
    <NewGameScreen ctx={ctx} notice={session.notice} onStart={session.start} />
  );
}
