// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';

import type { CombatOption } from '@/game';

import { PlanPicker } from './Choices';

/** The card table's list of cards: folded away, its reason in view, when none can be added. */

const option = (id: string, extra: Partial<CombatOption> = {}): CombatOption => ({
  id,
  label: id,
  detail: 'Attack, 6 chakra',
  kind: 'plan',
  group: 'Close',
  ...extra,
});

const slotted = option('bolt', { rank: 0, selected: true });
const FULL = 'Slots full. Take a card out first.';
const picked: CombatOption[] = [];
const onPick = (o: CombatOption) => {
  picked.push(o);
};

function couldAdd() {
  return screen.getByText('Cards you could add').closest('details')!;
}

describe('cards you could add', () => {
  it('fold away when none can be added, and say why where it shows', () => {
    const cards = [
      option('spark', { disabledReason: FULL }),
      option('flare', { disabledReason: FULL }),
    ];
    render(<PlanPicker options={[slotted, ...cards]} here="close" onPick={onPick} />);
    expect(couldAdd().open).toBe(false);
    expect(screen.getByText(FULL)).toBeVisible();
  });

  it('stay open while one of them can be added', () => {
    const cards = [option('spark'), option('flare', { disabledReason: 'Needs 20 chakra' })];
    render(<PlanPicker options={[slotted, ...cards]} here="close" onPick={onPick} />);
    expect(couldAdd().open).toBe(true);
  });
});

describe('the slot trace', () => {
  it('shows beside a slotted card how it fared last round', () => {
    const traced = option('bolt', {
      rank: 0,
      selected: true,
      note: 'Never played. Passed over twice: out of reach from here.',
    });
    render(<PlanPicker options={[traced]} here="close" onPick={onPick} />);
    expect(screen.getByText(/Passed over twice: out of reach/)).toBeVisible();
  });
});
