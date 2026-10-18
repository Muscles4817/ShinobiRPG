import type { Report } from '@/game';

import { DebriefSections } from './Debrief';
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

/** Home from a trip: the days away, and what the village did meanwhile. */
function homeAgainCard(report: Extract<Report, { kind: 'home-again' }>): CardContent {
  return {
    title: `Home to ${report.place}`,
    subtitle: 'While you were away',
    seal: '帰',
    tone: 'good',
    rows: [
      { label: 'Days away', value: String(report.days) },
      ...report.news.map((n) => ({
        label: n.label,
        value: n.value,
        ...(n.tone ? { tone: n.tone } : {}),
      })),
    ],
    note: report.text,
  };
}

function handOverNote(report: Extract<Report, { kind: 'mission-complete' }>): string | null {
  if (report.gear) return 'The client insists you keep the weapon. It is yours now.';
  if (report.scroll) return 'The client presses a sealed scroll into your hands. Read it at home.';
  if (report.recipe) return 'Before you go, the client writes down a family recipe for you.';
  if (report.contract)
    return 'A summoning scroll unrolls at your feet. You sign it in your own blood; the smallest of them will answer you now.';
  if (report.companion)
    return `The animal you saved is being looked after at the animal clinic. ${report.companion} is yours to take home when you're ready.`;
  return report.unlocked.length > 0
    ? 'Word is the hall will trust you with harder work now. Watch the board.'
    : null;
}

/** How the job ended, if the scene closed before it could say, then what came of it. */
function missionNote(report: Extract<Report, { kind: 'mission-complete' }>): string | null {
  const lines = [report.ending, handOverNote(report)].filter((l): l is string => Boolean(l));
  return lines.length > 0 ? lines.join(' ') : null;
}

/** The debrief: what you earned, what was docked, and how the team grew. */
function missionCompleteCard(report: Extract<Report, { kind: 'mission-complete' }>): CardContent {
  return {
    title: report.title,
    subtitle: report.grade
      ? `For ${report.client}, ${GRADE_WORDS[report.grade]}`
      : `For ${report.client}`,
    seal: report.grade ? GRADE_SEAL[report.grade] : '完',
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
      ...(report.recipe ? [{ label: 'Recipe', value: report.recipe, tone: 'gain' as const }] : []),
      ...(report.companion
        ? [{ label: 'Companion', value: report.companion, tone: 'gain' as const }]
        : []),
      ...(report.contract
        ? [{ label: 'Contract', value: report.contract, tone: 'gain' as const }]
        : []),
    ],
    note: missionNote(report),
  };
}

/** Beaten: the hospital bill, any injury, and what the fight taught anyway. */
function defeatCard(report: Extract<Report, { kind: 'defeat' }>): CardContent {
  return {
    title: 'Defeated',
    subtitle: report.title ?? 'You lost the fight',
    seal: null,
    tone: 'bad',
    rows: [
      ...(report.title ? [{ label: 'Mission', value: 'Failed', tone: 'harm' as const }] : []),
      { label: 'Hospital bill', value: `${report.hospitalFee} ryo`, tone: 'cost' },
      ...(report.injury ? [{ label: 'Injury', value: report.injury, tone: 'harm' as const }] : []),
      ...(report.reputationLost > 0
        ? [{ label: 'Reputation', value: `−${report.reputationLost}`, tone: 'harm' as const }]
        : []),
    ],
    ...taughtList(report.taught),
    note: report.summary ? `${report.summary} ${report.text}` : report.text,
  };
}

/** Below this share of health, the card says to rest. */
const CLOSE_CALL = 0.25;

/** What the fight came to, and a word to rest when it was close. */
function fightNote(report: Extract<Report, { kind: 'fight' }>): string | null {
  const close = report.health < report.maxHealth * CLOSE_CALL;
  const parts = [report.summary, close ? 'That was close. Rest before your next fight.' : null];
  const note = parts.filter((p) => p !== null && p !== undefined).join(' ');
  return note === '' ? null : note;
}

/** A bout you only watched: who won, how long it took, and what watching taught you. */
function watchedCard(report: Extract<Report, { kind: 'fight' }>, verdict: string): CardContent {
  return {
    title: verdict,
    subtitle: `Against ${report.enemies}`,
    seal: null,
    tone: 'good',
    rows: [{ label: 'Rounds', value: String(report.rounds) }],
    ...taughtList(report.taught),
    note: report.summary ?? null,
  };
}

function content(report: Report): CardContent {
  switch (report.kind) {
    case 'fight':
      if (report.verdict) return watchedCard(report, report.verdict);
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
        note: fightNote(report),
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
      return defeatCard(report);
    case 'grade':
      return gradeCard(report);
    case 'home-again':
      return homeAgainCard(report);
    case 'lesson':
    case 'spar':
    case 'team-formed':
    case 'nature':
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

function isJob(
  report: Report,
): report is Extract<Report, { kind: 'mission-complete' | 'mission-failed' | 'defeat' }> {
  return (
    report.kind === 'mission-complete' ||
    report.kind === 'mission-failed' ||
    report.kind === 'defeat'
  );
}

/** The seal a job's grade stamps on its debrief. */
const GRADE_SEAL = { clean: '良', rough: '並', botched: '拙' } as const;
const GRADE_WORDS = {
  clean: 'a clean job',
  rough: 'a rough road',
  botched: 'a botched job',
} as const;

interface ReportCardProps {
  readonly report: Report;
  readonly onContinue: () => void;
}

/** A result card shown over everything until the player continues. */
export function ReportCard({ report, onContinue }: ReportCardProps) {
  const c = content(report);
  // A job's debrief tells how it ended first, then the pay, then the road.
  const job = isJob(report);
  return (
    <div className="report-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className={`report enter tone-${c.tone}${job ? ' debrief' : ''}`}>
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
        {job && c.note && <p className="story report-note">{c.note}</p>}
        <dl className="report-rows">
          {c.rows.map((r, i) => (
            <div key={`${r.label}-${i}`}>
              <dt>{r.label}</dt>
              <dd className={`num ${r.tone ?? ''}`}>{r.value}</dd>
            </div>
          ))}
        </dl>
        {c.list && <ReportList list={c.list} />}
        {job && <DebriefSections report={report} />}
        {!job && c.note && <p className="story report-note">{c.note}</p>}
        <button type="button" className="btn wide" onClick={onContinue} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}
