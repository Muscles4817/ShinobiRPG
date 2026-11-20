import { Fragment, useState, type ReactNode } from 'react';

import type { Discipline, EditorTechnique, EditorTechniquePage as Page } from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import { useHoverPreview } from '../../layout/useHoverPreview';
import { useWideScreen } from '../../layout/useWideScreen';
import { EditorTechniquePage } from './EditorTechniquePage';
import { TechniqueFinder } from './TechniqueFinder';

const ART_LABEL: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function detailOf(t: EditorTechnique): string {
  return t.ready ? ART_LABEL[t.discipline] : 'Beyond their grades: unused until they grow into it';
}

interface TechniqueEditorProps {
  readonly techniques: readonly EditorTechnique[];
  readonly choices: readonly EditorTechnique[];
  readonly onChange: (ids: readonly string[]) => void;
  /** A technique's page in this fighter's hands. */
  readonly pageOf: (techniqueId: string) => Page | null;
}

/**
 * What they fight with, each removable (never the last), then what could be added. Any card
 * opens its technique's page: on a desk at the head of the column, following the pointer; on a
 * phone in the list, under the card.
 */
export function TechniqueEditor({ techniques, choices, onChange, pageOf }: TechniqueEditorProps) {
  const ids = techniques.map((t) => t.id);
  const wide = useWideScreen();
  const hover = useHoverPreview();
  const [openId, setOpenId] = useState<string | null>(null);
  const shownId = hover.previewId ?? openId;
  const page = shownId ? pageOf(shownId) : null;
  const add = (id: string) => {
    onChange([...ids, id]);
  };
  const remove = (id: string) => {
    onChange(ids.filter((t) => t !== id));
  };

  const pageCard = page && (
    <EditorTechniquePage
      page={page}
      canRemove={ids.length > 1}
      onAdd={() => {
        add(page.id);
      }}
      onRemove={() => {
        remove(page.id);
      }}
      onClose={() => {
        setOpenId(null);
        hover.clear();
      }}
    />
  );

  /** A card that opens its page, its quick button, and on a phone its page under it. */
  const item = (t: EditorTechnique, button: ReactNode) => (
    <Fragment key={t.id}>
      <li>
        <button
          type="button"
          className="editor-card"
          aria-pressed={t.id === openId}
          aria-label={`Read ${t.name}`}
          onClick={() => {
            setOpenId(t.id === openId ? null : t.id);
          }}
          {...hover.handlersFor(t.id)}
        >
          <TechniqueCard
            name={t.name}
            detail={detailOf(t)}
            discipline={t.discipline}
            rank={t.rank}
            ghost={!t.ready}
            {...(t.made ? { stamp: 'Made' } : {})}
          />
        </button>
        {button}
      </li>
      {!wide && t.id === openId && pageCard && <li className="editor-page-row">{pageCard}</li>}
    </Fragment>
  );

  return (
    <section className="editor-techniques">
      {wide && (
        <div className="editor-page-slot">
          {pageCard ?? <p className="muted">Point at a technique to read its page here.</p>}
        </div>
      )}
      <h3>Fights with ({techniques.length})</h3>
      <ul>
        {techniques.map((t) =>
          item(
            t,
            <button
              type="button"
              className="btn ghost small"
              aria-label={`Remove ${t.name}`}
              disabled={ids.length <= 1}
              onClick={() => {
                remove(t.id);
              }}
            >
              Remove
            </button>,
          ),
        )}
      </ul>
      {ids.length <= 1 && <p className="muted">Everyone keeps at least one technique.</p>}
      <h3>Add a technique</h3>
      <TechniqueFinder choices={choices}>
        {(shown) => (
          <ul>
            {shown.map((t) =>
              item(
                t,
                <button
                  type="button"
                  className="btn small"
                  aria-label={`Add ${t.name}`}
                  onClick={() => {
                    add(t.id);
                  }}
                >
                  Add
                </button>,
              ),
            )}
          </ul>
        )}
      </TechniqueFinder>
    </section>
  );
}
