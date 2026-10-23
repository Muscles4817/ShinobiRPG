import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * What the phone app does around the game once it is running natively: light status bar icons
 * over the night ground, and Android's back button. Back is the phone's Esc: it closes an open
 * sheet the way the keyboard does on a desktop (`useCloseOnEscape`), and otherwise does nothing,
 * so a press mid-scene never quits the game. Leaving the app is the system's home gesture.
 */

/** Back on Android, as the Esc key the game already answers. */
function pressEscape(): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

/** Sets the shell up. A part that fails is reported and left out; the game plays on. */
export async function startPhoneShell(): Promise<void> {
  const parts = [
    SystemBars.setStyle({ style: SystemBarsStyle.Dark }),
    // Listening replaces Android's default, which would close the app.
    App.addListener('backButton', () => {
      pressEscape();
    }),
  ];
  for (const result of await Promise.allSettled(parts)) {
    if (result.status === 'rejected') console.warn('Phone shell:', result.reason);
  }
}
