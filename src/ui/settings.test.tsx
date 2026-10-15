// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

import type { SaveStore } from '@/game';

import { App } from './App';

function memoryStore(initial: string | null = null): SaveStore & { data: string | null } {
  const store = {
    data: initial,
    load: () => store.data,
    save: (data: string) => {
      store.data = data;
    },
    clear: () => {
      store.data = null;
    },
  };
  return store;
}

describe('settings (smoke test)', () => {
  it('opens from the title screen and keeps the sound on the device', async () => {
    const user = userEvent.setup();
    const prefs = memoryStore();
    render(<App store={memoryStore()} prefs={prefs} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));

    await user.click(screen.getByRole('button', { name: /Sound on/ }));
    expect(screen.getByRole('button', { name: /Sound off/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('slider', { name: /Music/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Sound off/ }));

    fireEvent.change(screen.getByRole('slider', { name: /Music/ }), { target: { value: '80' } });
    expect(JSON.parse(prefs.data!)).toEqual({ sound: true, effectsVolume: 70, musicVolume: 80 });
    expect(screen.queryByRole('region', { name: 'This save' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
  });

  it('comes back as it was left', async () => {
    const user = userEvent.setup();
    const prefs = memoryStore('{"sound":true,"effectsVolume":30,"musicVolume":0}');
    render(<App store={memoryStore()} prefs={prefs} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    expect(screen.getByRole('slider', { name: /Effects/ })).toHaveValue('30');
    expect(screen.getByText('Silent')).toBeInTheDocument();
  });
});
