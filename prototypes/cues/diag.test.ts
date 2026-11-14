import { cardId } from '@/systems/combat/engines/plan/cards';
import { SCALES } from '@/test/bench/fighters';
import { CAST_IDS } from '@/test/bench/matrixCast';

import { collect } from './collect';
import { readingOf, score } from './evaluate';
import { expertIn, observe } from './observe';
import { cueProfile, telegraphClassOf } from './profile';

/** Diagnostics: where out-reading observers fall short of today. Run on demand. */
test.skipIf(!process.env.CUES_DIAG)('diagnose', () => {
  const fights = SCALES.flatMap((scale) =>
    CAST_IDS.flatMap((a) => CAST_IDS.map((b) => ({ a, b, scale, seed: 1 }))),
  );
  const points = collect(fights).filter((p) => p.direction === 'player-reads-foe' && !p.insight);
  const out = points.map((p) => score(p)).filter((s) => s.gap >= 0 && s.cue);
  const confusion = new Map<string, number>();
  for (const s of out) {
    const t = telegraphClassOf(s.point.truth);
    if (s.cue!.telegraph !== t) {
      const k = `${t} -> ${s.cue!.telegraph} (${s.cue!.confidence})`;
      confusion.set(k, (confusion.get(k) ?? 0) + 1);
    }
  }
  const st = points.map((p) => score(p)).filter((s) => s.truthClass === 'stance' && s.cue);
  const stc = new Map<string, number>();
  for (const s of st) {
    const k = `${s.truthId} seen:${s.point.seenCards.includes(s.truthId)} -> ${s.cue!.predicted} ${s.cue!.confidence}`;
    stc.set(k, (stc.get(k) ?? 0) + 1);
  }
  console.log([...stc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12));
  console.log(out.length, [...confusion.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20));
  const misses = new Map<string, number>();
  for (const s of out.filter((s) => s.nameable && s.cue!.named !== s.truthId)) {
    const p = s.point;
    const prof = cueProfile(p.truth, p.actor);
    const seen = p.seenCards.includes(cardId(p.truth));
    const expert = expertIn(p.observer, prof.art, prof.rank);
    const sight = observe(readingOf(p), prof);
    const k = `${seen ? 'seen' : 'first'} ${expert ? 'expert' : 'lay'} form:${sight.form?.quality ?? 'missed'}:${sight.form?.value === s.truthId ? 'id' : (sight.form?.value ?? '')}`;
    misses.set(k, (misses.get(k) ?? 0) + 1);
  }
  console.log([...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20));
});
