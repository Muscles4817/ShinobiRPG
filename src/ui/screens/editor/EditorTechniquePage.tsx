import type { EditorTechniquePage as Page } from '@/game';

import { DISCIPLINE_LABELS } from '../../components/JutsuDetail';
import { TechniqueSheet } from '../../components/TechniqueSheet';

/**
 * A technique's page in the fighter editor: what it is and its sheet in this fighter's hands,
 * with adding or removing it beside what it says, so nobody is given a technique by its name
 * alone.
 */
export function EditorTechniquePage({
  page,
  canRemove,
  onAdd,
  onRemove,
  onClose,
}: {
  readonly page: Page;
  readonly canRemove: boolean;
  readonly onAdd: () => void;
  readonly onRemove: () => void;
  readonly onClose: () => void;
}) {
  return (
    <section className="detail-card editor-page" aria-label={`Technique: ${page.name}`}>
      <b>
        {page.name}{' '}
        <span className={`badge d-${page.discipline}`}>{DISCIPLINE_LABELS[page.discipline]}</span>
        <span className="badge" data-grade={page.rank}>
          Rank {page.rank}
        </span>
        {page.made && <span className="badge">Made</span>}
        {page.element && <span className="chip"> {page.element}</span>}
      </b>
      <p className="story">{page.description}</p>
      {page.unused && <p className="muted small">{page.unused}</p>}
      <TechniqueSheet sheet={page.sheet} hands={page.hands} />
      <div className="row-buttons">
        {page.held ? (
          <button
            type="button"
            className="btn ghost small"
            disabled={!canRemove}
            onClick={onRemove}
          >
            Remove {page.name}
          </button>
        ) : (
          <button type="button" className="btn small" onClick={onAdd}>
            Add {page.name}
          </button>
        )}
        <button type="button" className="btn ghost small" onClick={onClose}>
          Close
        </button>
      </div>
    </section>
  );
}
