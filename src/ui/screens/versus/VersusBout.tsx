import { useCallback, useState } from 'react';

import {
  createVersus,
  dispatch,
  fightRecordFile,
  overlayOnScreen,
  type GameAction,
  type GameState,
} from '@/game';

import { downloadFile } from '../../downloadFile';

import { Notice } from '../../components/Notice';
import { appClass } from '../../layout/sceneLayout';
import { useWideScreen } from '../../layout/useWideScreen';
import { OverlayCard } from '../../components/OverlayCard';
import { KeyLayer } from '../../layout/KeyLayer';
import { randomSeed } from '../../randomSeed';
import { ThinkingSlip } from '../../fight/ThinkingSlip';
import { isFightStep, useThinking } from '../../fight/useThinking';
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

/** What to do once a bout is over, with the bout kept whole to download. */
function AfterBout(props: VersusBoutProps & { readonly state: GameState }) {
  const { choice, onRematch, onChangeFighters, onMenu, state } = props;
  const file = fightRecordFile(state, choice.ctx);
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
      {file && (
        <section className="versus-record" aria-label="Fight record">
          <button
            type="button"
            className="btn ghost wide"
            onClick={() => {
              downloadFile(file.name, file.text);
            }}
          >
            Download fight record
          </button>
          <p className="muted">
            Every fighter as they began and ended, every choice with its reasons and every line of
            the fight, as one file to read or hand to an assistant.
          </p>
        </section>
      )}
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

  const { thinking, step } = useThinking();

  const perform = useCallback(
    (action: GameAction) => {
      if (!state || thinking) return;
      const settle = (result: ReturnType<typeof dispatch>) => {
        if (result.ok) setState(result.value);
        else setNotice(result.error);
      };
      // Foes think ahead off the page's thread, so the screen keeps breathing.
      if (isFightStep(action)) step(state, action, settle);
      else settle(dispatch(state, action, ctx));
    },
    [state, ctx, thinking, step],
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
  // A bout ends on its report; a bout passes no time, so no day ends over it.
  const overlay = overlayOnScreen(state, ctx);
  const card = overlay?.kind === 'report' ? overlay : null;
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
      <ThinkingSlip thinking={thinking} />
      <KeyLayer live={card === null}>
        {fighting ? (
          <div className="wide-scene">
            <CombatScene ctx={ctx} state={state} perform={perform} seeAll />
          </div>
        ) : (
          !card && <AfterBout {...props} state={state} />
        )}
      </KeyLayer>
      {card && <OverlayCard overlay={card} perform={perform} />}
    </div>
  );
}
