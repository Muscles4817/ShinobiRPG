// @vitest-environment jsdom
import { startPhoneShell } from './phoneShell';

const shell = vi.hoisted(() => ({
  back: null as (() => void) | null,
  setStyle: vi.fn(() => Promise.resolve()),
}));

vi.mock(import('@capacitor/app'), async (original) => {
  const app = await original();
  return {
    ...app,
    App: {
      ...app.App,
      addListener: vi.fn((_event: string, listener: () => void) => {
        shell.back = listener;
        return Promise.resolve({ remove: () => Promise.resolve() });
      }),
    },
  };
});

vi.mock(import('@capacitor/core'), async (original) => {
  const core = await original();
  return { ...core, SystemBars: { ...core.SystemBars, setStyle: shell.setStyle } };
});

describe('the phone app around the game', () => {
  it('lights the status bar for the night ground', async () => {
    await startPhoneShell();
    expect(shell.setStyle).toHaveBeenCalledWith({ style: 'DARK' });
  });

  it('answers Android’s back button as the Esc key, never quitting', async () => {
    await startPhoneShell();
    const keys: string[] = [];
    window.addEventListener('keydown', (event) => keys.push(event.key));
    shell.back?.();
    expect(keys).toEqual(['Escape']);
  });

  it('plays on when part of the shell fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    shell.setStyle.mockRejectedValueOnce(new Error('no bars'));
    await expect(startPhoneShell()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
