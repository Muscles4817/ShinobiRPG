import { useCallback, useState } from 'react';

import { createVersus, dispatch, type GameAction, type GameState } from '@/game';

import { Notice } from '../../components/Notice';
import { appClass } from '../../layout/sceneLayout';
import { useWideScreen } from '../../layout/useWideScreen';
import { ReportCard } from '../../components/ReportCard';
import { randomSeed } from '../../randomSeed';
import { CombatScene } from '../scenes/CombatScene';
import type { VersusChoice } from './VersusSetup';

interface VersusBoutProps {
  readonly choice: VersusChoice;
  /** Fight again with these fighters (a fresh roll), or with sides swapped. */
  readonly onRematch: (choice: VersusChoice) => void;
  readonly onChangeFighters: () => void;
  readonly onMenu: () => void;
}

function startBout(choice: VersusChoice): { state: GameState | null; notice: string | null } {
  const made = createVersus(choice.ctx, { ...choice, seed: randomSeed() });
  return made.ok ? { state: made.value, notice: null } : { state: null, notice: made.error };
}

/** What to do once a bout is over. */
function AfterBout({ choice, onRematch, onChangeFighters, onMenu }: VersusBoutProps) {
  return (
    <main className="versus-after">
      <h1>Bout over</h1>
      <nav className="menu-options" aria-label="After the bout">
        <button
          type="button"
          className="btn wide"
          onClick={() => {
            onRematch(choice);
          }}
        >
          Rematch
        </button>
        <button
          type="button"
          className="btn ghost wide"
          onClick={() => {
            onRematch({ ...choice, side: choice.foes, foes: choice.side });
          }}
        >
          Rematch with sides swapped
        </button>
        <button type="button" className="btn ghost wide" onClick={onChangeFighters}>
          Choose other fighters
        </button>
        <button type="button" className="btn ghost wide" onClick={onMenu}>
          Main menu
        </button>
      </nav>
    </main>
  );
}

/**
 * A versus bout, played on the game's own fight screen in a sandbox that is never saved, with
 * every fighter's bars in view, since both sides are yours to read.
 * Remount it (a new `key`) for a rematch.
 */
export function VersusBout(props: VersusBoutProps) {
  const { ctx } = props.choice;
  const [initial] = useState(() => startBout(props.choice));
  const [state, setState] = useState(initial.state);
  const [notice, setNotice] = useState(initial.notice);
  const wide = useWideScreen();

  const perform = useCallback(
    (action: GameAction) => {
      if (!state) return;
      const result = dispatch(state, action, ctx);
      if (result.ok) setState(result.value);
      else setNotice(result.error);
    },
    [state, ctx],
  );

  if (!state) {
    return (
      <main className="versus-after">
        {notice && <p role="alert">{notice}</p>}
        <button type="button" className="btn wide" onClick={props.onChangeFighters}>
          Choose fighters
        </button>
      </main>
    );
  }
  const report = state.reports[0];
  const fighting = state.combat !== null || state.combatFinale !== null;
  // A bout is the game's fight scene, so it takes the fight's desktop arrangement too.
  return (
    <div className={appClass(wide, fighting ? 'combat' : null)} data-motion="on">
      {notice && (
        <Notice
          text={notice}
          onDismiss={() => {
            setNotice(null);
          }}
        />
      )}
      {fighting ? (
        <div className="wide-scene">
          <CombatScene ctx={ctx} state={state} perform={perform} gauges />
        </div>
      ) : (
        !report && <AfterBout {...props} />
      )}
      {report && !state.combatFinale && (
        <ReportCard
          report={report}
          onContinue={() => {
            perform({ type: 'dismissReport' });
          }}
        />
      )}
    </div>
  );
}
