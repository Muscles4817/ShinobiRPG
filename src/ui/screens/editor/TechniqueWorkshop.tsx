import { useMemo, useState } from 'react';

import {
  BLANK_DRAFT,
  dropTechnique,
  forgeView,
  keepTechnique,
  madeShelf,
  madeDraft,
  type ContentEdits,
  type GameContext,
  type MadeShelfItem,
  type TechniqueDraft,
} from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import { ForgePreview } from './ForgePreview';
import { TechniqueForge } from './TechniqueForge';

/**
 * Techniques made in the editor: the shelf of those kept and the forge where one is made or
 * changed, read beside it as the game will read it. On a desk the three stand side by side and
 * the forge is never blank (it opens on a new technique); on a phone the shelf comes first.
 */

interface Open {
  /** The kept technique being changed; null for a new one. */
  readonly id: string | null;
  readonly draft: TechniqueDraft;
}

const NEW: Open = { id: null, draft: BLANK_DRAFT };

function givenLine(item: MadeShelfItem): string {
  const given =
    item.givenTo.length > 0 ? `Given to ${item.givenTo.join(', ')}` : 'Given to no one yet';
  return item.taughtAt ? `${given}, and taught in the village` : given;
}

function Shelf({
  shelf,
  openId,
  onOpen,
}: {
  readonly shelf: readonly MadeShelfItem[];
  readonly openId: string | null;
  readonly onOpen: (id: string | null) => void;
}) {
  return (
    <section className="forge-shelf" aria-label="Techniques made">
      <button
        type="button"
        className="btn primary"
        onClick={() => {
          onOpen(null);
        }}
      >
        New technique
      </button>
      {shelf.length === 0 ? (
        <p className="muted">
          Nothing made yet. A technique made here can be given to any fighter on the Fighters page.
        </p>
      ) : (
        <ul>
          {shelf.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="forge-shelf-item"
                aria-pressed={item.id === openId}
                aria-label={`${item.name}, ${givenLine(item)}`}
                onClick={() => {
                  onOpen(item.id);
                }}
              >
                <TechniqueCard
                  name={item.name}
                  detail={givenLine(item)}
                  discipline={item.discipline}
                  rank={item.rank}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function savedDraft(ctx: GameContext, id: string | null): TechniqueDraft {
  return (id ? madeDraft(ctx.edits, id) : null) ?? BLANK_DRAFT;
}

export function TechniqueWorkshop({
  ctx,
  wide,
  onEdits,
}: {
  readonly ctx: GameContext;
  readonly wide: boolean;
  readonly onEdits: (edits: ContentEdits) => void;
}) {
  const [open, setOpen] = useState<Open | null>(null);
  const shelf = useMemo(() => madeShelf(ctx), [ctx]);
  // On a desk the forge is never blank: it opens on a new technique until one is picked.
  const shown = open ?? (wide ? NEW : null);
  const view = useMemo(() => (shown ? forgeView(ctx, shown.draft) : null), [ctx, shown]);
  const openOne = (id: string | null) => {
    setOpen({ id, draft: savedDraft(ctx, id) });
  };
  const list = <Shelf shelf={shelf} openId={shown?.id ?? null} onOpen={openOne} />;
  if (!shown || !view) return list;

  const saved = savedDraft(ctx, shown.id);
  const changed = JSON.stringify(saved) !== JSON.stringify(shown.draft);
  const forge = (
    <div className="forge-desk">
      {!wide && (
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setOpen(null);
          }}
        >
          Back to the techniques made
        </button>
      )}
      <TechniqueForge
        draft={shown.draft}
        onChange={(draft) => {
          setOpen({ id: shown.id, draft });
        }}
      />
      <ForgePreview
        view={view}
        actions={{
          onKeep:
            changed || shown.id === null
              ? () => {
                  const kept = keepTechnique(ctx, shown.draft, shown.id);
                  if (!kept) return;
                  onEdits(kept.edits);
                  // What was kept, read back: defaults the form held are dropped on keeping.
                  const back = madeDraft(kept.edits, kept.id) ?? shown.draft;
                  setOpen({ id: kept.id, draft: back });
                }
              : null,
          onDiscard: changed
            ? () => {
                setOpen({ id: shown.id, draft: saved });
              }
            : null,
          onDrop: shown.id
            ? () => {
                onEdits(dropTechnique(ctx.edits, shown.id ?? ''));
                setOpen(null);
              }
            : null,
          givenTo: shelf.find((s) => s.id === shown.id)?.givenTo ?? [],
        }}
      />
    </div>
  );
  return wide ? (
    <div className="editor-desk forge-layout">
      {list}
      {forge}
    </div>
  ) : (
    forge
  );
}
