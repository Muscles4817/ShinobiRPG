import { useState } from 'react';

import { InkSeal, TitleScene } from '../../art/TitleScene';
import { Notice } from '../../components/Notice';
import { useWideScreen } from '../../layout/useWideScreen';
import { ConfirmNewGame } from './ConfirmNewGame';
import { menuOptions, type MainMenuProps, type MenuOption } from './menuOptions';
import { ShareLink } from './ShareLink';
import { WideMenu } from './WideMenu';

/** One choice on the menu, stamped with its character. */
function OptionButton({ option }: { readonly option: MenuOption }) {
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
    </button>
  );
}

/** The title menu on a phone: the picture, the title, and the choices in a column. */
function PhoneMenu(props: MainMenuProps) {
  const { save, notice } = props;
  const [asking, setAsking] = useState(false);
  const options = menuOptions(props, () => {
    setAsking(true);
  });
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
        {options.map((o) =>
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
            <OptionButton key={o.id} option={o} />
          ),
        )}
        <ShareLink />
      </nav>
    </main>
  );
}

/**
 * The title screen: carry on, begin again, set up a versus bout, edit the world, change the
 * settings, or share the game. A wide window gets a title screen of its own (`WideMenu`).
 */
export function MainMenu(props: MainMenuProps) {
  return useWideScreen() ? <WideMenu {...props} /> : <PhoneMenu {...props} />;
}
