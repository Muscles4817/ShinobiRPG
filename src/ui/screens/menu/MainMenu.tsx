import { useState, type ReactNode } from 'react';

import type { SaveSummary } from '@/game';

import { InkSeal, TitleScene } from '../../art/TitleScene';
import { Notice } from '../../components/Notice';
import { KeyHint } from '../../layout/KeyHint';
import { useKeys } from '../../layout/useKeys';
import { useWideScreen } from '../../layout/useWideScreen';
import { ShareLink } from './ShareLink';

export interface MainMenuProps {
  /** The saved game, when there is one. */
  readonly save: SaveSummary | null;
  readonly notice: string | null;
  readonly onDismissNotice: () => void;
  readonly onContinue: () => void;
  readonly onNewGame: () => void;
  readonly onVersus: () => void;
  readonly onEditor: () => void;
  readonly onSettings: () => void;
}

interface MenuOption {
  readonly id: 'continue' | 'new-game' | 'versus' | 'editor' | 'settings';
  readonly glyph: string;
  readonly title: string;
  readonly line: ReactNode;
  readonly primary: boolean;
  readonly pick: () => void;
}

/** One choice on the menu, stamped with its character (and its number key on desktop). */
function OptionButton({
  option,
  index,
  wide,
}: {
  readonly option: MenuOption;
  readonly index: number;
  readonly wide: boolean;
}) {
  return (
    <button
      type="button"
      className={option.primary ? 'menu-option primary' : 'menu-option'}
      onClick={option.pick}
    >
      <span className="menu-glyph" aria-hidden="true">
        {option.glyph}
      </span>
      <span className="menu-words">
        <b>{option.title}</b>
        <small>{option.line}</small>
      </span>
      {wide && <KeyHint index={index} />}
    </button>
  );
}

/** Starting over replaces the save, so it asks first when there is one. */
function ConfirmNewGame({
  save,
  onNewGame,
  onKeep,
}: {
  readonly save: SaveSummary;
  readonly onNewGame: () => void;
  readonly onKeep: () => void;
}) {
  return (
    <div className="menu-confirm" role="group" aria-label="Start over?">
      <p>A new game replaces {save.name}’s save.</p>
      <div className="row-buttons">
        <button type="button" className="btn danger" onClick={onNewGame}>
          Start over
        </button>
        <button type="button" className="btn ghost" onClick={onKeep}>
          Keep {save.name}
        </button>
      </div>
    </div>
  );
}

/**
 * The menu's choices in order: carry on (when there is a save), begin again, versus, the editor,
 * settings.
 */
function menuOptions(props: MainMenuProps, askToStartOver: () => void): MenuOption[] {
  const { save } = props;
  const resume: MenuOption[] = save
    ? [
        {
          id: 'continue',
          glyph: '続',
          title: 'Continue',
          line: `${save.name}, ${save.line}`,
          primary: true,
          pick: props.onContinue,
        },
      ]
    : [];
  return [
    ...resume,
    {
      id: 'new-game',
      glyph: '新',
      title: 'New game',
      line: 'Break into the academy and graduate as a new genin.',
      primary: !save,
      pick: save ? askToStartOver : props.onNewGame,
    },
    {
      id: 'versus',
      glyph: '対',
      title: 'Versus',
      line: 'Any two fighters, head to head. Nothing is saved.',
      primary: false,
      pick: props.onVersus,
    },
    {
      id: 'editor',
      glyph: '編',
      title: 'Editor',
      line: 'Change how fighters are written, for versus and new games.',
      primary: false,
      pick: props.onEditor,
    },
    {
      id: 'settings',
      glyph: '設',
      title: 'Settings',
      line: 'Sound and music.',
      primary: false,
      pick: props.onSettings,
    },
  ];
}

/**
 * The title screen: carry on, begin again, set up a versus bout, edit the world, change the
 * settings, or share the game. On a wide screen the picture fills one side and the menu stands beside it, its
 * choices on the number keys and Continue (or a new game) on Enter.
 */
export function MainMenu(props: MainMenuProps) {
  const { save, notice } = props;
  const wide = useWideScreen();
  const [asking, setAsking] = useState(false);
  const options = menuOptions(props, () => {
    setAsking(true);
  });
  const primary = options.find((o) => o.primary);
  useKeys(
    {
      ...Object.fromEntries(options.map((o, i) => [String(i + 1), o.pick])),
      Enter: primary?.pick,
    },
    wide && !asking,
  );
  return (
    <main className={wide ? 'main-menu wide' : 'main-menu'}>
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
        {options.map((o, i) =>
          asking && save && o.id === 'new-game' ? (
            <ConfirmNewGame
              key={o.id}
              save={save}
              onNewGame={props.onNewGame}
              onKeep={() => {
                setAsking(false);
              }}
            />
          ) : (
            <OptionButton key={o.id} option={o} index={i} wide={wide} />
          ),
        )}
        <ShareLink />
      </nav>
      {wide && <p className="key-note">Number keys choose. Enter takes the first.</p>}
    </main>
  );
}
