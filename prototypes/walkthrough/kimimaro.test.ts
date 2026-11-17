import { createRng } from '@/core';
import { contextForPack, createVersus } from '@/game';
import { createPlanEngine, decisionsOf, type CombatState } from '@/systems/combat';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';

/**
 * The owner's Kimimaro against Asuma, played the way they set it: a Dodge ready at mid and far,
 * a Counter up close. Every hit on Kimimaro is printed with how it got through.
 */

const naruto = contextForPack('naruto')!;
const OUT = process.env.WALK_OUT ?? '.';

function readable(line: string): string {
  const notes: string[] = [];
  const text = line.replace(/⟦([^⟧]*)⟧/g, (_, tag: string) => {
    if (/^[-+]\d/.test(tag)) notes.push(`chip ${tag}`);
    else if (tag.startsWith('r:')) notes.push(`stamp: ${tag.slice(2)}`);
    else if (tag.startsWith('c:')) notes.push(`cause: ${tag.slice(2)}`);
    else if (tag.startsWith('at:')) notes.push(tag);
    return '';
  });
  const clean = text.replace(/\s+/g, ' ').trim();
  return notes.length ? `${clean} *[${notes.join('; ')}]*` : clean;
}

it('kimimaro', async () => {
  const { writeFileSync } = await import('node:fs');
  const made = createVersus(naruto, {
    side: ['person:kimimaro'],
    foes: ['person:asuma'],
    seed: Number(process.env.WALK_SEED ?? 7),
  });
  if (!made.ok) throw new Error(made.error);
  const start = decode(made.value.combat!);
  const asWanted: PlanState = {
    ...start,
    decisions: [],
    fighters: start.fighters.map((f) =>
      f.id === 'player'
        ? {
            ...f,
            reactions: { close: 'counter', mid: 'dodge', far: 'dodge' },
            ...(process.env.KEEP ? { keepAt: process.env.KEEP as 'close' } : {}),
          }
        : f,
    ),
  };
  const engine = createPlanEngine();
  const rng = createRng(11);
  let state: CombatState = { ...made.value.combat!, data: asWanted };
  const lines: string[] = [];
  const me = start.fighters.find((f) => f.id === 'player')!;
  const him = start.fighters.find((f) => f.side === 'enemy')!;
  lines.push(
    `Kimimaro: ${JSON.stringify(me.attributes)}`,
    `Kimimaro's techniques: ${me.techniques.map((t) => t.id).join(', ')}`,
  );
  lines.push(`Kimimaro's plan: ${JSON.stringify(me.loadout)}; keepAt ${me.keepAt}`);
  lines.push(
    `Asuma: ${JSON.stringify(him.attributes)}`,
    `Asuma's techniques: ${him.techniques.map((t) => `${t.id} ${JSON.stringify(t.effects)} reach ${t.reach ?? '-'}`).join('\n  ')}`,
    `Asuma gear: ${JSON.stringify(him.gear)}`,
    '',
  );
  let seen = 0;
  for (let n = 0; n < 60 && !engine.outcome(state); n++) {
    const v = engine.view(state);
    const go = v.options.some((o) => o.id === 'begin') ? 'begin' : 'next';
    const next = engine.act(state, { optionId: go }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
    if (go === 'begin') continue;
    const view = engine.view(state);
    const off = view.logOffset ?? 0;
    for (const l of view.log.slice(Math.max(0, seen - off))) lines.push(`> ${readable(l)}`);
    seen = off + view.log.length;
    const p = decode(state);
    const k = p.fighters.find((f) => f.id === 'player')!;
    const a = p.fighters.find((f) => f.side === 'enemy')!;
    lines.push(
      `  [K ${Math.round(k.health)} hp ${Math.round(k.chakra)} ch | A ${Math.round(a.health)} hp ${Math.round(a.chakra)} ch | pair ${JSON.stringify(p.distances ?? {})} range ${p.range}]`,
      '',
    );
  }
  lines.push(`Result: ${engine.outcome(state)?.result}`);
  for (const d of decisionsOf(state).filter((x) => x.phase === 'turn'))
    lines.push(`${d.round} ${d.fighterId} ${d.card} ${d.why}`);
  writeFileSync(
    `${OUT}/kimimaro-${process.env.KEEP ?? 'any'}-${process.env.WALK_SEED ?? 7}.md`,
    lines.join('\n'),
  );
});
