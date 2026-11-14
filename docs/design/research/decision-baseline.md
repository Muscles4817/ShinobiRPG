# Decision baseline: why today's AI chooses what it chooses

Step 1 of the objective-driven combat AI (`docs/design/combat-ai-plan.md` Part 13). Every way the
Plan & Watch engine picks a card now carries its reason, and a fight traced through
`CombatSetup.trace` keeps them (`engines/plan/decisionLog.ts`, `whyShape.ts`). The reasons are
tags on the picks, not worked out afterwards, and a traced fight ends exactly as untraced
(`src/test/bench/decisionLog.test.ts`).

Reproduce: `VITE_BENCH_REPORT=true npx vitest run src/test/bench/decisionLog.test.ts -t baseline --silent=false`.

## The run

Every ordered pair of the 22-member bench cast at chūnin, watched (both sides by their own
judgement), 3 seeds each: 1,452 fights. Foes' announcements were played as told 87.5% of the
time; the rest were rethought at the turn.

| Reason       | Player side turns | Foe turns | Foe announcements |
| ------------ | ----------------- | --------- | ----------------- |
| emergency    | 3.0%              | 0.2%      | 2.1%              |
| climb        | 0.3%              |           | 0.2%              |
| setup        | 4.7%              |           | 3.1%              |
| survival     | 0.8%              | 0.0%      | 0.8%              |
| call         | 0.1%              |           | 0.4%              |
| charge       | 0.5%              |           | 0.2%              |
| step-to      | 17.3%             | 2.4%      | 10.7%             |
| slot         | 48.4%             | 3.7%      | 35.4%             |
| counter-pick |                   |           | 0.3%              |
| change-up    | 7.5%              | 0.2%      | 4.3%              |
| looking      | 2.4%              | 0.0%      | 1.3%              |
| improvised   | 13.9%             | 0.1%      | 8.3%              |
| sight        |                   | 0.0%      | 0.7%              |
| senses       |                   | 0.0%      | 0.8%              |
| killer       |                   | 0.1%      | 0.4%              |
| kit-call     |                   | 0.0%      | 0.2%              |
| kit-setup    |                   | 0.0%      | 0.9%              |
| prep         |                   | 0.1%      | 1.0%              |
| heal         |                   | 0.0%      | 0.6%              |
| shelter      |                   | 0.0%      | 0.1%              |
| gather       |                   | 0.0%      | 0.1%              |
| footwork     |                   | 2.2%      | 5.1%              |
| daze-first   |                   | 0.1%      | 1.0%              |
| finisher     |                   | 0.0%      | 0.1%              |
| weighted     |                   | 1.2%      | 18.5%             |
| nothing      |                   | 1.5%      | 3.4%              |
| announced    |                   | 87.0%     |                   |
| clash        | 1.2%              | 0.8%      |                   |
| aid          |                   | 0.1%      |                   |

A foe's turn is mostly "announced": the reason that matters for it is in the announcements
column, where its plan (slot, step-to, change-up…) or its instinct (weighted, footwork…) chose.

## What it says

- **Plans run on the first slot that qualifies.** About half of every plan's turns are its first
  qualifying slot; the special cases (set-ups, ladders, summons, survival) together are under a
  tenth. Most of what makes a fighter look clever is the order its slots were put in.
- **Getting to a distance costs a lot of turns.** Stepping to the distance a kit fights from is
  17% of the player side's turns and 11% of the foes' announcements, before any entry or charge.
- **One turn in seven is improvised.** When nothing slotted qualifies (out of chakra, nothing in
  reach, the target held), the plan throws a plain blow (13.9% of player-side turns). That's where
  a planner has most to gain: those turns are the plan running out, not a choice.
- **Instinct is mostly a weighted draw.** When a foe leaves its plan (the adherence coin), 18.5%
  of all announcements are a weighted pick among its attacks and footwork. The rules that look
  ahead (daze first, then finish) fire in about 1% of them.
- **Reads barely change anything.** Counter-picks against a seen defence are 0.3% of
  announcements; change-ups against a read pattern are 4–8%.

These are the numbers the objective-driven planner is measured against: fewer improvised and
"nothing" turns, more turns that set up the next, and wins, at equal stats.
