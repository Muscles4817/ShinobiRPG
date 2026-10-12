import type { Report, StatGrade } from '@/game';

/** What a result card shows. Built per report kind; people-related kinds live here. */

export interface Row {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'gain' | 'cost' | 'harm';
}

/** A titled list under the card's rows, e.g. "What this opens". */
export interface CardList {
  readonly title: string;
  readonly rows: readonly Row[];
}

export interface CardContent {
  readonly title: string;
  readonly subtitle: string;
  readonly seal: string | null;
  /** A grade letter stamped in place of the seal. */
  readonly grade?: StatGrade;
  readonly rows: readonly Row[];
  readonly list?: CardList;
  readonly note: string | null;
  readonly tone: 'good' | 'bad';
}

/** "Taijutsu +0.05" as a growth row: the stat, then the gain. */
export function gainRow(label: string): Row {
  const cut = label.lastIndexOf(' ');
  return cut < 0
    ? { label, value: '', tone: 'gain' }
    : { label: label.slice(0, cut), value: label.slice(cut + 1), tone: 'gain' };
}

type PeopleReport = Extract<Report, { kind: 'lesson' | 'spar' | 'team-formed' }>;

const SPAR_TITLE = { won: 'You won', lost: 'You lost', yielded: 'You yielded' } as const;

export function peopleCardContent(report: PeopleReport): CardContent {
  switch (report.kind) {
    case 'lesson':
      return {
        title: `Lesson with ${report.sensei}`,
        subtitle: 'Weekly lesson',
        seal: '師',
        tone: 'good',
        rows: [
          ...report.gains.map((g) => ({ label: 'Growth', value: g, tone: 'gain' as const })),
          { label: 'Bond', value: `+${report.bond}`, tone: 'gain' },
          ...(report.technique
            ? [
                {
                  label: report.technique.name,
                  value: report.technique.mastered ? 'Mastered' : `${report.technique.percent}%`,
                  tone: 'gain' as const,
                },
              ]
            : []),
        ],
        note: report.text,
      };
    case 'spar':
      return {
        title: SPAR_TITLE[report.result],
        subtitle: `Spar with ${report.opponent}`,
        seal: null,
        tone: 'good',
        rows: [{ label: 'Bond', value: `+${report.bond}`, tone: 'gain' }],
        ...(report.gains.length > 0
          ? { list: { title: 'What the spar taught you', rows: report.gains.map(gainRow) } }
          : {}),
        note: report.text,
      };
    case 'team-formed':
      return {
        title: 'Your team',
        subtitle: 'Team assignment',
        seal: '班',
        tone: 'good',
        rows: [
          { label: report.senseiTitle, value: report.sensei },
          ...report.teammates.map((name) => ({ label: 'Teammate', value: name })),
        ],
        note: report.text,
      };
  }
}
