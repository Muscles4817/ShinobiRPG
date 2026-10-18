import { SENSEI_FEEDBACK, SESSION_FORMATS } from './senseis';
import type { ContentPack } from './types';

/**
 * Checks the banks a sensei's week is told from (`senseiSpeech.ts`): every manner has enough
 * sign-offs that none comes back within a week of sessions, and no bank a rule draws from is
 * empty.
 */

/** Sign-offs per manner: one more than the sessions a sign-off is kept from repeating over. */
export const MIN_SIGN_OFFS = 5;

export function validateSenseiSpeech(pack: ContentPack): string[] {
  const speech = pack.senseiSpeech;
  const { coaching } = speech;
  const banks: [string, readonly unknown[]][] = [
    ...SESSION_FORMATS.map((f): [string, readonly unknown[]] => [
      `session "${f}"`,
      speech.sessions[f],
    ]),
    ...SENSEI_FEEDBACK.flatMap((f): [string, readonly unknown[]][] => [
      [`"${f}" verdicts on work done`, coaching.verdicts.met[f]],
      [`"${f}" verdicts on work not done`, coaching.verdicts.missed[f]],
      [`"${f}" assignments`, coaching.assign[f]],
      [`"${f}" farewells`, coaching.farewell.words[f]],
    ]),
    ['late arrivals', speech.late],
    ['expectations', speech.expects],
    ['coaching openings', coaching.opening],
    ['farewell openings', coaching.farewell.opening],
  ];
  return [
    ...SENSEI_FEEDBACK.filter((f) => speech.signOffs[f].length < MIN_SIGN_OFFS).map(
      (f) => `sensei speech needs at least ${MIN_SIGN_OFFS} "${f}" sign-offs`,
    ),
    ...banks
      .filter(([, lines]) => lines.length === 0)
      .map(([name]) => `sensei speech has no ${name}`),
  ];
}
