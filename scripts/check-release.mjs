// Fails if a release build contains names from fan-made content packs.
// Usage: node scripts/check-release.mjs <build dir>
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FAN_MARKERS = ['Konohagakure', 'Hokage', 'Ichiraku', 'Iruka', 'Sharingan', 'Kakashi'];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const dir = process.argv[2] ?? 'dist-release';
const leaks = files(dir).flatMap((file) => {
  const text = readFileSync(file, 'utf8');
  return FAN_MARKERS.filter((marker) => text.includes(marker)).map(
    (marker) => `${file}: ${marker}`,
  );
});

if (leaks.length > 0) {
  console.error(`Fan content found in release build:\n${leaks.join('\n')}`);
  process.exit(1);
}
console.warn(`Release build in ${dir} is free of fan content.`);
