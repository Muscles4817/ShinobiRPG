# The desktop app

The paid release of Shinobi RPG is a desktop app: the game's **release build** (`original` pack
only, `npm run build:release` → `dist-release/`) inside an Electron window. The shell lives in
`electron/`; the game itself doesn't know it is in one, except that `src/platform/chooseStores.ts`
finds the shell's bridge and keeps the save in files instead of the browser's storage.

## Running it

```bash
npm run desktop:dev     # Vite dev server + Electron pointed at it (hot reload, F12 dev tools)
npm run desktop:start   # builds the release game and the shell, then runs it in Electron
npm run desktop:dist    # packages it for this OS into release/ (see below)
```

`desktop:dev` runs the dev server, which has every pack (as `npm run dev` does). `desktop:start`
and `desktop:dist` only ever use `dist-release/`. F11 toggles full screen. There is no menu bar on
Windows and Linux; a Mac keeps its standard app menu.

## How the shell is put together

| File                       | What it does                                                                     |
| -------------------------- | -------------------------------------------------------------------------------- |
| `electron/main.ts`         | App lifecycle: one instance at a time, writes finished before quitting.          |
| `electron/gameWindow.ts`   | The window (1440×900, at least 1100×700), locked to the game's own pages.        |
| `electron/gameProtocol.ts` | Serves `dist-release/` from `app://game/` with a strict Content-Security-Policy. |
| `electron/gameFiles.ts`    | Which file a URL names (never outside the game's folder), the CSP, MIME types.   |
| `electron/slotFiles.ts`    | The save files: atomic writes, one backup of the save.                           |
| `electron/ipc.ts`          | Answers the preload's calls, only from the game's pages, only for known slots.   |
| `electron/preload.cts`     | Puts `window.shinobiNative` (`read`, `write`, `remove`) on the page.             |

The page is sandboxed with context isolation and no Node. It can't name a file: it names a slot
(`save`, `prefs`, `edits`) and the main process maps that to a file. It can't reach the network
(the CSP allows nothing outside `app://game`), can't navigate away and can't open windows; a link
out (Share on WhatsApp) opens in the system browser instead.

The shell is TypeScript with its own `electron/tsconfig.json` (type-checked by `npm run
typecheck`, linted and formatted like the rest), compiled by plain `tsc` with
`electron/tsconfig.build.json` into `electron/dist/` (`npm run desktop:build`). The preload is a
`.cts` file because a sandboxed preload must be CommonJS and can't import other files. Its tests
(`electron/*.test.ts`) run with the rest under `npm test`.

## Where saves live

Each slot is a file in a `saves` folder in the app's data folder (`app.getPath('userData')`):

| OS      | Folder                                                 |
| ------- | ------------------------------------------------------ |
| Windows | `%APPDATA%\Shinobi RPG\saves\`                         |
| macOS   | `~/Library/Application Support/Shinobi RPG/saves/`     |
| Linux   | `~/.config/Shinobi RPG/saves/` (or `$XDG_CONFIG_HOME`) |

- `save.json`: the game. `save.json.bak` is the save before it, kept only while it is whole JSON;
  if `save.json` is ever missing or broken, the game loads the backup.
- `prefs.json`: the device's settings (volumes).
- `edits.json`: the editor's changes.

Every write goes to a `.tmp` file beside the real one, is flushed to disk, then renamed over it,
so a crash or power cut keeps the old file whole. Deleting the save from the game deletes its
backup too. To move a game to another computer, copy the `saves` folder.

## Packaging

`npm run desktop:dist` (`scripts/desktop-dist.mjs`) runs `check:release` (the release build,
checked free of fan names), compiles the shell, runs electron-builder (`electron-builder.json`)
for the current OS, then `scripts/check-package.mjs`, which opens every `app.asar` under
`release/` and fails if it holds anything but `package.json`, `electron/dist/` and
`dist-release/`, or if any fan name is in it. `check:release` sets its flag the POSIX way, so
package on Windows from Git Bash or WSL.

| OS      | Target   | Output                                                |
| ------- | -------- | ----------------------------------------------------- |
| Windows | NSIS     | `release/Shinobi-RPG-<version>-win-x64.exe`           |
| macOS   | dmg      | `release/Shinobi-RPG-<version>-mac-<arch>.dmg`        |
| Linux   | AppImage | `release/Shinobi-RPG-<version>-linux-x86_64.AppImage` |

Pass a target through to electron-builder after `--`, e.g. `npm run desktop:dist -- --linux`.
Build each OS's package on that OS (a dmg needs a Mac; NSIS builds on Linux only with Wine).
Nothing is code-signed yet: before selling, sign and notarise the Mac build and sign the Windows
installer (electron-builder's `mac.identity`/`notarize` and `win` signing options), or the OS
will warn players away from it.
