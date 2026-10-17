import {
  fileReadBack,
  notesPage,
  quirkCards,
  toggledNotes,
  type GameContext,
  type NoteCard,
} from '@/game';

import type { StepProps } from './types';

interface ContextStepProps extends StepProps {
  readonly ctx: GameContext;
}

const WEIGHT_STAMP: Readonly<Record<NoteCard['weight'], string>> = {
  major: 'Major',
  minor: 'Minor',
  flaw: 'Flaw: makes room',
};

function NoteOption({
  note,
  onToggle,
}: {
  readonly note: NoteCard;
  readonly onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`opt-card note-card${note.selected ? ' selected' : ''}`}
      aria-pressed={note.selected}
      disabled={note.blocker !== null}
      onClick={onToggle}
    >
      <b>{note.name}</b>
      <span className={`note-weight ${note.weight}`}>{WEIGHT_STAMP[note.weight]}</span>
      <span className="opt-desc">{note.description}</span>
      {note.effects.length > 0 && (
        <span className="chips">
          {note.effects.map((e) => (
            <span key={e.label} className={`chip ${e.tone}`}>
              {e.label}
            </span>
          ))}
        </span>
      )}
      {note.blocker && <small className="note-why">{note.blocker}</small>}
    </button>
  );
}

/** Special notes: as many as your standing's room carries, each weighed. */
export function NotesStep({ draft, update, ctx }: ContextStepProps) {
  const page = notesPage(draft, ctx);
  return (
    <div className="step">
      <div className="note-room">
        <p>{page.allowance}</p>
        <span className="note-slots" aria-label="Room on your file">
          {page.slots.map((slot, i) => (
            <span key={`${slot.label}-${String(i)}`} className={`note-slot ${slot.kind}`}>
              {slot.label}
            </span>
          ))}
        </span>
        <small>Take more and the game is easier; leave room empty and it’s harder.</small>
      </div>
      {page.groups.map((group) => (
        <section key={group.heading} className="opt-list">
          <h3 className="note-group">{group.heading}</h3>
          {group.notes.map((note) => (
            <NoteOption
              key={note.id}
              note={note}
              onToggle={() => {
                update({ talentIds: toggledNotes(draft, note.id, ctx) });
              }}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

/** Habits people notice: free, as many as fit. */
export function QuirksStep({ draft, update, ctx }: ContextStepProps) {
  const toggle = (id: string) => {
    const has = draft.quirkIds.includes(id);
    update({ quirkIds: has ? draft.quirkIds.filter((q) => q !== id) : [...draft.quirkIds, id] });
  };
  return (
    <div className="step opt-list">
      <p className="muted small">
        Small habits, free to take, as many as fit. They change nothing in a fight, only how fast
        people warm to you, by their own tastes.
      </p>
      {quirkCards(draft, ctx).map((q) => (
        <button
          key={q.id}
          type="button"
          className={`opt-card${q.selected ? ' selected' : ''}`}
          aria-pressed={q.selected}
          onClick={() => {
            toggle(q.id);
          }}
        >
          <b>{q.name}</b>
          <span className="opt-desc">{q.description}</span>
          <span className="quirk-who">
            {q.warms && <span className="warms">{q.warms}</span>}{' '}
            {q.cools && <span className="cools">{q.cools}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function ReadList({
  heading,
  lines,
}: {
  readonly heading: string;
  readonly lines: readonly string[];
}) {
  return (
    <>
      <h3>{heading}</h3>
      <ul>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </>
  );
}

/** Everything chosen, read back in words: how hard the road looks, and why. */
export function ReadBackStep({ draft, ctx }: ContextStepProps) {
  const read = fileReadBack(draft, ctx);
  return (
    <div className="step read-back">
      <p className="muted small">
        Everything you chose, put together the way the instructors would read it.
      </p>
      <h3>How the road looks</h3>
      <ol className="road-scale">
        {read.road.steps.map((step, i) => (
          <li key={step} className={i === read.road.at ? 'on' : undefined}>
            {step}
          </li>
        ))}
      </ol>
      <p className="story">{read.verdict}</p>
      <p className="muted small">{read.note}</p>
      <ReadList heading="What comes easy" lines={read.easy} />
      <ReadList heading="What comes hard" lines={read.hard} />
      <ReadList heading="What people will think" lines={read.people} />
      <ReadList heading="Where it stops" lines={read.limits} />
    </div>
  );
}
