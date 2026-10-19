import { useWide } from '../../components/useWide';
import { PickSheet } from './PickSheet';
import { BothSides, GroundPicker, StartBout, WorldPicker } from './SetupParts';
import { useVersusSetup, type VersusChoice } from './useVersusSetup';
import { VersusDesk } from './VersusDesk';

export type { VersusChoice } from './useVersusSetup';

interface VersusSetupProps {
  readonly initial: VersusChoice | null;
  readonly onFight: (choice: VersusChoice) => void;
  readonly onBack: () => void;
}

/**
 * Choose a world and the two sides, one to four fighters each, then fight. A fighter is found
 * by filtering the roster and read in full before they are chosen. On a phone a slot opens the
 * roster over the page; on a desk the roster and the profile sit beside the bout.
 */
export function VersusSetup({ initial, onFight, onBack }: VersusSetupProps) {
  const setup = useVersusSetup(initial);
  const wide = useWide();
  return (
    <main className={wide ? 'versus-setup wide' : 'versus-setup'}>
      <header>
        <button type="button" className="btn ghost small" onClick={onBack}>
          Main menu
        </button>
        <h1>Versus</h1>
        <p className="muted">Fighters as the world writes them, up to four a side.</p>
      </header>
      {wide ? (
        <VersusDesk setup={setup} onFight={onFight} />
      ) : (
        <>
          <WorldPicker setup={setup} />
          <BothSides setup={setup} active={setup.slot} onOpen={setup.openSlot} />
          <GroundPicker setup={setup} />
          <StartBout setup={setup} onFight={onFight} />
          {setup.slot && <PickSheet setup={setup} slot={setup.slot} />}
        </>
      )}
    </main>
  );
}
