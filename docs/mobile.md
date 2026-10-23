# The phone app (iOS and Android)

The phone app is the game's web build inside a [Capacitor](https://capacitorjs.com) shell. The
native projects live in `android/` and `ios/` and are committed; the game itself is copied
into them by `cap sync` and is not (each project's `.gitignore` keeps it out).

## What ships

Only the **release build** (`npm run build:release` → `dist-release`): the `original` pack and
nothing else. `capacitor.config.ts` points `webDir` at `dist-release`, and `npm run mobile:sync`
runs `check:release` first, so a build with fan names in it never reaches the native projects.
Never point `webDir` at `dist`, and never set `server.url`: the app loads nothing from a server.

## Every time the game changes

```bash
npm ci
npm run mobile:sync     # check:release (build + fan-name check), then cap sync
```

`cap sync` copies `dist-release` into `android/app/src/main/assets/public` and
`ios/App/App/public`, writes the native copies of `capacitor.config.ts`, and updates the
native plugins (`@capacitor/filesystem`, `@capacitor/app`).

## Android

To get a build without building it yourself, download one the **App builds** workflow made
(`docs/app-builds.md`).

Needs Android Studio (with its bundled JDK 21) and the Android SDK, platform 36
(`android/variables.gradle`: min SDK 24, target 36).

1. `npm run mobile:sync`
2. `npm run mobile:android` (`cap open android`) opens the project in Android Studio. Let
   Gradle sync (it downloads the Android Gradle plugin and libraries from Google's Maven).
3. Run on a device or emulator with the Run button, or from the command line:
   `cd android && ./gradlew assembleDebug` (APK in `app/build/outputs/apk/debug/`).
4. For the store: Build → Generate Signed App Bundle, with your upload key. Raise
   `versionCode` and `versionName` in `android/app/build.gradle` for each release.

Or `npx cap run android` to build and install on a connected device in one step.

## iOS

Needs a Mac with Xcode (26 or later for Capacitor 8) and an Apple developer account for devices
and the App Store. The app runs on iOS 15 and up. The project uses Swift Package Manager; no
CocoaPods.

1. `npm run mobile:sync`
2. `npm run mobile:ios` (`cap open ios`) opens `ios/App/App.xcodeproj` in Xcode.
3. Select the App target → Signing & Capabilities, choose your team (the bundle id is
   `com.shinobirpg.game`; change it in `capacitor.config.ts` and the project if it is taken).
4. Run on a simulator or a device. For the store: Product → Archive, then distribute.

## Where saves live

Each slot the game keeps (`save`, `prefs`, `edits`) is a UTF-8 JSON file in the app's data
directory (`src/platform/capacitorBackend.ts`):

| Platform | Folder                                                                           |
| -------- | -------------------------------------------------------------------------------- |
| Android  | `/data/data/com.shinobirpg.game/files/saves/` (private; Auto Backup covers it)   |
| iOS      | the app container's `Documents/saves/` (private; iCloud/device backups cover it) |

- `save.json`, `prefs.json`, `edits.json`: what the game reads.
- `save.json.bak`: the save before the last one was written (or before it was deleted). The
  game never reads it; to roll back by hand, copy it over `save.json` (Android Studio's Device
  Explorer, or Xcode → Devices → Download Container).
- `*.json.tmp`: a write under way. Each write goes to the temp file first and is then renamed
  into place, so a crash leaves the old file or the new one, never half of one.

Uninstalling the app deletes these files. Saves made in a browser (localStorage) are not moved
into the app.

## What the shell adds

- **Status bar and safe areas**: the page runs edge to edge (`viewport-fit=cover`); it pads
  itself by `env(safe-area-inset-top)` and `-bottom`, with a strip of night ground behind the
  status bar, and the status bar's icons are light (`SystemBars`, part of `@capacitor/core`).
- **Android back button**: acts as the Esc key, so it closes an open sheet (a person, a
  notice, the stove…), and otherwise does nothing; it never quits mid-scene. Leaving is the
  system's home gesture.
- **Orientation**: portrait on phones; iPads and large Android screens turn freely.

## Still to do

- App icons and splash screens are Capacitor's defaults. Generate them from `public/icon-512.png`
  with `npx @capacitor/assets generate` (needs a 1024px source icon and splash in `assets/`).
- Back does not yet go back a layer (a place page to the village, a tab to Here) or leave the
  app from the title menu: the UI has no way to ask for that from outside yet.
