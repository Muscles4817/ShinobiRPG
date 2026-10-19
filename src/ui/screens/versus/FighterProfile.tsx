import type { ReactNode } from 'react';

import type { StatGroup, VersusProfile } from '@/game';

type ProfileStat = VersusProfile['stats'][number];

import { Portrait } from '../../art/Portrait';
import { GradeBadge } from '../../components/Grade';
import { TechniqueCard } from '../../components/TechniqueCard';
import { TechniqueSheet } from '../../components/TechniqueSheet';

const STAT_GROUPS: readonly { readonly group: StatGroup; readonly label: string }[] = [
  { group: 'body', label: 'Body' },
  { group: 'mind', label: 'Mind' },
  { group: 'discipline', label: 'Arts' },
];

function StatGrades({ stats }: { readonly stats: readonly ProfileStat[] }) {
  return (
    <div className="versus-stats">
      {STAT_GROUPS.map(({ group, label }) => (
        <section key={group}>
          <h4>{label}</h4>
          <dl>
            {stats
              .filter((s) => s.group === group)
              .map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>
                    <GradeBadge grade={s.grade} />
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/** A list under a heading, left out when there is nothing in it. */
function Listed({
  heading,
  items,
}: {
  readonly heading: string;
  readonly items: readonly string[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3>{heading}</h3>
      <ul className="versus-listed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

/** Who they are in a phrase: "Jōnin of Konohagakure, Hatake clan", or a foe's kind. */
function standingLine(profile: VersusProfile): string {
  const { fighter, specialty } = profile;
  const where = fighter.village ? ` of ${fighter.village}` : '';
  const clan = fighter.clan ? `, ${fighter.clan} clan` : '';
  const art = specialty ? `, a ${specialty.toLowerCase()} specialist` : '';
  return `${fighter.title}${where}${clan}${art}`;
}

interface FighterProfileProps {
  readonly profile: VersusProfile;
  /** What can be done with them here: choose, change, remove. */
  readonly children?: ReactNode;
}

/** A fighter read in full before the bout, with what can be done with them. */
export function FighterProfile({ profile, children }: FighterProfileProps) {
  const { fighter } = profile;
  const kit = profile.kit.map((k) => `${k.label}: ${k.counter}`);
  return (
    <article className="versus-profile" aria-label={`${fighter.name}’s profile`}>
      <header className="versus-profile-head">
        {fighter.look && <Portrait appearance={fighter.look} size={72} />}
        <div>
          <h2>{fighter.name}</h2>
          <p>{standingLine(profile)}</p>
          <span className="versus-power">
            Fighting power <GradeBadge grade={fighter.grade} />
          </span>
        </div>
      </header>
      {children && <div className="versus-profile-actions">{children}</div>}
      {profile.about && <p className="story">{profile.about}</p>}
      {profile.danger && <p className="muted">{profile.danger}</p>}
      {profile.nature && <p className="muted">{profile.nature} nature.</p>}
      <StatGrades stats={profile.stats} />
      <section>
        <h3>Techniques</h3>
        {profile.techniques.length === 0 && <p className="muted">Only plain blows.</p>}
        <div className="versus-techniques">
          {profile.techniques.map((t) => (
            <details key={t.id}>
              <summary>
                <TechniqueCard
                  name={t.name}
                  detail={t.glance}
                  discipline={t.discipline}
                  rank={t.rank}
                />
              </summary>
              <p className="story">{t.description}</p>
              <TechniqueSheet sheet={t.sheet} hands="In their hands" />
            </details>
          ))}
        </div>
      </section>
      <Listed heading="Gear" items={profile.gear} />
      <Listed heading="Pouch" items={profile.tools} />
      <Listed heading="Kit" items={kit} />
      <Listed heading="Gifts" items={profile.perks} />
      <Listed heading="Beside them" items={profile.beside} />
    </article>
  );
}
