// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';

import { shinobiView, type Report } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { ReportCard } from './components/ReportCard';
import { StatSheet } from './screens/StatSheet';

/** Growth on screen: grade-up cards, what a fight taught, and the tick on the stat sheet. */

const ignore = () => undefined;

describe('growth presentation (smoke test)', () => {
  it('stamps a grade-up card with the letter and lists what it opens', () => {
    const report: Report = {
      kind: 'grade',
      stat: 'Kenjutsu',
      grade: 'D',
      rank: 'Genin',
      opens: [{ name: 'Anvil Fall', where: 'Academy' }],
    };
    render(<ReportCard report={report} onContinue={ignore} />);
    const card = screen.getByRole('dialog');
    expect(within(card).getByRole('heading', { name: 'Kenjutsu: grade D' })).toBeInTheDocument();
    const opens = within(card).getByRole('region', { name: 'What this opens' });
    expect(within(opens).getByText('Anvil Fall')).toBeInTheDocument();
    expect(card.querySelector('.grade-seal')?.textContent).toBe('D');
  });

  it('lists what a fight taught on its card', () => {
    const report: Report = {
      kind: 'fight',
      result: 'victory',
      enemies: 'a bandit',
      rounds: 2,
      damageTaken: 12,
      chakraSpent: 8,
      health: 88,
      maxHealth: 100,
      taught: ['Taijutsu, a little', 'Strength +1'],
    };
    render(<ReportCard report={report} onContinue={ignore} />);
    const taught = screen.getByRole('region', { name: 'What the fight taught you' });
    expect(within(taught).getByText('Taijutsu')).toBeInTheDocument();
    expect(within(taught).getByText('a little')).toBeInTheDocument();
    expect(within(taught).getByText('+1')).toBeInTheDocument();
  });

  it('brushes in what a stat gained since the sheet was last shown', () => {
    const state = newGame();
    const first = render(<StatSheet view={shinobiView(state, ctx)} />);
    expect(document.querySelector('.ink-stroke')).toBeNull();
    first.unmount();

    const { stats } = state.character;
    const trained = { ...state.character, stats: { ...stats, strength: stats.strength + 0.6 } };
    render(<StatSheet view={shinobiView({ ...state, character: trained }, ctx)} />);
    const strokes = document.querySelectorAll('.ink-stroke');
    expect(strokes).toHaveLength(1);
    expect(strokes[0]?.closest('.stat-row')?.textContent).toContain('Strength');
  });
});
