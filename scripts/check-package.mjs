// Fails a desktop package that holds anything but the app's own code and the release build of
// the game, or whose game has fan content in it. `desktop:dist` runs it over everything
// electron-builder packed (every app.asar under release/); it can also be run on one app:
//   node scripts/check-package.mjs release/linux-unpacked
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractAll, listPackage } from '@electron/asar';

// What may be packed: the app's manifest, its main process and the game's release build.
const ALLOWED = [/^package\.json$/, /^electron(\/dist(\/.*)?)?$/, /^dist-release(\/.*)?$/];
const REQUIRED = ['package.json', 'electron/dist/main.js', 'electron/dist/preload.cjs'];
const CHECK_RELEASE = fileURLToPath(new URL('./check-release.mjs', import.meta.url));

function findAsars(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === 'app.asar') return [path];
    return statSync(path).isDirectory() ? findAsars(path) : [];
  });
}

function problemsIn(asar) {
  const entries = listPackage(asar, { isPack: false }).map((entry) =>
    entry.replaceAll('\\', '/').replace(/^\//, ''),
  );
  const strays = entries.filter((entry) => !ALLOWED.some((rule) => rule.test(entry)));
  const missing = REQUIRED.filter((file) => !entries.includes(file));
  if (!entries.includes('dist-release/index.html')) missing.push('dist-release/index.html');
  return [
    ...strays.map((entry) => `${asar}: should not be packed: ${entry}`),
    ...missing.map((file) => `${asar}: missing ${file}`),
  ];
}

function fanContentIn(asar) {
  const unpacked = mkdtempSync(join(tmpdir(), 'shinobi-package-'));
  try {
    extractAll(asar, unpacked);
    const result = spawnSync(process.execPath, [CHECK_RELEASE, unpacked], { stdio: 'inherit' });
    return result.status === 0 ? [] : [`${asar}: fan content in the package`];
  } finally {
    rmSync(unpacked, { recursive: true, force: true });
  }
}

function checkPackedApps(folder) {
  const asars = findAsars(folder);
  const problems =
    asars.length === 0
      ? [`${folder}: no app.asar found`]
      : asars.flatMap((asar) => [...problemsIn(asar), ...fanContentIn(asar)]);
  if (problems.length > 0) {
    console.error(`The desktop package is not fit to ship:\n${problems.join('\n')}`);
    process.exit(1);
  }
  console.warn(`Desktop package in ${folder} holds only the app and the release build.`);
}

checkPackedApps(process.argv[2] ?? 'release');
