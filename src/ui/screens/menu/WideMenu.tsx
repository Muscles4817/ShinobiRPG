import { useState } from 'react';

import type { SaveSummary } from '@/game';

import { InkSeal, TitleScene } from '../../art/TitleScene';
import { Notice } from '../../components/Notice';
import { useKeys } from '../../layout/useKeys';
import { ConfirmNewGame } from './ConfirmNewGame';
import { menuOptions, type MainMenuProps } from './menuOptions';
import { SaveCard } from './SaveCard';
import { gameAddress, whatsAppShareLink } from './ShareLink';

/**
 * The title menu on a wide window, laid out as a game's title screen: the lantern scene behind,
 * a plain list of choices on the left, and beside it a panel telling the one you are on (your
 * save card under Continue). Pointing at a choice or stepping to it with the arrow keys moves
 * the mark; a click, its number or Enter takes it.
 */

interface ListItem {
  readonly id: string;
  readonly glyph: string;
  readonly title: string;
  readonly line: string;
  readonly pick: () => void;
}

const RESUME_LINE = 'Pick up where you left off.';

function shareItem(): ListItem {
  return {
    id: 'share',
    glyph: '伝',
    title: 'Share',
    line: 'Send the game to a friend on WhatsApp. It opens in a new tab.',
    pick: () => {
      window.open(whatsAppShareLink(gameAddress()), '_blank', 'noopener,noreferrer');
    },
  };
}

/** What the panel says about the choice you are on. */
function Detail({
  item,
  save,
  asking,
  onNewGame,
  onKeep,
}: {
  readonly item: ListItem;
  readonly save: SaveSummary | null;
  readonly asking: boolean;
  readonly onNewGame: () => void;
  readonly onKeep: () => void;
}) {
  return (
    <section className="menu-detail" aria-live="polite" aria-label={item.title}>
      <span className="menu-detail-glyph" aria-hidden="true">
        {item.glyph}
      </span>
      <h2>{item.title}</h2>
      {item.id === 'continue' && save ? (
        <>
          <p>{RESUME_LINE}</p>
          <SaveCard save={save} />
        </>
      ) : (
        <p>{item.line}</p>
      )}
      {asking && save && item.id === 'new-game' && (
        <ConfirmNewGame save={save} onNewGame={onNewGame} onKeep={onKeep} />
      )}
    </section>
  );
}

interface MenuKeys {
  readonly items: readonly ListItem[];
  readonly marked: number;
  readonly mark: (index: number) => void;
  /** Starting over is being asked: only Esc, which keeps the save, is listened for. */
  readonly keep: (() => void) | null;
}

/** Number keys take a choice, the arrows move the mark and Enter takes the one marked. */
function useMenuKeys({ items, marked, mark, keep }: MenuKeys): void {
  const step = (by: number) => () => {
    mark((marked + by + items.length) % items.length);
  };
  useKeys(
    keep
      ? { Escape: keep }
      : {
          ...Object.fromEntries(items.map((item, i) => [String(i + 1), item.pick])),
          ArrowDown: step(1),
          ArrowUp: step(-1),
          Enter: items[marked]?.pick,
        },
    true,
  );
}

export function WideMenu(props: MainMenuProps) {
  const { save, notice } = props;
  const [asking, setAsking] = useState(false);
  const [marked, setMarked] = useState(0);
  const items: ListItem[] = [
    ...menuOptions(props, () => {
      setAsking(true);
    }),
    shareItem(),
  ];
  const keep = () => {
    setAsking(false);
  };
  // Moving to another choice drops the question of starting over.
  const mark = (index: number) => {
    if (index === marked) return;
    setMarked(index);
    keep();
  };
  useMenuKeys({ items, marked, mark, keep: asking ? keep : null });
  const current = items[marked] ?? items[0];
  return (
    <main className="main-menu wide">
      <TitleScene />
      <p className="menu-vertical" lang="ja" aria-hidden="true">
        忍の道を、一日ずつ。
      </p>
      <div className="wide-menu-column">
        {notice && <Notice text={notice} onDismiss={props.onDismissNotice} />}
        <header className="menu-title-block">
          <div className="menu-title">
            <h1>
              Shinobi <span>RPG</span>
            </h1>
            <InkSeal glyphs={['忍', '道']} />
          </div>
          <p className="menu-tagline">A shinobi’s life, one day at a time.</p>
        </header>
        <div className="wide-menu-body">
          <nav className="menu-list" aria-label="Main menu">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={i === marked ? 'menu-item on' : 'menu-item'}
                aria-current={i === marked ? 'true' : undefined}
                onMouseEnter={() => {
                  mark(i);
                }}
                onFocus={() => {
                  mark(i);
                }}
                onClick={item.pick}
              >
                <span className="menu-item-mark" aria-hidden="true" />
                <span className="menu-item-title">{item.title}</span>
                <kbd className="key-hint" aria-hidden="true">
                  {i + 1}
                </kbd>
              </button>
            ))}
          </nav>
          {current && (
            <Detail
              item={current}
              save={save}
              asking={asking}
              onNewGame={props.onNewGame}
              onKeep={keep}
            />
          )}
        </div>
        <p className="key-note">Arrows move, Enter or a number chooses.</p>
      </div>
    </main>
  );
}
