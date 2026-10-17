import type { ClassHonoursView, Classmate } from '@/game';

import { Portrait } from '../../art/Portrait';

/** One name read out: the face, the name and what they were, and the honour. */
function HonourRow({ title, who }: { readonly title: string; readonly who: Classmate }) {
  return (
    <div className={who.you ? 'honour you' : 'honour'}>
      <span className="honour-face">
        <Portrait appearance={who.appearance} size={40} framing="face" />
      </span>
      <span className="honour-who">
        <b>{who.you ? `${who.name} (you)` : who.name}</b>
        <small>{who.note}</small>
      </span>
      <span className="honour-title">{title}</span>
    </div>
  );
}

interface ClassHonoursProps {
  readonly view: ClassHonoursView;
  readonly onTeams: () => void;
}

/**
 * Graduation day, before the teams: the year's honours read out, then the whole year as it
 * stood, you among them.
 */
export function ClassHonours({ view, onTeams }: ClassHonoursProps) {
  return (
    <>
      <header className="scene-head">
        <p className="label">The academy hall, graduation day</p>
        <h1>The year’s honours</h1>
      </header>
      <main className="page feed">
        <p className="story enter">{view.year}</p>
        <section className="honours" aria-label="Honours">
          <h2>Honours</h2>
          {view.honours.map((h) => (
            <HonourRow key={`${h.title}-${h.who.id}`} title={h.title} who={h.who} />
          ))}
          <h2>The year, as it stood</h2>
          <ol className="year-roll">
            {view.roll.map((c) => (
              <li key={c.id} className={c.you ? 'you' : undefined}>
                <Portrait appearance={c.appearance} size={38} framing="face" />
                <b>{c.place}</b>
                <span>{c.you ? 'You' : c.name}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <nav className="choices" aria-label="Choices">
        <button type="button" className="choice primary" onClick={onTeams}>
          <b>Hear the teams</b>
        </button>
      </nav>
    </>
  );
}
