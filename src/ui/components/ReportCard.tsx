import type { Report } from '@/game';

import { peopleCardContent, type CardContent } from './peopleReports';

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
        note:
          report.health < report.maxHealth * 0.25
            ? 'That was close. Rest before your next fight.'
            : null,
      };
    case 'mission-complete':
      return {
        title: report.title,
        subtitle: `For ${report.client}`,
        seal: '完',
        tone: 'good',
        rows: [
          { label: 'Reward', value: `+${report.ryo} ryo`, tone: 'gain' },
          { label: 'Reputation', value: `+${report.reputation}`, tone: 'gain' },
          { label: 'Missions done', value: String(report.missionsCompleted) },
          ...(report.teamBond
            ? [{ label: 'Team bond', value: `+${report.teamBond}`, tone: 'gain' as const }]
            : []),
        ],
        note: report.unlocked.length > 0 ? `New jobs posted: ${report.unlocked.join(', ')}` : null,
      };
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
          ...(report.reputationLost > 0
            ? [{ label: 'Reputation', value: `−${report.reputationLost}`, tone: 'harm' as const }]
            : []),
        ],
        note: report.text,
      };
    case 'lesson':
    case 'spar':
    case 'team-formed':
      return peopleCardContent(report);
  }
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
        {c.note && <p className="story report-note">{c.note}</p>}
        <button type="button" className="btn wide" onClick={onContinue} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}
