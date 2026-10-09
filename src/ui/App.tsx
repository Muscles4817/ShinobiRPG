import type { SaveStore } from '@/game';

import { GameScreen } from './screens/GameScreen';
import { NewGameScreen } from './screens/NewGameScreen';
import { useGameSession } from './useGameSession';

export function App({ store }: { readonly store: SaveStore }) {
  const session = useGameSession(store);
  return session.game ? (
    <GameScreen session={session} ctx={session.game.ctx} state={session.game.game} />
  ) : (
    <NewGameScreen notice={session.notice} onStart={session.start} />
  );
}
