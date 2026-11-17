import {
  fileView,
  notesPage,
  techniquesPage,
  type CreationDraft,
  type CreationView,
  type GameContext,
} from '@/game';

import { Portrait } from '../../art/Portrait';

/**
 * The academy file on a desk: beside the page, the student as they stand (their face, name,
 * standing, the academy's marks and the techniques chosen), so every change on the page shows
 * at once, and the file's pages, any already turned open to go back to. The rail tells only what
 * the file has said by the page you're on: nothing before the record is read.
 */

export interface FilePage {
  readonly id: string;
  readonly title: string;
}

/** What the rail shows of the student: only what the file has said by this page. */
export interface RailShows {
  /** Their face, name and standing: from the student record on. */
  readonly student: boolean;
  /** The academy's marks and fighting grade: from the training record on. */
  readonly marks: boolean;
  /** The techniques chosen: from their page on. */
  readonly taught: boolean;
  /** The room left for special notes: on their page. */
  readonly notes: boolean;
}

/** What the rail tells by page `index` of the file's pages (by their ids). */
export function railShows(pages: readonly string[], index: number): RailShows {
  const past = (id: string) => {
    const at = pages.indexOf(id);
    return at !== -1 && index >= at;
  };
  return {
    student: past('record'),
    marks: past('file'),
    taught: past('jutsu'),
    notes: pages[index] === 'notes',
  };
}

interface StudentProps {
  readonly draft: CreationDraft;
  readonly view: CreationView;
  readonly ctx: GameContext;
  readonly shows: RailShows;
}

interface FileRailProps extends StudentProps {
  readonly pages: readonly FilePage[];
  readonly index: number;
  /** The furthest page turned to: any page up to it may be opened again. */
  readonly reached: number;
  readonly onOpen: (index: number) => void;
}

const ART: Readonly<Record<string, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function EmptyFile() {
  return (
    <section className="rail-student" aria-label="The student on the file">
      <div className="rail-head">
        <span className="rail-blank" aria-hidden="true">
          忍
        </span>
        <div>
          <b className="rail-name">A file not yet read</b>
          <span className="muted">Break in and find it first.</span>
        </div>
      </div>
    </section>
  );
}

/** The academy's marks in each art, with the fighting grade they add up to. */
function Marks({ draft, ctx }: Pick<StudentProps, 'draft' | 'ctx'>) {
  const file = fileView(draft, ctx);
  return (
    <div className="rail-marks">
      <h3 className="rail-label">
        Academy marks, fighting grade{' '}
        <span className="badge" data-grade={file.fighting.grade}>
          {file.fighting.grade}
        </span>
      </h3>
      <dl className="rail-card">
        {file.reportCard.map((r) => (
          <div key={r.discipline}>
            <dt>{ART[r.discipline] ?? r.discipline}</dt>
            <dd className="rail-letter">{r.grade}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The room left for special notes, as their page counts it, kept in view while picking. */
function NotesRoom({ draft, ctx }: Pick<StudentProps, 'draft' | 'ctx'>) {
  const page = notesPage(draft, ctx);
  return (
    <div className="rail-room">
      <h3 className="rail-label">Room for notes</h3>
      <span className="note-slots">
        {page.slots.map((slot, i) => (
          <span key={`${slot.label}-${String(i)}`} className={`note-slot ${slot.kind}`}>
            {slot.label}
          </span>
        ))}
      </span>
    </div>
  );
}

function StudentCard({ draft, view, ctx, shows }: StudentProps) {
  if (!shows.student) return <EmptyFile />;
  const standing = view.standings.find((s) => s.id === draft.standing)?.name ?? '';
  const chosen = shows.taught ? techniquesPage(draft, ctx).chosen : [];
  const name = [draft.name.trim(), draft.familyName.trim()].filter(Boolean).join(' ');
  return (
    <section className="rail-student" aria-label="The student on the file">
      <div className="rail-head">
        <Portrait appearance={draft.appearance} size={72} />
        <div>
          <b className="rail-name">{name || 'A name not yet written'}</b>
          <span className="muted">{standing}</span>
        </div>
      </div>
      {shows.marks && <Marks draft={draft} ctx={ctx} />}
      {shows.notes && <NotesRoom draft={draft} ctx={ctx} />}
      {chosen.length > 0 && (
        <p className="rail-taught">
          <span className="muted">Techniques chosen: </span>
          {chosen.map((c) => c.name).join(', ')}
        </p>
      )}
    </section>
  );
}

function pageClass(i: number, index: number, reached: number): string {
  if (i === index) return 'rail-page current';
  return i <= reached ? 'rail-page open' : 'rail-page';
}

export function FileRail(props: FileRailProps) {
  const { pages, index, reached, onOpen } = props;
  return (
    <aside className="file-rail">
      <StudentCard draft={props.draft} view={props.view} ctx={props.ctx} shows={props.shows} />
      <nav aria-label="The file’s pages">
        <ol className="rail-pages">
          {pages.map((page, i) => (
            <li key={page.id}>
              <button
                type="button"
                className={pageClass(i, index, reached)}
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
