import { useState } from 'react';

import { musicMood, saveSummary, type MusicMood, type SaveStore } from '@/game';

import { SoundProvider, useMusic } from './audio/SoundProvider';
import { GameScreen } from './screens/GameScreen';
import { CreationScreen } from './screens/creation/CreationScreen';
import { MainMenu } from './screens/menu/MainMenu';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { VersusBout } from './screens/versus/VersusBout';
import { VersusSetup, type VersusChoice } from './screens/versus/VersusSetup';
import { useGameSession, type GameSession } from './useGameSession';

/** Where the app is: the title menu, your game, a new game's creation, versus mode or settings. */
type Mode =
  | { readonly kind: 'menu' }
  | { readonly kind: 'settings' }
  | { readonly kind: 'game' }
  | { readonly kind: 'creation' }
  | { readonly kind: 'versus-setup' }
  | { readonly kind: 'versus'; readonly choice: VersusChoice; readonly bout: number };

/** Device settings kept nowhere, for an app given no store for them (tests, previews). */
const NO_PREFS: SaveStore = { load: () => null, save: () => undefined, clear: () => undefined };

interface AppProps {
  readonly store: SaveStore;
  /** Where the device's settings (sound) are kept, apart from the save. */
  readonly prefs?: SaveStore;
}

export function App({ store, prefs = NO_PREFS }: AppProps) {
  return (
    <SoundProvider prefs={prefs}>
      <Screens store={store} />
    </SoundProvider>
  );
}

/** The music for where the app is: the game's own mood in play, a fight in versus. */
function moodFor(mode: Mode, session: GameSession): MusicMood {
  const loaded = session.game;
  if (mode.kind === 'game' && loaded) return musicMood(loaded.game, loaded.ctx);
  return mode.kind === 'versus' ? 'fight' : 'title';
}

function Screens({ store }: { readonly store: SaveStore }) {
  const session = useGameSession(store);
  const [mode, setMode] = useState<Mode>({ kind: 'menu' });
  useMusic(moodFor(mode, session));
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
    case 'settings':
      return <SettingsScreen game={null} onBack={toMenu} />;
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
      onSettings={() => {
        setMode({ kind: 'settings' });
      }}
    />
  );
}
