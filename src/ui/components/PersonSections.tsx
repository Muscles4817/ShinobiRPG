import type { ReactNode } from 'react';

import type { PersonSheet as Sheet } from '@/game';

import { BondMeter } from './BondMeter';
import { GradeBadge } from './Grade';
import { TechniqueCard } from './TechniqueCard';
import { ThreatChip } from './ThreatChip';

/**
 * The sections of someone's profile, each shown once you know them well enough to have it
 * (the view model decides: a section with nothing to show is null and folds away).
 */

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="profile-section" aria-label={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

/** Your stage, how far through it you are, and what the next one opens. */
export function BetweenYou({ p }: { readonly p: Sheet }) {
  const { path } = p;
  return (
    <Section title="Between you">
      <div className="profile-bond">
        <BondMeter stageName={path.name} progress={path.progress} />
        {path.next && <small>{path.next.name}</small>}
      </div>
      {path.next && path.next.opens.length > 0 && (
        <ul className="profile-opens">
          {path.next.opens.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {!path.next && <p className="profile-note">As close as two people get.</p>}
    </Section>
  );
}

/** Their traits, and what they like and dislike to hear, as you learn them. */
export function WhatTheyreLike({ p }: { readonly p: Sheet }) {
  return (
    <Section title={`What ${p.name} is like`}>
      {p.traits ? (
        <dl className="person-traits">
          {p.traits.map((t) => (
            <div key={t.name}>
              <dt>{t.name}</dt>
              <dd>{t.note}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="profile-note">Talk more to learn what they’re like.</p>
      )}
      {p.likes && p.dislikes ? (
        <p className="chips">
          {p.likes.map((t) => (
            <span key={t} className="chip gain">
              Likes {t.toLowerCase()}
            </span>
          ))}
          {p.dislikes.map((t) => (
            <span key={t} className="chip harm">
              Dislikes {t.toLowerCase()}
            </span>
          ))}
        </p>
      ) : (
        p.traits && <p className="profile-note">Become friends to learn what they like to hear.</p>
      )}
    </Section>
  );
}

/** Where they are at each time of day, now marked. */
export function TheirDay({ day }: { readonly day: NonNullable<Sheet['day']> }) {
  return (
    <Section title="Where to find them">
      <ol className="profile-day">
        {day.map((d) => (
          <li key={d.slot} className={d.now ? 'now' : undefined}>
            <small>{d.now ? `${d.slot}, now` : d.slot}</small>
            <span>{d.where}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** What they can do today, and what they're still growing into. */
export function TheirArts({ arts }: { readonly arts: NonNullable<Sheet['arts']> }) {
  return (
    <Section title="What they can do">
      {arts.doable.length > 0 ? (
        <div className="profile-cards">
          {arts.doable.map((a) => (
            <TechniqueCard
              key={a.id}
              name={a.name}
              detail={a.art}
              discipline={a.discipline}
              rank={a.rank}
            />
          ))}
        </div>
      ) : (
        <p className="profile-note">Nothing of their own yet.</p>
      )}
      {arts.growing.length > 0 && (
        <>
          <h4>Still growing into</h4>
          <div className="profile-cards">
            {arts.growing.map((a) => (
              <TechniqueCard
                key={a.id}
                name={a.name}
                detail={a.when}
                discipline={a.discipline}
                rank={a.rank}
                ghost
              />
            ))}
          </div>
          {arts.moreGrowing > 0 && (
            <p className="chips">
              <span className="chip">{arts.moreGrowing} more beyond these</span>
            </p>
          )}
          <p className="profile-note">They fight with these, and teach them, once they can.</p>
        </>
      )}
    </Section>
  );
}

/** Their next signature technique for you, or what holds it back. */
export function TheyTeach({ teaches }: { readonly teaches: NonNullable<Sheet['teaches']> }) {
  return (
    <Section title="What they’ll teach you">
      <p className="profile-teach">
        <b>{teaches.name}</b>
        {teaches.locked ? (
          <span className="blocker">{teaches.locked}</span>
        ) : (
          <span className="chip gain">
            {teaches.progress > 0 ? `Learning, ${Math.round(teaches.progress * 100)}%` : 'Next'}
          </span>
        )}
      </p>
    </Section>
  );
}

/** For a genin: the stats whose grade has risen since the academy. */
export function SinceTheAcademy({ growth }: { readonly growth: NonNullable<Sheet['growth']> }) {
  return (
    <Section title="Since the academy">
      {growth.length === 0 ? (
        <p className="profile-note">Much where they started. They train every day, as you do.</p>
      ) : (
        <ul className="profile-growth">
          {growth.map((g) => (
            <li key={g.stat}>
              <span>{g.stat}</span>
              <span className="profile-grades">
                <GradeBadge grade={g.from} />
                <span aria-label="to">→</span>
                <GradeBadge grade={g.to} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/** How a fight with them would go, read against you. */
export function SizingUp({ sizing }: { readonly sizing: NonNullable<Sheet['sizing']> }) {
  return (
    <Section title="Sizing them up">
      <p className="profile-teach">
        <ThreatChip threat={sizing.threat} label={sizing.label} />
        <span>{sizing.style}</span>
      </p>
    </Section>
  );
}

/** What a sensei carries, and the jobs you've shared. */
export function Remembered({ p }: { readonly p: Sheet }) {
  return (
    <>
      {p.carries && (
        <Section title="What they carry">
          <p>{p.carries}</p>
        </Section>
      )}
      {p.memories.length > 0 && (
        <Section title="You both remember">
          <ul className="profile-memories">
            {p.memories.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
