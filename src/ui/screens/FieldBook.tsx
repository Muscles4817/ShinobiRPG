import { useRef, useState, type KeyboardEvent } from 'react';

import {
  fieldBookView,
  type FieldEntry,
  type FieldPage,
  type GameContext,
  type GameState,
} from '@/game';

import { Icon } from '../art/Icon';
import { Chips } from '../components/Chips';

/**
 * The field book: a tab for each page (its seal and how full it is), then the page on paper:
 * what filling it earns, the entries you have, and the empty slots with their hints. Long runs
 * of empty slots fold away; a page you can never fill is a sealed slip saying why.
 */

/** Empty slots shown open before the rest fold away. */
const OPEN_EMPTY = 6;

function Entry({ entry }: { readonly entry: FieldEntry }) {
  return (
    <li className={`field-entry${entry.found ? '' : ' empty'}`}>
      <span className="field-icon" aria-hidden="true">
        <Icon id={entry.icon} size={26} />
      </span>
      <span className="field-body">
        <span className="field-head">
          <b>{entry.name}</b>
          {entry.stamps.map((s) => (
            <span key={s} className="badge">
              {s}
            </span>
          ))}
        </span>
        {entry.lines.map((line) => (
          <small key={line}>{line}</small>
        ))}
        <Chips chips={entry.chips} />
      </span>
    </li>
  );
}

function Reward({ page }: { readonly page: FieldPage }) {
  const { keepsake, piece, earned } = page.reward;
  return (
    <div className={`field-reward${earned ? ' earned' : ''}`}>
      <p>{earned ? 'This page earned you:' : 'Fill the page to earn:'}</p>
      <dl>
        {piece && (
          <>
            <dt>For the house</dt>
            <dd>
              {piece.name}
              <small>{piece.about}</small>
            </dd>
          </>
        )}
        <dt>For the shelf</dt>
        <dd>{keepsake}</dd>
      </dl>
      {earned && <span className="field-earned">Earned</span>}
    </div>
  );
}

function Entries({ page }: { readonly page: FieldPage }) {
  const found = page.entries.filter((e) => e.found);
  const empty = page.entries.filter((e) => !e.found);
  const folded = empty.slice(OPEN_EMPTY);
  return (
    <>
      {page.entries.length === 0 && (
        <p className="story">Nothing written here yet. The first fight writes the first entry.</p>
      )}
      <ul className="field-entries">
        {[...found, ...empty.slice(0, OPEN_EMPTY)].map((e) => (
          <Entry key={e.id} entry={e} />
        ))}
      </ul>
      {folded.length > 0 && (
        <details className="fold">
          <summary>{`${folded.length} more empty spaces`}</summary>
          <ul className="field-entries">
            {folded.map((e) => (
              <Entry key={e.id} entry={e} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function Page({ page }: { readonly page: FieldPage }) {
  const percent = page.total > 0 ? Math.round((page.filled / page.total) * 100) : 0;
  return (
    <section
      id={`field-page-${page.id}`}
      role="tabpanel"
      aria-labelledby={`field-tab-${page.id}`}
      className="room-slip field-page"
    >
      <header className="field-title">
        <span className={`field-seal${page.full ? ' full' : ''}`} aria-hidden="true">
          {page.seal}
        </span>
        <h2>{page.title}</h2>
      </header>
      {page.sealed ? (
        <p className="field-sealed">{page.sealed}</p>
      ) : (
        <>
          <p className="field-progress">
            <span className="bond-bar" aria-hidden="true">
              {percent > 0 && <i style={{ width: `${percent}%` }} />}
            </span>
            <span>{page.progress}</span>
          </p>
          <Reward page={page} />
          {page.note && <p className="field-note">{page.note}</p>}
          <Entries page={page} />
        </>
      )}
    </section>
  );
}

/** "3/6", "Full" or "Sealed" under a tab's name. */
function tabCount(page: FieldPage): string {
  if (page.sealed) return 'Sealed';
  return page.full ? 'Full' : `${page.filled}/${page.total}`;
}

function tabClass(page: FieldPage, on: boolean): string {
  return ['field-tab', on && 'on', page.full && 'full', page.sealed && 'sealed']
    .filter(Boolean)
    .join(' ');
}

export function FieldBook({
  ctx,
  state,
}: {
  readonly ctx: GameContext;
  readonly state: GameState;
}) {
  const view = fieldBookView(state, ctx);
  const [shown, setShown] = useState(view.pages[0]?.id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = Math.max(
    0,
    view.pages.findIndex((p) => p.id === shown),
  );
  const page = view.pages[at];
  // Arrow keys move along the tabs, as a tab list should.
  const onKey = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    const next = (at + step + view.pages.length) % view.pages.length;
    setShown(view.pages[next]?.id);
    tabs.current[next]?.focus();
  };
  return (
    <div className="field-book">
      <div className="field-tabs" role="tablist" aria-label="Pages" onKeyDown={onKey}>
        {view.pages.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`field-tab-${p.id}`}
            type="button"
            role="tab"
            aria-selected={i === at}
            aria-controls={`field-page-${p.id}`}
            tabIndex={i === at ? 0 : -1}
            className={tabClass(p, i === at)}
            onClick={() => {
              setShown(p.id);
            }}
          >
            <span className="field-tab-seal" aria-hidden="true">
              {p.seal}
            </span>
            <span>{p.title}</span>
            <small>{tabCount(p)}</small>
          </button>
        ))}
      </div>
      {page && <Page page={page} />}
    </div>
  );
}
