import type { Report } from '@/game';

import type { CardContent } from './peopleReports';

/** The card for coming out of wild country after a venture. */

/** Out of the wild: how far in, the days it took, and what it gave. */
export function ventureCard(report: Extract<Report, { kind: 'venture-over' }>): CardContent {
  return {
    title: `Out of ${report.country}`,
    subtitle: report.reached,
    seal: '野',
    tone: 'good',
    note: null,
    rows: [{ label: 'Days in the wild', value: String(report.days) }, ...gaveRows(report.gave)],
  };
}

/** Only what the wild gave: a day with no fight and no find says nothing of either. */
function gaveRows(gave: Extract<Report, { kind: 'venture-over' }>['gave']): CardContent['rows'] {
  if (!gave) return [];
  const counts = [
    { label: 'Foes faced', value: gave.fought },
    { label: 'Foes beaten', value: gave.beaten },
    { label: 'Things found', value: gave.found },
  ];
  return counts.filter((c) => c.value > 0).map((c) => ({ label: c.label, value: String(c.value) }));
}
