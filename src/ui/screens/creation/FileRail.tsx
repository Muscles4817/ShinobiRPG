import {
  fileView,
  techniquesPage,
  type CreationDraft,
  type CreationView,
  type GameContext,
} from '@/game';

import { Portrait } from '../../art/Portrait';

/**
 * The academy file on a desk: beside the page, the student as they stand (their face, name,
 * standing, fighting grade, the report card and the techniques chosen), so every change on the
 * page shows at once, and the file's pages, any already turned open to go back to.
 */

export interface FilePage {
  readonly id: string;
  readonly title: string;
}

interface FileRailProps {
  readonly pages: readonly FilePage[];
  readonly index: number;
  /** The furthest page turned to: any page up to it may be opened again. */
  readonly reached: number;
  readonly onOpen: (index: number) => void;
  readonly draft: CreationDraft;
  readonly view: CreationView;
  readonly ctx: GameContext;
}

const ART: Readonly<Record<string, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function StudentCard({
  draft,
  view,
  ctx,
}: Omit<FileRailProps, 'pages' | 'index' | 'reached' | 'onOpen'>) {
  const file = fileView(draft, ctx);
  const standing = view.standings.find((s) => s.id === draft.standing)?.name ?? '';
  const chosen = techniquesPage(draft, ctx).chosen;
  const name = [draft.name.trim(), draft.familyName.trim()].filter(Boolean).join(' ');
  return (
    <section className="rail-student" aria-label="The student on the file">
      <div className="rail-head">
        <Portrait appearance={draft.appearance} size={84} />
        <div>
          <b className="rail-name">{name || 'A name not yet written'}</b>
          <span className="muted">{standing}</span>
          <span className="rail-grade">
            Fighting grade{' '}
            <span className="badge" data-grade={file.fighting.grade}>
              {file.fighting.grade}
            </span>
          </span>
        </div>
      </div>
      <dl className="rail-card">
        {file.reportCard.map((r) => (
          <div key={r.discipline}>
            <dt>{ART[r.discipline] ?? r.discipline}</dt>
            <dd className="rail-letter">{r.grade}</dd>
          </div>
        ))}
      </dl>
      {chosen.length > 0 && (
        <p className="rail-taught">
          <span className="muted">Taught beyond the basics: </span>
          {chosen.map((c) => c.name).join(', ')}
        </p>
      )}
    </section>
  );
}

export function FileRail(props: FileRailProps) {
  const { pages, index, reached, onOpen } = props;
  return (
    <aside className="file-rail">
      <StudentCard draft={props.draft} view={props.view} ctx={props.ctx} />
      <nav aria-label="The file’s pages">
        <ol className="rail-pages">
          {pages.map((page, i) => (
            <li key={page.id}>
              <button
                type="button"
                className={
                  i === index
                    ? 'rail-page current'
                    : i < reached || i === reached
                      ? 'rail-page open'
                      : 'rail-page'
                }
                aria-current={i === index ? 'step' : undefined}
                disabled={i > reached || i === index}
                onClick={() => {
                  onOpen(i);
                }}
              >
                <span className="rail-tick" aria-hidden="true">
                  {i < index ? '済' : String(i + 1)}
                </span>
                {page.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
