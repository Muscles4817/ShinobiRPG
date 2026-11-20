import { useMemo, useState } from 'react';

import {
  contextForPack,
  editorRoster,
  editorTechniquePage,
  editStat,
  editTechniques,
  fighterEditor,
  OPEN_FILTER,
  packChoices,
  resetFighter,
  resetFighters,
  type GameContext,
  type VersusFilter,
} from '@/game';

import { useEdits } from '../../edits/EditsProvider';
import { useWideScreen } from '../../layout/useWideScreen';
import { RosterBrowser } from '../versus/RosterBrowser';
import { ResetWorld, WorldPicker } from './EditorHeader';
import { FighterEditorSheet } from './FighterEditorSheet';
import { TechniqueWorkshop } from './TechniqueWorkshop';

/** The fan pack is the one built for versus play, so it opens first; any pack works. */
const PREFERRED_PACK = 'naruto';

function firstPack(): string {
  const packs = packChoices();
  return (packs.find((p) => p.id === PREFERRED_PACK) ?? packs[0])?.id ?? '';
}

/** What the editor is working on: the world's fighters, or techniques made for it. */
const PAGES = [
  { id: 'fighters', label: 'Fighters' },
  { id: 'techniques', label: 'Techniques' },
] as const;
type Page = (typeof PAGES)[number]['id'];

function PageSwitch({ page, onPick }: { readonly page: Page; readonly onPick: (p: Page) => void }) {
  return (
    <div className="editor-pages" role="group" aria-label="Edit">
      {PAGES.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={p.id === page}
          className={p.id === page ? 'btn small' : 'btn ghost small'}
          onClick={() => {
            onPick(p.id);
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

interface FightersProps {
  readonly ctx: GameContext;
  readonly packId: string;
  readonly wide: boolean;
}

/** The world's fighters: the roster, and the sheet of whoever is picked. */
function FightersPage({ ctx, packId, wide }: FightersProps) {
  const { change } = useEdits();
  const [filter, setFilter] = useState<VersusFilter>(OPEN_FILTER);
  const [focusId, setFocusId] = useState<string | null>(null);
  const roster = useMemo(() => editorRoster(ctx), [ctx]);
  // On a desk the sheet is never blank: it opens on the first fighter until another is picked.
  const shownId = focusId ?? (wide ? (roster[0]?.id ?? null) : null);
  const editor = useMemo(() => (shownId ? fighterEditor(ctx, shownId) : null), [ctx, shownId]);
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
        change(packId, resetFighter(ctx.edits, editor.fighter.id));
      }}
      pageOf={(techniqueId) => editorTechniquePage(ctx, editor.fighter.id, techniqueId)}
      {...(wide
        ? {}
        : {
            onBack: () => {
              setFocusId(null);
            },
          })}
    />
  );
  if (!wide) return sheet ?? list;
  return (
    <div className="editor-desk">
      {list}
      <div className="versus-pane">
        {sheet ?? <p className="muted">Pick a fighter from the list to edit them here.</p>}
      </div>
    </div>
  );
}

/**
 * The editor: pick a world, then change its fighters' stats and what they fight with, or make
 * techniques of your own for them. Changes are kept on the device and used at once in versus
 * and by every new game; a game already under way keeps the world it began with. On a desk the
 * panes fill the window side by side; on a phone each takes the page in turn.
 */
export function EditorScreen({ onBack }: { readonly onBack: () => void }) {
  const packs = useMemo(() => packChoices(), []);
  const [packId, setPackId] = useState(firstPack);
  const [page, setPage] = useState<Page>('fighters');
  const { editsFor, change } = useEdits();
  const edits = editsFor(packId);
  const ctx = useMemo(() => contextForPack(packId, edits), [packId, edits]);
  const wide = useWideScreen();
  if (!ctx) return null;
  const packName = packs.find((p) => p.id === packId)?.name ?? packId;

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
        <WorldPicker packs={packs} packId={packId} onPick={setPackId} />
        <PageSwitch page={page} onPick={setPage} />
        {page === 'fighters' && Object.keys(edits.fighters).length > 0 && (
          <ResetWorld
            name={packName}
            onReset={() => {
              change(packId, resetFighters(edits));
            }}
          />
        )}
      </header>
      {page === 'fighters' ? (
        <FightersPage key={packId} ctx={ctx} packId={packId} wide={wide} />
      ) : (
        <TechniqueWorkshop
          key={packId}
          ctx={ctx}
          wide={wide}
          onEdits={(next) => {
            change(packId, next);
          }}
        />
      )}
    </main>
  );
}
