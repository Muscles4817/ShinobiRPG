// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SEEN_IN_FULL, type CombatantView, type CombatView } from '@/game';

import { PlanScreen } from './PlanScreen';

/** The plan screen explains itself: its status words on a tap, and the whole reference sheet. */

const body = { health: 100, maxHealth: 100, chakra: 50, maxChakra: 50 };
const fighters: CombatantView[] = [
  { id: 'aoi', name: 'Aoi', side: 'player', ...body, statuses: [], distance: 'close' },
  {
    id: 'goro',
    name: 'Goro',
    side: 'enemy',
    ...body,
    statuses: ['Dazed', 'Clones ×2', 'Something unheard of'],
    distance: 'close',
  },
];
const view: CombatView = {
  round: 1,
  combatants: fighters,
  log: [],
  options: [{ id: 'go', label: 'Begin the round', detail: '', kind: 'continue' }],
  range: 'close',
};

function renderPlan() {
  render(
    <PlanScreen
      view={view}
      reads={{}}
      onPick={() => undefined}
      techniqueOf={() => null}
      sightOf={() => SEEN_IN_FULL}
    />,
  );
}

describe('the fight glossary on the plan screen', () => {
  it('explains a status when it is tapped, and closes on a second tap', async () => {
    const user = userEvent.setup();
    renderPlan();
    const bars = screen.getByRole('region', { name: 'Every fighter’s bars' });
    const dazed = within(bars).getByRole('button', { name: 'Dazed' });
    expect(dazed).toHaveAttribute('aria-expanded', 'false');
    await user.click(dazed);
    expect(dazed).toHaveAttribute('aria-expanded', 'true');
    expect(dazed).toHaveAccessibleDescription(/lose their next turn/);
    await user.click(within(bars).getByRole('button', { name: 'Clones ×2' }));
    expect(within(bars).getByText(/area technique bursts them all/)).toBeVisible();
    await user.click(within(bars).getByRole('button', { name: 'Clones ×2' }));
    expect(within(bars).queryByText(/area technique bursts them all/)).toBeNull();
    expect(within(bars).queryByRole('button', { name: 'Something unheard of' })).toBeNull();
    expect(within(bars).getByText('Something unheard of')).toBeInTheDocument();
  });

  it('opens "How fighting works" from the plan screen, and Esc closes it', async () => {
    const user = userEvent.setup();
    renderPlan();
    await user.click(screen.getByRole('button', { name: 'How fighting works' }));
    const sheet = screen.getByRole('dialog', { name: 'How fighting works' });
    for (const group of ['Conditions', 'Defences', 'Actions', 'Distance and footwork']) {
      expect(within(sheet).getByRole('heading', { name: group })).toBeInTheDocument();
    }
    expect(within(sheet).getByText('Brace')).toBeInTheDocument();
    expect(within(sheet).getByText('Hold off')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'How fighting works' })).toBeNull();
  });
});
