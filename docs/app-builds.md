# Getting the apps without building them

The **App builds** workflow (`.github/workflows/app-builds.yml`) builds the Windows installer and
the Android APK on GitHub's machines, from the release game (the `original` pack only). It runs on
every push to `main`, on pull requests that change how the apps are built, and on demand.

## Downloading a build

1. On GitHub, open **Actions → App builds** and pick the newest run with a green tick (or press
   **Run workflow** to make one now).
2. Under **Artifacts** at the bottom of the run, download `shinobi-rpg-windows` or
   `shinobi-rpg-android`. Each is a zip; the installer or APK is inside. Artifacts are kept for
   30 days, and you need to be signed in to GitHub to download them.

Builds are kept as artifacts, never published as a release: the repository is public, and a
public release would be the paid game for anyone to take.

## Windows

Unzip and run `Shinobi-RPG-<version>-win-x64.exe`. The app isn't code-signed yet, so Windows shows
"Windows protected your PC": press **More info**, then **Run anyway**. A newer build installs over
the old one; saves are kept in `%APPDATA%\Shinobi RPG\saves\` and survive reinstalling.

## Android

Unzip the APK and get it onto the phone (a USB cable, Google Drive, or emailing it to yourself),
then open it there. Android asks once to allow installs from that app (your file manager or
browser): allow it, and install.

**Set up your own signing key first.** Without it the workflow makes a debug build, signed by a key
GitHub makes fresh for each run, so the next build won't install over it: you'd have to uninstall,
and **uninstalling an Android app deletes its saves**. With your key, every build installs over
the last and keeps your game. To set it up once:

1. Install a Java JDK (for example Eclipse Temurin 21 from adoptium.net), which brings `keytool`.
2. In PowerShell, make a key and keep the file and passwords somewhere safe (lose them and future
   builds can't update the installed app):

   ```powershell
   keytool -genkeypair -v -keystore shinobi.jks -alias shinobi -keyalg RSA -keysize 2048 -validity 10000
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("shinobi.jks")) | Set-Clipboard
   ```

3. On GitHub, open **Settings → Secrets and variables → Actions** and add four repository secrets:
   `ANDROID_KEYSTORE_BASE64` (paste the clipboard), `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS` (`shinobi`) and `ANDROID_KEY_PASSWORD` (the passwords you chose).

From the next run the APK is a signed release build (`app-release.apk`). If you installed a debug
build before setting the key, uninstall it once before installing the first signed one.

Each build's version number is the workflow's run number, so Android always sees a newer build as
an update.
