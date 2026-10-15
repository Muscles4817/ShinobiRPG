import { useState } from 'react';

import { saveSummary, type SaveStore } from '@/game';

import { GameScreen } from './screens/GameScreen';
import { CreationScreen } from './screens/creation/CreationScreen';
import { MainMenu } from './screens/menu/MainMenu';
import { VersusBout } from './screens/versus/VersusBout';
import { VersusSetup, type VersusChoice } from './screens/versus/VersusSetup';
import { useGameSession } from './useGameSession';

/** Where the app is: the title menu, your game, a new game's creation, or versus mode. */
type Mode =
  | { readonly kind: 'menu' }
  | { readonly kind: 'game' }
  | { readonly kind: 'creation' }
  | { readonly kind: 'versus-setup' }
  | { readonly kind: 'versus'; readonly choice: VersusChoice; readonly bout: number };

export function App({ store }: { readonly store: SaveStore }) {
  const session = useGameSession(store);
  const [mode, setMode] = useState<Mode>({ kind: 'menu' });
  const [lastChoice, setLastChoice] = useState<VersusChoice | null>(null);
  const toMenu = () => {
    setMode({ kind: 'menu' });
  };

  switch (mode.kind) {
    case 'game':
      if (!session.game) break;
      return (
        <GameScreen
          session={session}
          ctx={session.game.ctx}
          state={session.game.game}
          onMenu={toMenu}
        />
      );
    case 'creation':
      return (
        <CreationScreen
          notice={session.notice}
          onStart={(packId, draft, seed) => {
            session.start(packId, draft, seed);
            setMode({ kind: 'game' });
          }}
        />
      );
    case 'versus-setup':
      return (
        <VersusSetup
          initial={lastChoice}
          onBack={toMenu}
          onFight={(choice) => {
            setLastChoice(choice);
            setMode({ kind: 'versus', choice, bout: 1 });
          }}
        />
      );
    case 'versus':
      return (
        <VersusBout
          key={mode.bout}
          choice={mode.choice}
          onRematch={(choice) => {
            setLastChoice(choice);
            setMode({ kind: 'versus', choice, bout: mode.bout + 1 });
          }}
          onChangeFighters={() => {
            setMode({ kind: 'versus-setup' });
          }}
          onMenu={toMenu}
        />
      );
    case 'menu':
      break;
  }
  const loaded = session.game;
  return (
    <MainMenu
      save={loaded ? saveSummary(loaded.game, loaded.ctx) : null}
      notice={session.notice}
      onDismissNotice={session.dismissNotice}
      onContinue={() => {
        setMode({ kind: 'game' });
      }}
      onNewGame={() => {
        setMode({ kind: 'creation' });
      }}
      onVersus={() => {
        setMode({ kind: 'versus-setup' });
      }}
    />
  );
}
