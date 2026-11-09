import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The phone app (iOS and Android). It ships the release build, which holds only the game's own
 * setting (`npm run build:release`), so no fan pack can reach a store; and it loads nothing from
 * a server: the game's files are bundled with the app and its saves are files on the phone
 * (`src/platform/capacitorBackend.ts`). See docs/mobile.md.
 */

/** The night ground (`--bg` in ui/theme/tokens.css), shown before the game draws. */
const NIGHT = '#14121b';

const config: CapacitorConfig = {
  appId: 'com.shinobirpg.game',
  appName: 'Shinobi RPG',
  webDir: 'dist-release',
  backgroundColor: NIGHT,
  android: { backgroundColor: NIGHT },
  ios: { backgroundColor: NIGHT, contentInset: 'never' },
  plugins: {
    // Edge to edge, with the safe-area insets the page pads itself by (index.html's
    // viewport-fit=cover), and light status bar icons on the dark ground.
    SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'cover', style: 'DARK' },
  },
};

// The Capacitor CLI reads the config as the file's default export.
export default config;
