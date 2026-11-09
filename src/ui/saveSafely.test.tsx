// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { serialize, type SaveStore } from '@/game';
import { freshGame } from '@/test/gameFixtures';

import { App } from './App';
import { STORAGE_FULL } from './saveSafely';

/** A browser whose storage for the site is full: the game plays on and says it isn't saving. */

function fullStore(save: string): SaveStore {
  return {
    load: () => save,
    save: () => {
      throw new DOMException('Setting the value exceeded the quota.', 'QuotaExceededError');
    },
    clear: () => undefined,
  };
}

describe('a full storage', () => {
  it('keeps the game going past the honours, and says progress isn’t saved', async () => {
    const user = userEvent.setup();
    render(<App store={fullStore(serialize(freshGame()))} />);
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: 'Hear the honours' }));
    expect(screen.getByRole('heading', { name: 'The year’s honours' })).toBeInTheDocument();
    expect(screen.getByText(STORAGE_FULL)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hear the teams' }));
    expect(screen.getAllByRole('button', { name: /^Train under/ }).length).toBeGreaterThan(0);
  });
});
