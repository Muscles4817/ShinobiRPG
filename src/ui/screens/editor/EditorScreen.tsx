import { useMemo, useState } from 'react';

import {
  contextForPack,
  editorRoster,
  editStat,
  editTechniques,
  fighterEditor,
  hasEdits,
  NO_EDITS,
  OPEN_FILTER,
  packChoices,
  resetFighter,
  type VersusFilter,
} from '@/game';

import { useEdits } from '../../edits/EditsProvider';
import { useWideScreen } from '../../layout/useWideScreen';
import { RosterBrowser } from '../versus/RosterBrowser';
import { FighterEditorSheet } from './FighterEditorSheet';

/** The fan pack is the one built for versus play, so it opens first; any pack works. */
const PREFERRED_PACK = 'naruto';

function firstPack(): string {
  const packs = packChoices();
  return (packs.find((p) => p.id === PREFERRED_PACK) ?? packs[0])?.id ?? '';
}

/** Undoing every change in a world loses them all, so it asks first. */
function ResetWorld({ name, onReset }: { readonly name: string; readonly onReset: () => void }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        className="btn ghost small"
        onClick={() => {
          setAsking(true);
        }}
      >
        Reset every fighter
      </button>
    );
  }
  return (
    <div className="menu-confirm" role="group" aria-label="Reset every fighter?">
      <p>Put every fighter in {name} back as the world writes them?</p>
      <div className="row-buttons">
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            onReset();
            setAsking(false);
          }}
        >
          Reset them all
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAsking(false);
          }}
        >
          Keep the changes
        </button>
      </div>
    </div>
  );
}

/** The world whose fighters are edited, when there is more than one. */
function WorldPicker({
  packs,
  packId,
  onPick,
}: {
  readonly packs: readonly { readonly id: string; readonly name: string }[];
  readonly packId: string;
  readonly onPick: (packId: string) => void;
}) {
  if (packs.length < 2) return null;
  return (
    <section className="versus-slot">
      <label htmlFor="editor-world">World</label>
      <select
        id="editor-world"
        value={packId}
        onChange={(e) => {
          onPick(e.target.value);
        }}
      >
        {packs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </section>
  );
}

/**
 * The editor: pick a world and a fighter, then change their stats and what they fight with.
 * Changes are kept on the device and used at once in versus and by every new game; a game
 * already under way keeps the world it began with. On a desk the list, the fighter's stats and
 * their techniques fill the window side by side; on a phone the sheet takes the page.
 */
export function EditorScreen({ onBack }: { readonly onBack: () => void }) {
  const packs = useMemo(() => packChoices(), []);
  const [packId, setPackId] = useState(firstPack);
  const { editsFor, change } = useEdits();
  const edits = editsFor(packId);
  const ctx = useMemo(() => contextForPack(packId, edits), [packId, edits]);
  const [filter, setFilter] = useState<VersusFilter>(OPEN_FILTER);
  const [focusId, setFocusId] = useState<string | null>(null);
  const wide = useWideScreen();
  const roster = useMemo(() => (ctx ? editorRoster(ctx) : []), [ctx]);
  // On a desk the sheet is never blank: it opens on the first fighter until another is picked.
  const shownId = focusId ?? (wide ? (roster[0]?.id ?? null) : null);
  const editor = useMemo(
    () => (ctx && shownId ? fighterEditor(ctx, shownId) : null),
    [ctx, shownId],
  );
  if (!ctx) return null;
  const packName = packs.find((p) => p.id === packId)?.name ?? packId;
  const edited = new Set(roster.filter((f) => f.edited).map((f) => f.id));

  const list = (
    <RosterBrowser
      roster={roster}
      filter={filter}
      onFilter={setFilter}
      focusedId={shownId}
      stampOf={(id) => (edited.has(id) ? 'Edited' : null)}
      onFocus={setFocusId}
    />
  );
  const sheet = editor && (
    <FighterEditorSheet
      editor={editor}
      onStat={(stat, value) => {
        change(packId, editStat(ctx, editor.fighter.id, stat, value));
      }}
      onTechniques={(ids) => {
        change(packId, editTechniques(ctx, editor.fighter.id, ids));
      }}
      onReset={() => {
        change(packId, resetFighter(edits, editor.fighter.id));
      }}
      {...(wide
        ? {}
        : {
            onBack: () => {
              setFocusId(null);
            },
          })}
    />
  );

  return (
    <main className={wide ? 'editor-screen wide' : 'editor-screen'}>
      <header>
        <button type="button" className="btn ghost small" onClick={onBack}>
          Main menu
        </button>
        <h1>Editor</h1>
        <p className="muted">
          Changes are used at once in versus and by every new game. A game already under way keeps
          the world it began with.
        </p>
        <WorldPicker
          packs={packs}
          packId={packId}
          onPick={(id) => {
            setPackId(id);
            setFocusId(null);
          }}
        />
        {hasEdits(edits) && (
          <ResetWorld
            name={packName}
            onReset={() => {
              change(packId, NO_EDITS);
            }}
          />
        )}
      </header>
      {wide ? (
        <div className="editor-desk">
          {list}
          <div className="versus-pane">
            {sheet ?? <p className="muted">Pick a fighter from the list to edit them here.</p>}
          </div>
        </div>
      ) : (
        (sheet ?? list)
      )}
    </main>
  );
}
