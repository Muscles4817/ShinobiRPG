import { createRng } from '@/core';
import {
  createPlanEngine,
  type CombatEngine,
  type CombatOption,
  type CombatSetup,
  type CombatState,
  type CombatView,
  type Decision,
} from '@/systems/combat';
import { decisionsOf } from '@/systems/combat';
import { decode, type PlanFighter } from '@/systems/combat/engines/plan/state';

/**
 * A fight played one round at a time, written out the way we review it: what the plan screen
 * shows the player, then each exchange as the story tells it, with what the engine did and why
 * beside it (each turn's reason from the decision log, the objective held, pools after).
 */

export interface Walk {
  readonly engine: CombatEngine;
  state: CombatState;
  readonly rng: ReturnType<typeof createRng>;
  /** Log lines and decisions already written out. */
  logSeen: number;
  decisionsSeen: number;
}

export function startWalk(setup: CombatSetup, seed: number): Walk {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  const state = engine.start({ ...setup, trace: true }, rng);
  return { engine, state, rng, logSeen: 0, decisionsSeen: 0 };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function pools(f: PlanFighter): string {
  const statuses = [
    f.stunned > 0 ? 'dazed' : '',
    f.hidden ? 'hidden' : '',
    f.confused > 0 ? 'confused' : '',
    f.sealed > 0 ? 'sealed' : '',
  ].filter(Boolean);
  return `health ${r1(f.health)}/${f.maxHealth}, chakra ${r1(f.chakra)}/${f.maxChakra}, breath ${f.breath === undefined ? 'full' : r1(f.breath)}${statuses.length ? `, ${statuses.join(', ')}` : ''}`;
}

/** The plan screen as the player sees it: each distance's defence, footing and slotted cards. */
export function planScreen(view: CombatView): string[] {
  const out: string[] = [];
  const groups = [
    ...new Set(view.options.filter((o) => o.kind === 'plan' && o.group).map((o) => o.group!)),
  ];
  for (const g of groups) {
    const here = view.options.filter(
      (o) => o.group === g && o.kind === 'plan' && o.owner === undefined,
    );
    const pick = (setting: string) =>
      here.find((o) => o.setting === setting && o.selected)?.label ?? '—';
    const slots = here
      .filter(
        (o) =>
          o.selected && o.setting === undefined && o.rank !== undefined && o.adjusts === undefined,
      )
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    out.push(`- **${g}**: defence ${pick('Defence')}; fight at: ${pick('Fight at')}`);
    for (const s of slots) {
      const settings = view.options
        .filter((o) => o.adjusts === s.id && o.selected && o.setting)
        .map((o) => `${o.setting}: ${o.label}`);
      out.push(
        `  ${(s.rank ?? 0) + 1}. ${s.label} (${s.detail})${settings.length ? ` [${settings.join('; ')}]` : ''}${s.note ? ` — last round: ${s.note}` : ''}${s.forecast ? ` — ${s.forecast}` : ''}`,
      );
    }
  }
  return out;
}

export function combatantsShown(view: CombatView): string[] {
  return view.combatants.map((c) => {
    const bits = [
      `${c.health}/${c.maxHealth} health, ${c.chakra}/${c.maxChakra} chakra`,
      ...(c.meters ?? []).map((m) => `${m.label} ${m.value}/${m.max}`),
      c.distance ? `distance ${c.distance}` : '',
      c.statuses.length ? `statuses: ${c.statuses.join(', ')}` : '',
    ].filter(Boolean);
    const extra = [
      c.intent ? `  - telegraph: “${c.intent}”` : '',
      c.known ? `  - known: ${c.known}` : '',
      c.learned ? `  - learned of you: ${c.learned}` : '',
      ...(c.beliefs ?? []).map((b) => `  - your read: ${b}`),
    ].filter(Boolean);
    return [`- **${c.name}** (${c.side}): ${bits.join(', ')}`, ...extra].join('\n');
  });
}

function decisionLine(d: Decision, names: Record<string, string>): string {
  const target = d.targetId ? ` → ${names[d.targetId] ?? d.targetId}` : '';
  const odds = d.odds
    ? ` (odds: ${d.odds.map((o) => `${o.card} ${Math.round(o.share * 100)}%`).join(', ')})`
    : '';
  return `- ${names[d.fighterId] ?? d.fighterId} ${d.phase === 'announce' ? 'announces' : 'plays'} **${d.card}**${target} — ${d.source}: ${d.why}${d.objective ? `; objective ${d.objective}` : ''}${odds}`;
}

function newDecisions(w: Walk): Decision[] {
  const all = decisionsOf(w.state);
  const fresh = all.slice(w.decisionsSeen);
  w.decisionsSeen = all.length;
  return fresh;
}

/** A story line as the player reads it: staging tags dropped, chips and causes kept in brackets. */
function readable(line: string): string {
  const notes: string[] = [];
  const text = line.replace(/⟦([^⟧]*)⟧/g, (_, tag: string) => {
    if (/^[-+]\d/.test(tag)) notes.push(`chip ${tag}`);
    else if (tag.startsWith('r:')) notes.push(`stamp: ${tag.slice(2)}`);
    else if (tag.startsWith('c:')) notes.push(`cause: ${tag.slice(2)}`);
    return '';
  });
  const clean = text.replace(/\s+/g, ' ').trim();
  return notes.length ? `${clean} *[${notes.join('; ')}]*` : clean;
}

function newLog(w: Walk): string[] {
  const view = w.engine.view(w.state);
  const offset = view.logOffset ?? 0;
  const lines = view.log.slice(Math.max(0, w.logSeen - offset));
  w.logSeen = offset + view.log.length;
  return lines.map(readable).filter((l) => l.length > 0);
}

/** One round: the plan screen, then each exchange told and explained. */
export function walkRound(w: Walk, names: Record<string, string>): string[] {
  const out: string[] = [];
  const view = w.engine.view(w.state);
  out.push(
    `### Plan screen, round ${view.round}`,
    '',
    ...combatantsShown(view),
    '',
    '**Your plan as it stands:**',
    ...planScreen(view),
    '',
  );
  const before = newLog(w);
  if (before.length) out.push('**Story so far (new lines):**', ...before.map((l) => `> ${l}`), '');
  const announced = newDecisions(w);
  if (announced.length)
    out.push(
      '**Behind the scenes before the round:**',
      ...announced.map((d) => decisionLine(d, names)),
      '',
    );
  const begin = view.options.find((o: CombatOption) => o.id === 'begin');
  if (begin) {
    const next = w.engine.act(w.state, { optionId: 'begin' }, w.rng);
    if (!next.ok) throw new Error(next.error);
    w.state = next.value;
  }
  for (let k = 0; k < 8 && !w.engine.outcome(w.state); k++) {
    const v = w.engine.view(w.state);
    if (v.options.some((o) => o.id === 'begin')) break;
    const next = w.engine.act(w.state, { optionId: 'next' }, w.rng);
    if (!next.ok) throw new Error(next.error);
    w.state = next.value;
    const plan = decode(w.state);
    out.push(`#### Exchange ${plan.round - 1}`, '', ...newLog(w).map((l) => `> ${l}`), '');
    out.push('Behind the scenes:', ...newDecisions(w).map((d) => decisionLine(d, names)));
    out.push(
      ...plan.fighters.map((f) => `- after: ${names[f.id] ?? f.id}: ${pools(f)}`),
      `- distance: ${plan.range}${plan.distances ? ` (pairs ${JSON.stringify(plan.distances)})` : ''}`,
      '',
    );
  }
  const outcome = w.engine.outcome(w.state);
  if (outcome)
    out.push(
      `**Fight over: ${outcome.result}.** ${outcome.summary ?? ''}`,
      ...newLog(w).map((l) => `> ${l}`),
    );
  return out;
}
