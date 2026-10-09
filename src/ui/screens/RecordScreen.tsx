import { useEffect, useRef } from 'react';

import { recordView } from '@/game';

import { Chips } from '../components/Chips';
import type { ScreenProps } from './types';

/** The record: everything that happened, as a story feed. Opens scrolled to the latest. */
export function RecordScreen({ state }: ScreenProps) {
  const days = recordView(state);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, []);
  return (
    <>
      <header className="plain-head">
        <h1>Record</h1>
      </header>
      <main className="page feed">
        {days.map((day) => (
          <section key={day.date} className="feed-day">
            <p className="divider">{day.date}</p>
            {day.lines.map((line) => (
              <article key={line.id} className={`entry tone-${line.tone}`}>
                {line.heading && <p className="you">{line.heading}</p>}
                <p className="story">{line.text}</p>
                <Chips chips={line.chips} />
              </article>
            ))}
          </section>
        ))}
        <div ref={end} />
      </main>
    </>
  );
}
