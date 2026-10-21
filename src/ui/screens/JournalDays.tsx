import { useEffect, useRef, useState } from 'react';

import type { RecordDay } from '@/game';

/**
 * The journal's days on a desk: a list beside the feed, the day you are reading marked as you
 * scroll, and a click taking you to a day. The phone has no room for it and reads straight down.
 */

/** How far down the window a day must start to be the one being read (below the header). */
const READING_LINE = 160;

/** The id of a day's section in the feed, for the list to jump to. */
export function dayAnchor(index: number): string {
  return `record-day-${index}`;
}

function entriesLine(count: number): string {
  return count === 1 ? 'One entry' : `${count} entries`;
}

/** The last day that starts above the reading line, or the last of all at the foot of the page. */
function dayAt(count: number): number {
  const foot = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (foot) return count - 1;
  let at = 0;
  for (let i = 0; i < count; i++) {
    const top = document.getElementById(dayAnchor(i))?.getBoundingClientRect().top;
    if (top !== undefined && top <= READING_LINE) at = i;
  }
  return at;
}

/** Follows which day of the feed is being read as the window scrolls. */
function useDayInView(days: readonly RecordDay[]): number {
  const [current, setCurrent] = useState(days.length - 1);
  useEffect(() => {
    const follow = () => {
      setCurrent(dayAt(days.length));
    };
    window.addEventListener('scroll', follow, { passive: true });
    return () => {
      window.removeEventListener('scroll', follow);
    };
  }, [days.length]);
  return current;
}

export function JournalDays({ days }: { readonly days: readonly RecordDay[] }) {
  const current = useDayInView(days);
  const list = useRef<HTMLOListElement>(null);
  // The feed opens on the latest day, so the list does too.
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  return (
    <nav className="journal-days" aria-label="Days">
      <h2>Days</h2>
      <ol ref={list}>
        {days.map((day, i) => (
          <li key={day.date}>
            <button
              type="button"
              className={i === current ? 'journal-day on' : 'journal-day'}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => {
                document.getElementById(dayAnchor(i))?.scrollIntoView({ block: 'start' });
              }}
            >
              <span>{day.date}</span>
              <small>{entriesLine(day.lines.length)}</small>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
