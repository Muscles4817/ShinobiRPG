// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameAction } from '@/game';
import { act, ctx } from '@/test/gameFixtures';
import { atEncounter } from '@/test/encounterFixtures';

import { EncounterScene } from './EncounterScene';

describe('EncounterScene (smoke test)', () => {
  it('shows what you know, the recon on offer and the ways in', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = atEncounter('tea-merchant-escort');
    render(<EncounterScene ctx={ctx} state={state} perform={(a) => done.push(a)} />);

    const notes = screen.getByRole('region', { name: 'What you know' });
    expect(within(notes).getByText('How many')).toBeInTheDocument();
    expect(within(notes).getAllByText(/^Not yet known\./).length).toBeGreaterThan(0);

    const scout = screen.getByRole('region', { name: 'Scout first' });
    await user.click(within(scout).getByRole('button', { name: /Watch them from cover/ }));
    expect(done).toEqual([{ type: 'encounterRecon', recon: 'observe' }]);

    const ways = screen.getByRole('region', { name: 'Ways in' });
    const ambush = within(ways).getByRole('button', { name: /Ambush them/ });
    expect(ambush).toBeDisabled();
    expect(within(ambush).getByText(/Watch or sense them first/)).toBeInTheDocument();

    const choices = screen.getByRole('navigation', { name: 'Choices' });
    await user.click(within(choices).getByRole('button', { name: /Go in head-on/ }));
    expect(done.at(-1)).toEqual({ type: 'encounterApproach', approach: 'head-on' });
  });

  it('ambushes from the distance you pick, once you know they are unaware', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = act(atEncounter('tea-merchant-escort'), {
      type: 'encounterRecon',
      recon: 'observe',
    });
    render(<EncounterScene ctx={ctx} state={state} perform={(a) => done.push(a)} />);
    expect(screen.getByText('They don’t know you’re here.')).toBeInTheDocument();
    const pick = screen.getByRole('group', { name: 'Strike from' });
    await user.click(within(pick).getByRole('button', { name: 'Far' }));
    await user.click(screen.getByRole('button', { name: /Ambush them/ }));
    expect(done).toEqual([{ type: 'encounterApproach', approach: 'ambush', range: 'far' }]);
  });
});
