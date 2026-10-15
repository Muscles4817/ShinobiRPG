import { useState } from 'react';

import type { SaveSummary } from '@/game';

import { Notice } from '../../components/Notice';

export interface MainMenuProps {
  /** The saved game, when there is one. */
  readonly save: SaveSummary | null;
  readonly notice: string | null;
  readonly onDismissNotice: () => void;
  readonly onContinue: () => void;
  readonly onNewGame: () => void;
  readonly onVersus: () => void;
}

/** Starting over replaces the save, so it asks first when there is one. */
function NewGame({ save, onNewGame }: Pick<MainMenuProps, 'save' | 'onNewGame'>) {
  const [asking, setAsking] = useState(false);
  if (!asking || !save) {
    return (
      <button
        type="button"
        className={save ? 'menu-option' : 'menu-option primary'}
        onClick={() => {
          if (save) setAsking(true);
          else onNewGame();
        }}
      >
        <b>New game</b>
        <small>Break into the academy and graduate as a new genin.</small>
      </button>
    );
  }
  return (
    <div className="menu-confirm" role="group" aria-label="Start over?">
      <p>A new game replaces {save.name}’s save.</p>
      <div className="row-buttons">
        <button type="button" className="btn danger" onClick={onNewGame}>
          Start over
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAsking(false);
          }}
        >
          Keep {save.name}
        </button>
      </div>
    </div>
  );
}

/** The title screen: carry on, begin again, or set up a versus bout. */
export function MainMenu(props: MainMenuProps) {
  const { save, notice } = props;
  return (
    <main className="main-menu">
      {notice && <Notice text={notice} onDismiss={props.onDismissNotice} />}
      <header className="menu-title">
        <h1>Shinobi RPG</h1>
        <p>A shinobi’s life, one day at a time.</p>
      </header>
      <nav className="menu-options" aria-label="Main menu">
        {save && (
          <button type="button" className="menu-option primary" onClick={props.onContinue}>
            <b>Continue</b>
            <small>
              {save.name}, {save.line}
            </small>
          </button>
        )}
        <NewGame save={save} onNewGame={props.onNewGame} />
        <button type="button" className="menu-option" onClick={props.onVersus}>
          <b>Versus</b>
          <small>Any two fighters, head to head. Nothing is saved.</small>
        </button>
      </nav>
    </main>
  );
}
