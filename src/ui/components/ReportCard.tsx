import type { Report } from '@/game';

import { gainRow, peopleCardContent, type CardContent, type CardList } from './peopleReports';

/** What a fight taught, as a list on its card (absent when it taught nothing visible). */
function taughtList(taught: readonly string[] | undefined): { list?: CardList } {
  return taught && taught.length > 0
    ? { list: { title: 'What the fight taught you', rows: taught.map(gainRow) } }
    : {};
}

/** A stat's new grade: the letter as a stamp, and what it opens, from content. */
function gradeCard(report: Extract<Report, { kind: 'grade' }>): CardContent {
  return {
    title: `${report.stat}: grade ${report.grade}`,
    subtitle: `${report.rank}-grade work`,
    seal: null,
    grade: report.grade,
    tone: 'good',
    rows: [],
    ...(report.opens.length > 0
      ? {
          list: {
            title: 'What this opens',
            rows: report.opens.map((o) => ({ label: o.name, value: o.where })),
          },
        }
      : {}),
    note:
      report.opens.length > 0
        ? 'New scrolls are within your reach.'
        : 'Nothing new is within reach yet, but you are not the shinobi you were.',
  };
}

function missionNote(report: Extract<Report, { kind: 'mission-complete' }>): string | null {
  if (report.gear) return 'The client insists you keep the weapon. It is yours now.';
  if (report.scroll) return 'The client presses a sealed scroll into your hands. Read it at home.';
  return report.unlocked.length > 0
    ? 'Word is the hall will trust you with harder work now. Watch the board.'
    : null;
}

/** The debrief: what you earned, what was docked, and how the team grew. */
function missionCompleteCard(report: Extract<Report, { kind: 'mission-complete' }>): CardContent {
  return {
    title: report.title,
    subtitle: `For ${report.client}`,
    seal: '完',
    tone: 'good',
    rows: [
      { label: 'Reward', value: `+${report.ryo} ryo`, tone: 'gain' },
      ...(report.docked
        ? [
            {
              label: 'Docked for trouble',
              value: `−${report.docked} ryo`,
              tone: 'harm' as const,
            },
          ]
        : []),
      { label: 'Reputation', value: `+${report.reputation}`, tone: 'gain' },
      { label: 'Missions done', value: String(report.missionsCompleted) },
      ...(report.teamBond
        ? [{ label: 'Team bond', value: `+${report.teamBond}`, tone: 'gain' as const }]
        : []),
      ...(report.scroll ? [{ label: 'Scroll', value: report.scroll, tone: 'gain' as const }] : []),
      ...(report.gear ? [{ label: 'Weapon', value: report.gear, tone: 'gain' as const }] : []),
    ],
    note: missionNote(report),
  };
}

function content(report: Report): CardContent {
  switch (report.kind) {
    case 'fight':
      return {
        title: report.result === 'victory' ? 'Victory' : 'Fight over',
        subtitle: `Against ${report.enemies}`,
        seal: null,
        tone: 'good',
        rows: [
          { label: 'Rounds', value: String(report.rounds) },
          { label: 'Damage taken', value: String(report.damageTaken), tone: 'harm' },
          { label: 'Chakra spent', value: String(report.chakraSpent), tone: 'cost' },
          { label: 'Health left', value: `${report.health} / ${report.maxHealth}` },
        ],
        ...taughtList(report.taught),
        note:
          report.health < report.maxHealth * 0.25
            ? 'That was close. Rest before your next fight.'
            : null,
      };
    case 'mission-complete':
      return missionCompleteCard(report);
    case 'mission-failed':
      return {
        title: report.title,
        subtitle: 'Mission failed',
        seal: null,
        tone: 'bad',
        rows: [{ label: 'Reputation', value: `−${report.reputationLost}`, tone: 'harm' }],
        note: report.reason,
      };
    case 'defeat':
      return {
        title: 'Defeated',
        subtitle: report.title ?? 'You lost the fight',
        seal: null,
        tone: 'bad',
        rows: [
          ...(report.title ? [{ label: 'Mission', value: 'Failed', tone: 'harm' as const }] : []),
          { label: 'Hospital bill', value: `${report.hospitalFee} ryo`, tone: 'cost' },
          ...(report.injury
            ? [{ label: 'Injury', value: report.injury, tone: 'harm' as const }]
            : []),
          ...(report.reputationLost > 0
            ? [{ label: 'Reputation', value: `−${report.reputationLost}`, tone: 'harm' as const }]
            : []),
        ],
        ...taughtList(report.taught),
        note: report.text,
      };
    case 'grade':
      return gradeCard(report);
    case 'lesson':
    case 'spar':
    case 'team-formed':
      return peopleCardContent(report);
  }
}

function ReportList({ list }: { readonly list: CardList }) {
  return (
    <section className="report-list" aria-label={list.title}>
      <h3 className="report-list-title">{list.title}</h3>
      <dl className="report-rows">
        {list.rows.map((r, i) => (
          <div key={`${r.label}-${i}`}>
            <dt>{r.label}</dt>
            <dd className={`num ${r.tone ?? ''}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

interface ReportCardProps {
  readonly report: Report;
  readonly onContinue: () => void;
}

/** A result card shown over everything until the player continues. */
export function ReportCard({ report, onContinue }: ReportCardProps) {
  const c = content(report);
  return (
    <div className="report-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className={`report enter tone-${c.tone}`}>
        {c.seal && (
          <span className="seal" aria-hidden="true">
            {c.seal}
          </span>
        )}
        {c.grade && (
          <span className="seal grade-seal" data-grade={c.grade} aria-hidden="true">
            {c.grade}
          </span>
        )}
        <p className="label">{c.subtitle}</p>
        <h2 id="report-title" className="report-title">
          {c.title}
        </h2>
        <dl className="report-rows">
          {c.rows.map((r, i) => (
            <div key={`${r.label}-${i}`}>
              <dt>{r.label}</dt>
              <dd className={`num ${r.tone ?? ''}`}>{r.value}</dd>
            </div>
          ))}
        </dl>
        {c.list && <ReportList list={c.list} />}
        {c.note && <p className="story report-note">{c.note}</p>}
        <button type="button" className="btn wide" onClick={onContinue} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}
