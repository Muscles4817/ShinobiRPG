// Measures the game's prose against EQ-Bench's slop lists, as in docs/design/prose-plan.md.
// Reads every prose string literal in src/ (tests and validation left out) and reports words
// over-used by language models per thousand words, by area, with the most frequent hits.
// The lists come from a checkout of https://github.com/sam-paech/slop-score (MIT).
// Usage: node scripts/prose-measure.mjs <path to slop-score checkout>
// The style measures (sentence length, quips, habits) are the prose lint: src/test/prose/.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import ts from 'typescript';

const ROOT = join(import.meta.dirname, '..');
const slopScore = process.argv[2];
if (!slopScore) {
  console.error('Usage: node scripts/prose-measure.mjs <path to slop-score checkout>');
  process.exit(1);
}

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory())
      return name === 'test' || name === 'ui' ? [] : sourceFiles(path);
    return /\.ts$/.test(name) && !/\.test\.ts$/.test(name) && !/validate/i.test(name) ? [path] : [];
  });
}

function stringsIn(path) {
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest);
  const out = [];
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (node.text.split(/\s+/).length >= 3 && /[a-z]/.test(node.text)) out.push(node.text);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return out;
}

const area = (file) =>
  /combat/.test(file)
    ? 'combat'
    : /talk|conversation|voices|sensei|coaching/.test(file)
      ? 'talk'
      : /mission|jobs|arcs|road|encounter|story|debrief/.test(file)
        ? 'missions'
        : 'village and the rest';

const slopWords = new Set(
  JSON.parse(readFileSync(join(slopScore, 'data', 'slop_list.json'), 'utf8')).map((w) => w[0]),
);
const tally = new Map();
const hits = new Map();
for (const file of sourceFiles(join(ROOT, 'src'))) {
  const where = area(relative(ROOT, file));
  const row = tally.get(where) ?? { words: 0, slop: 0 };
  for (const text of stringsIn(file)) {
    const words = text.toLowerCase().match(/[a-z’']+/g) ?? [];
    row.words += words.length;
    for (const w of words.filter((x) => slopWords.has(x))) {
      row.slop++;
      hits.set(w, (hits.get(w) ?? 0) + 1);
    }
  }
  tally.set(where, row);
}

const say = (line) => process.stdout.write(`${line}\n`);
for (const [where, row] of tally) {
  say(
    `${where}: ${row.words} words, ${((row.slop / row.words) * 1000).toFixed(2)} slop words per 1k`,
  );
}
const top = [...hits].sort((a, b) => b[1] - a[1]).slice(0, 25);
say(`most used: ${top.map(([w, n]) => `${w} ${n}`).join(', ')}`);
say('For scale: EQ-Bench human baseline 6.9 per 1k; the cleanest model 5.6.');
