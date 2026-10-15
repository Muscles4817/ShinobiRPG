import type { ScreenProps } from '../types';
import { SettingsPanel } from '../SettingsPanel';
import { SoundSettings } from './SoundSettings';

interface SettingsScreenProps {
  /** The game in play, for the settings kept with its save; null from the title screen. */
  readonly game: ScreenProps | null;
  readonly onBack: () => void;
}

/**
 * The settings page: sound for the device, then (in a game) what is kept with the save. Opened
 * from the title screen and from the Shinobi tab.
 */
export function SettingsScreen({ game, onBack }: SettingsScreenProps) {
  return (
    <main className="page settings-page">
      <header className="settings-page-head">
        <button type="button" className="btn ghost" onClick={onBack}>
          Back
        </button>
        <h2>Settings</h2>
      </header>
      <SoundSettings />
      {game && <SettingsPanel ctx={game.ctx} state={game.state} perform={game.perform} />}
    </main>
  );
}
