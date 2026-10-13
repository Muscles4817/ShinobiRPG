// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';

import type { Report } from '@/game';

import { ReportCard } from './components/ReportCard';

/** The debrief card: the road line by line, the crew, the grade, and what would have helped. */

const ignore = () => undefined;

describe('the debrief (smoke test)', () => {
  it('tells the road, the crew and the grade', () => {
    const report: Report = {
      kind: 'mission-complete',
      title: 'The Pilgrim Nun',
      client: 'The Mountain Temple',
      ryo: 504,
      reputation: 6,
      missionsCompleted: 6,
      unlocked: [],
      ending: 'She hands you the taper.',
      grade: 'rough',
      road: [
        { text: 'The trouble on the road cost the light.', tone: 'cost', pay: null },
        { text: 'Sister Kohaku pressed a gift on you.', tone: 'gain', pay: '+20% pay' },
      ],
      crew: [{ name: 'Ren', bond: 8, quote: 'Good. Steady.' }],
    };
    render(<ReportCard report={report} onContinue={ignore} />);
    expect(screen.getByText('For The Mountain Temple, a rough road')).toBeInTheDocument();
    const road = screen.getByRole('region', { name: 'The road' });
    expect(within(road).getByText('+20% pay')).toBeInTheDocument();
    const crew = screen.getByRole('region', { name: 'Who went with you' });
    expect(within(crew).getByText('Ren')).toBeInTheDocument();
    expect(within(crew).getByText('Good. Steady.')).toBeInTheDocument();
  });

  it('says what would have helped a failure', () => {
    const report: Report = {
      kind: 'mission-failed',
      title: 'The Dropout',
      reason: 'You pulled back.',
      reputationLost: 1,
      road: [],
      helped: 'Academy Dropout: Coward. Corner them.',
    };
    render(<ReportCard report={report} onContinue={ignore} />);
    const helped = screen.getByRole('region', { name: 'What would have helped' });
    expect(within(helped).getByText('Academy Dropout: Coward. Corner them.')).toBeInTheDocument();
  });
});
