import { useEffect, useRef, useState } from 'react';

import { recordView, type RecordDay } from '@/game';

import { Chips } from '../components/Chips';
import { useWideScreen } from '../layout/useWideScreen';
import { FieldBook } from './FieldBook';
import { dayAnchor, JournalDays } from './JournalDays';
import type { ScreenProps } from './types';

/**
 * The record: the journal of everything that happened, by day (opens scrolled to the latest),
 * and the field book of what you have found and fought out in the world. On a desk the journal's
 * days are listed beside it.
 */

const BOOKS = [
  { id: 'journal', label: 'Journal' },
  { id: 'field', label: 'Field book' },
] as const;
type Book = (typeof BOOKS)[number]['id'];

function Journal({ days }: { readonly days: readonly RecordDay[] }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, []);
  return (
    <main className="page feed">
      {days.map((day, i) => (
        <section key={day.date} id={dayAnchor(i)} data-day={i} className="feed-day">
          <p className="divider">{day.date}</p>
          {day.lines.map((line) => (
            <article key={line.id} className={`entry tone-${line.tone}`}>
              {line.heading && <h3 className="entry-head">{line.heading}</h3>}
              <p className="story">{line.text}</p>
              <Chips chips={line.chips} />
            </article>
          ))}
        </section>
      ))}
      <div ref={end} />
    </main>
  );
}

export function RecordScreen({ state, ctx }: ScreenProps) {
  const [book, setBook] = useState<Book>('journal');
  const wide = useWideScreen();
  const days = recordView(state);
  return (
    <>
      <header className="plain-head record-head">
        <h1>Record</h1>
        <div className="record-books" role="tablist" aria-label="Books">
          {BOOKS.map((b) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === book}
              className={b.id === book ? 'record-book on' : 'record-book'}
              onClick={() => {
                setBook(b.id);
                // A desk's header stays in view while you read, so a new book opens at its top.
                if (wide) window.scrollTo(0, 0);
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </header>
      {book === 'journal' && wide && (
        <div className="record-desk">
          <JournalDays days={days} />
          <Journal days={days} />
        </div>
      )}
      {book === 'journal' && !wide && <Journal days={days} />}
      {book === 'field' && (
        <main className="page">
          <FieldBook ctx={ctx} state={state} />
        </main>
      )}
    </>
  );
}
