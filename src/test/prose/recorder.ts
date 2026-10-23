import {
  activeScene,
  chakraPaperScene,
  combatLog,
  combatScene,
  conversationScene,
  dispatch,
  encounterScene,
  finishedFightScene,
  journeyView,
  missionScene,
  rivalScene,
  senseiTestScene,
  teamScene,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

/**
 * Writes a playthrough down as the player reads it: every journal line, report card, scene and
 * fight line, in order, so golden transcripts show each change to the game's text as a diff.
 * View models are walked for their words only (ids, art and numbers left out).
 */

/** Keys whose values are never shown as words. */
const SKIP = new Set([
  'id',
  'type',
  'icon',
  'backdrop',
  'appearance',
  'face',
  'palettes',
  'tone',
  'kind',
  'glyph',
  'colour',
  'discipline',
  'health',
  'force',
  'range',
  'portrait',
  'look',
  'action',
  'sound',
  'mood',
]);

const isSkipped = (key: string) => SKIP.has(key) || key.endsWith('Id') || key.endsWith('Ids');

export interface Recorder {
  readonly lines: string[];
  readonly say: (line: string) => void;
  readonly dump: (label: string, view: unknown) => void;
  /** Dispatches and writes down what came of it; a refusal is written and the state kept. */
  readonly play: (state: GameState, action: GameAction, note?: string) => GameState;
  readonly scene: (state: GameState) => void;
  readonly text: () => string;
}

/** A debrief's road as the card shows it: one paragraph, each pay chip beside its words. */
function asRead(report: unknown): unknown {
  if (typeof report !== 'object' || report === null || !('road' in report)) return report;
  const road = (report as { road?: readonly { text: string; pay: string | null }[] }).road ?? [];
  const told = road.map((l, i) => {
    const spaced = i === 0 || /^[\s,]/.test(l.text) ? l.text : ` ${l.text}`;
    return l.pay ? `${spaced} [${l.pay}]` : spaced;
  });
  return { ...report, road: told.join('') };
}

export function recorder(ctx: GameContext): Recorder {
  const lines: string[] = [];
  const say = (line: string) => lines.push(line);
  let journalSeen = 0;
  let reportsSeen = '';
  let logSeen = 0;

  function walk(value: unknown, key: string, depth: number): void {
    const pad = '  '.repeat(depth);
    if (value === null || value === undefined || typeof value === 'function') return;
    if (typeof value === 'string') {
      if (value.trim()) say(`${pad}${key}: ${value}`);
      return;
    }
    if (typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        walk(item, `${key}[${i}]`, depth);
      });
      return;
    }
    say(`${pad}${key}:`);
    for (const [k, v] of Object.entries(value)) if (!isSkipped(k)) walk(v, k, depth + 1);
  }

  function dump(label: string, view: unknown): void {
    say(`\n=== ${label} ===`);
    walk(view, 'view', 0);
  }

  function news(state: GameState): void {
    for (const e of state.journal.entries.filter((x) => x.id >= journalSeen)) {
      const chips = (e.chips ?? []).map((c) => `[${c.label}]`).join(' ');
      const heading = e.heading ? ` «${e.heading}»` : '';
      say(`  journal${heading}: ${e.text} ${chips}`.trimEnd());
    }
    journalSeen = state.journal.nextId;
    const reports = JSON.stringify(state.reports);
    if (reports !== reportsSeen && state.reports.length > 0) {
      dump('report card', asRead(state.reports[0]));
    }
    reportsSeen = reports;
  }

  function fightLines(state: GameState): void {
    const view = combatScene(state, ctx) ?? finishedFightScene(state);
    if (!view) return;
    const log = combatLog(view.log);
    for (const line of log.slice(logSeen)) {
      if (line.kind === 'round') say(`  —— ${line.text} ——`);
      else say(`  ${line.text} ${line.chips.map((c) => `[${c.label}]`).join(' ')}`.trimEnd());
    }
    logSeen = log.length;
    if (view.prompt) say(`  prompt: ${view.prompt}`);
  }

  /** A job or trip under way; a trip just ended shows only the place reached. */
  function roadScene(state: GameState): unknown {
    return missionScene(state, ctx) ?? journeyView(state, ctx)?.arrival;
  }

  function scene(state: GameState): void {
    const kind = activeScene(state);
    if (kind === null) return;
    say(`\n--- ${kind} (day ${state.time.day}, slot ${state.time.slot}) ---`);
    switch (kind) {
      case 'combat':
        fightLines(state);
        return;
      case 'mission':
      case 'journey':
        dump(kind, roadScene(state));
        return;
      case 'encounter':
        dump('encounter', encounterScene(state, ctx));
        return;
      case 'conversation':
        dump('conversation', conversationScene(state, ctx));
        return;
      case 'team':
        dump('team', teamScene(state, ctx));
        return;
      case 'chakra-paper':
        dump('chakra paper', chakraPaperScene(state, ctx));
        return;
      case 'sensei-test':
        dump('sensei test', senseiTestScene(state, ctx));
        return;
      case 'rival':
        dump('rival', rivalScene(state, ctx));
        return;
      case 'exam':
      case 'promotion':
      case 'race':
        say(`  (${kind})`);
    }
  }

  function play(state: GameState, action: GameAction, note = ''): GameState {
    // A transcript starts from the state it is first handed: older journal lines aren't news.
    if (journalSeen === 0) journalSeen = state.journal.nextId;
    say(`\n>>> ${action.type}${note ? ` (${note})` : ''}`);
    const result = dispatch(state, action, ctx);
    if (!result.ok) {
      say(`  refused: ${result.error}`);
      return state;
    }
    news(result.value);
    if (!state.combat && result.value.combat) logSeen = 0;
    scene(result.value);
    return result.value;
  }

  return { lines, say, dump, play, scene, text: () => `${lines.join('\n')}\n` };
}
