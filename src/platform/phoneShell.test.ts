// @vitest-environment jsdom
import { startPhoneShell } from './phoneShell';

const shell = vi.hoisted(() => ({
  listeners: Object.create(null) as Record<string, () => void>,
  setStyle: vi.fn(() => Promise.resolve()),
}));

vi.mock(import('@capacitor/app'), async (original) => {
  const app = await original();
  return {
    ...app,
    App: {
      ...app.App,
      addListener: vi.fn((event: string, listener: () => void) => {
        shell.listeners[event] = listener;
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
    await startPhoneShell(null);
    expect(shell.setStyle).toHaveBeenCalledWith({ style: 'DARK' });
  });

  it('answers Android’s back button as the Esc key, never quitting', async () => {
    await startPhoneShell(null);
    const keys: string[] = [];
    window.addEventListener('keydown', (event) => keys.push(event.key));
    shell.listeners.backButton?.();
    expect(keys).toEqual(['Escape']);
  });

  it('hurries its last save on when sent to the background', async () => {
    const flushed = vi.fn(() => Promise.resolve());
    await startPhoneShell({ busy: () => true, flushed });
    shell.listeners.pause?.();
    expect(flushed).toHaveBeenCalled();
  });

  it('plays on when part of the shell fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    shell.setStyle.mockRejectedValueOnce(new Error('no bars'));
    await expect(startPhoneShell(null)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
