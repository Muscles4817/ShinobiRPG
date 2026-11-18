// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';

import type { CombatOption } from '@/game';

import { WhoPlans } from './WhoPlans';

/** Who plans this round: one switch, and what each level offers. */

const level = (id: string, label: string, selected = false): CombatOption => ({
  id,
  label,
  detail: `${label} detail`,
  kind: 'planning',
  planning: 'level',
  selected,
});

describe('who plans this round', () => {
  it('shows three stops, the chosen one marked, and picks another', () => {
    const picked: string[] = [];
    render(
      <WhoPlans
        options={[
          level('who:list', 'Your list', true),
          level('who:draft', 'Plan, then edit'),
          level('who:orders', 'Orders'),
          {
            id: 'ask-plan',
            label: 'Ask for a plan',
            detail: '',
            kind: 'planning',
            planning: 'ask',
          },
        ]}
        onPick={(o) => picked.push(o.id)}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Your list' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Orders' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ask for a plan' }));
    expect(picked).toEqual(['who:orders', 'ask-plan']);
  });

  it('at orders, offers the order and what never to use', () => {
    const picked: string[] = [];
    render(
      <WhoPlans
        options={[
          level('who:orders', 'Orders', true),
          {
            id: 'order:free',
            label: 'As the mind sees fit',
            detail: '',
            kind: 'planning',
            planning: 'order',
            selected: true,
          },
          {
            id: 'order:press',
            label: 'Press in close',
            detail: '',
            kind: 'planning',
            planning: 'order',
          },
          {
            id: 'forbid:jutsu:bolt',
            label: 'Bolt',
            detail: '',
            kind: 'planning',
            planning: 'forbid',
          },
        ]}
        onPick={(o) => picked.push(o.id)}
      />,
    );
    fireEvent.change(screen.getByLabelText('Your order'), { target: { value: 'order:press' } });
    fireEvent.click(screen.getByRole('button', { name: 'Bolt' }));
    expect(picked).toEqual(['order:press', 'forbid:jutsu:bolt']);
  });
});
