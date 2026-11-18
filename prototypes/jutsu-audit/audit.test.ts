import { writeFileSync } from 'node:fs';

import { contextForPack } from '@/game';
import { areaCostScale, rankedCost } from '@/systems/combat/rules/chakra';
import { isBodyMove } from '@/systems/combat/rules/breath';
import { maxChakra } from '@/systems/vitals';

/**
 * Jutsu audit: every technique's chakra cost against what it does, and against the pools of the
 * people who fight with it. Writes RESULTS-data.md beside this file.
 */

const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'] as const;
const UTILITY = [
  'daze',
  'pin',
  'seal',
  'drain',
  'afflict',
  'confuse',
  'clone',
  'summon',
  'conceal',
  'heal',
  'empower',
  'shroud',
  'knock',
  'counter',
  'move',
  'area',
  'sense',
];
const REGEN_SHARE = 0.025;

const median = (xs: readonly number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0
    ? 0
    : (s[Math.floor((s.length - 1) / 2)]! + s[Math.ceil((s.length - 1) / 2)]!) / 2;
};
const r1 = (n: number) => Math.round(n * 10) / 10;

it('audits', () => {
  const out: string[] = [];
  for (const packId of ['naruto', 'original']) {
    const ctx = contextForPack(packId)!;
    const people = [...ctx.content.people.all, ...ctx.content.duelists.all];
    const pools = people.map((p) => {
      const s = p.stats as unknown as Record<string, number>;
      const pool = maxChakra({ reserves: s.reserves ?? 0, chakraControl: s.chakraControl ?? 0 });
      return {
        id: p.id,
        name: p.name,
        rank: p.rank as string,
        pool,
        control: s.chakraControl ?? 0,
        regen: Math.max(2, Math.round(pool * REGEN_SHARE)),
      };
    });
    out.push(
      `## ${packId}: pools by rank (max chakra, regen each exchange)`,
      '',
      '| Rank | n | Min | Median | Max | Median regen |',
      '| --- | --: | --: | --: | --: | --: |',
    );
    for (const rank of ['genin', 'chunin', 'jonin', 'kage', 'sannin', 'sensei']) {
      const ps = pools.filter((p) => p.rank === rank);
      if (ps.length === 0) continue;
      const v = ps.map((p) => p.pool);
      out.push(
        `| ${rank} | ${ps.length} | ${Math.min(...v)} | ${median(v)} | ${Math.max(...v)} | ${median(ps.map((p) => p.regen))} |`,
      );
    }
    const ranks = [...new Set(pools.map((p) => p.rank))];
    out.push('', `Ranks present: ${ranks.join(', ')}`, '', 'Deepest pools:', '');
    for (const p of [...pools].sort((a, b) => b.pool - a.pool).slice(0, 12))
      out.push(`- ${p.name} (${p.rank}): ${p.pool}, regen ${p.regen}`);
    const techs = ctx.content.techniques.all.map((t) => {
      const damage = t.effects.filter((e) => e.verb === 'damage').reduce((n, e) => n + e.power, 0);
      const verbs = [...new Set(t.effects.map((e) => e.verb))];
      const cost = Math.round(rankedCost(t) * areaCostScale(t));
      return {
        t,
        damage,
        verbs,
        cost,
        breath: isBodyMove(t as never),
        rank: (t.rank ?? 'E') as (typeof RANKS)[number],
      };
    });
    out.push(
      '',
      `## ${packId}: techniques by rank (chakra-paid only; body moves cost breath)`,
      '',
      '| Rank | n | Median written | Median effective | Median damage power | Damage per chakra | Share with utility verbs |',
      '| --- | --: | --: | --: | --: | --: | --: |',
    );
    for (const rank of RANKS) {
      const ts = techs.filter((x) => x.rank === rank && !x.breath);
      if (ts.length === 0) continue;
      const dmg = ts.filter((x) => x.damage > 0);
      out.push(
        `| ${rank} | ${ts.length} | ${median(ts.map((x) => x.t.chakraCost))} | ${median(ts.map((x) => x.cost))} | ${median(dmg.map((x) => x.damage))} | ${r1(median(dmg.map((x) => x.damage / Math.max(1, x.cost))))} | ${Math.round((100 * ts.filter((x) => x.verbs.some((v) => UTILITY.includes(v) && v !== 'area')).length) / ts.length)}% |`,
      );
    }
    out.push(
      '',
      `## ${packId}: cheapest damage for its rank (top 15 damage per chakra)`,
      '',
      '| Technique | Rank | Effective cost | Damage power | Per chakra | Verbs |',
      '| --- | --- | --: | --: | --: | --- |',
    );
    for (const x of techs
      .filter((y) => !y.breath && y.damage > 0)
      .sort((a, b) => b.damage / b.cost - a.damage / a.cost)
      .slice(0, 15))
      out.push(
        `| ${x.t.name} | ${x.rank} | ${x.cost} | ${x.damage} | ${r1(x.damage / x.cost)} | ${x.verbs.join(', ')} |`,
      );
    out.push(
      '',
      `## ${packId}: hard-hitting control (daze, pin, seal, confuse) by cost`,
      '',
      '| Technique | Rank | Effective cost | Verbs |',
      '| --- | --- | --: | --- |',
    );
    for (const x of techs
      .filter((y) => y.verbs.some((v) => ['daze', 'pin', 'seal', 'confuse'].includes(v)))
      .sort((a, b) => a.cost - b.cost)
      .slice(0, 15))
      out.push(`| ${x.t.name} | ${x.rank} | ${x.cost} | ${x.verbs.join(', ')} |`);
    // Casts per full tank and how much of a cast one exchange's regen pays, for each rank's typical user.
    const typical: Record<string, string> = {
      E: 'genin',
      D: 'genin',
      C: 'chunin',
      B: 'jonin',
      A: 'jonin',
      S: 'kage',
    };
    out.push(
      '',
      `## ${packId}: what a typical user pays (cost after control, against the median pool of the rank that uses it)`,
      '',
      '| Rank | User | Pool | Control | Median cost | Casts per tank | Regen pays per exchange |',
      '| --- | --- | --: | --: | --: | --: | --: |',
    );
    for (const rank of RANKS) {
      const users = pools.filter((p) => p.rank === typical[rank]);
      const ts = techs.filter((x) => x.rank === rank && !x.breath);
      if (users.length === 0 || ts.length === 0) continue;
      const pool = median(users.map((p) => p.pool));
      const control = median(users.map((p) => p.control));
      const cost = Math.max(
        1,
        Math.round(median(ts.map((x) => x.cost)) * (1 - Math.min(1 / 3, control / 60))),
      );
      const regen = Math.max(2, Math.round(pool * REGEN_SHARE));
      out.push(
        `| ${rank} | ${typical[rank]} | ${pool} | ${control} | ${cost} | ${r1(pool / cost)} | ${Math.round((100 * regen) / cost)}% |`,
      );
    }
    out.push('');
  }
  writeFileSync(new URL('./RESULTS-data.md', import.meta.url), out.join('\n'));
});
