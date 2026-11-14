import { vi } from 'vitest';

/**
 * The "silent exchange" ceiling, measured without touching `src/`: the narration entry points are
 * mocked to return a constant while `globalThis.__SILENT__` is set, and run as usual otherwise, so
 * one process can play the same exchange both ways and compare the outcomes.
 */

/** `true` silences every mock; a list silences only those named (to find which one matters). */
const flag = () => (globalThis as { __SILENT__?: boolean | readonly string[] }).__SILENT__;
const silenced = (name: string) => {
  const f = flag();
  return f === true || (Array.isArray(f) && f.includes(name));
};

vi.mock('@/systems/combat/rules/telling', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/systems/combat/rules/telling')>();
  return {
    ...actual,
    tell: (...a: Parameters<typeof actual.tell>) => {
      if (!silenced('tell')) return actual.tell(...a);
      // Variants, to find what the rules read of a told line (`silent.test.ts`).
      const mode = (globalThis as { __TELL_MODE__?: string }).__TELL_MODE__;
      if (mode === 'identity') return actual.tell(...a);
      if (mode === 'template') return a[0];
      if (mode === 'empty') return '';
      // Bisecting (`divergeTemplate.test.ts`): record templates, or empty only the chosen ones.
      const g = globalThis as { __SEEN__?: Set<string>; __EMPTY_ONLY__?: ReadonlySet<string> };
      if (mode === 'record') {
        g.__SEEN__?.add(a[0]);
        return actual.tell(...a);
      }
      if (mode === 'empty-only') return g.__EMPTY_ONLY__?.has(a[0]) ? '' : actual.tell(...a);
      // Not '': some rule reads whether a told line is empty (found by the check), so a
      // constant must be non-empty to keep outcomes the same.
      return 'x';
    },
  };
});

vi.mock('@/systems/combat/engines/plan/fresh', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/systems/combat/engines/plan/fresh')>();
  return {
    ...actual,
    told: (...a: Parameters<typeof actual.told>) => (silenced('told') ? 'x' : actual.told(...a)),
    choose: (...a: Parameters<typeof actual.choose>) =>
      silenced('choose') ? { id: 'x', index: 0, template: 'x' } : actual.choose(...a),
    freshWord: (...a: Parameters<typeof actual.freshWord>) =>
      silenced('freshWord') ? { word: 'x', mark: 'x.0' } : actual.freshWord(...a),
    freshPick: (...a: Parameters<typeof actual.freshPick>) =>
      silenced('freshPick') ? 0 : actual.freshPick(...a),
  };
});
