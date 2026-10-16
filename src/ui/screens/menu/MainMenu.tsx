import { useState } from 'react';

import type { SaveSummary } from '@/game';

import { InkSeal, TitleScene } from '../../art/TitleScene';
import { Notice } from '../../components/Notice';
import { ShareLink } from './ShareLink';

export interface MainMenuProps {
  /** The saved game, when there is one. */
  readonly save: SaveSummary | null;
  readonly notice: string | null;
  readonly onDismissNotice: () => void;
  readonly onContinue: () => void;
  readonly onNewGame: () => void;
  readonly onVersus: () => void;
  readonly onSettings: () => void;
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
        <span className="menu-glyph" aria-hidden="true">
          新
        </span>
        <span className="menu-words">
          <b>New game</b>
          <small>Break into the academy and graduate as a new genin.</small>
        </span>
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

/**
 * The title screen: carry on, begin again, set up a versus bout, change the settings, or share
 * the game.
 */
export function MainMenu(props: MainMenuProps) {
  const { save, notice } = props;
  return (
    <main className="main-menu">
      {notice && <Notice text={notice} onDismiss={props.onDismissNotice} />}
      <header className="menu-hero">
        <TitleScene />
        <p className="menu-vertical" lang="ja" aria-hidden="true">
          忍の道を、一日ずつ。
        </p>
        <div className="menu-title">
          <h1>
            Shinobi <span>RPG</span>
          </h1>
          <InkSeal glyphs={['忍', '道']} />
        </div>
        <p className="menu-tagline">A shinobi’s life, one day at a time.</p>
      </header>
      <nav className="menu-options" aria-label="Main menu">
        {save && (
          <button type="button" className="menu-option primary" onClick={props.onContinue}>
            <span className="menu-glyph" aria-hidden="true">
              続
            </span>
            <span className="menu-words">
              <b>Continue</b>
              <small>
                {save.name}, {save.line}
              </small>
            </span>
          </button>
        )}
        <NewGame save={save} onNewGame={props.onNewGame} />
        <button type="button" className="menu-option" onClick={props.onVersus}>
          <span className="menu-glyph" aria-hidden="true">
            対
          </span>
          <span className="menu-words">
            <b>Versus</b>
            <small>Any two fighters, head to head. Nothing is saved.</small>
          </span>
        </button>
        <button type="button" className="menu-option" onClick={props.onSettings}>
          <span className="menu-glyph" aria-hidden="true">
            設
          </span>
          <span className="menu-words">
            <b>Settings</b>
            <small>Sound and music.</small>
          </span>
        </button>
        <ShareLink />
      </nav>
    </main>
  );
}
