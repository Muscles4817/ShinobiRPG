# Objectives in shadow: what the layer chose beside today's AI

Step 4 of the objective-driven combat AI (`docs/design/combat-ai-plan.md` Part 13). Every
fighter now reads the fight each exchange (`engines/plan/mind/assess.ts`), chooses an objective
(`mind/objectives.ts`, Part 6) and holds it with a margin set by their discipline, with a few
moments taking over at once (a killer in reach, nobody to fight, a foe to finish). The objective
is written into the decision log beside each move. **No move changes:** a bench plays the same
fights with and without objectives and checks every decision is the same
(`src/test/bench/objectives.test.ts`).

Reproduce:
`VITE_BENCH_REPORT=true npx vitest run src/test/bench/objectives.test.ts -t prints --silent=false`.

## The run

Every ordered pair of the 22-member bench cast at chūnin, watched, two seeds: 968 fights and
24,006 turns. Objectives were held 3.4 exchanges in a row on average.

| Objective        | Share of turns | Today's move served it | Moves for it made under another |
| ---------------- | -------------- | ---------------------- | ------------------------------- |
| wear-down        | 63.4%          | 70%                    | (any attack)                    |
| finish           | 12.5%          | 75%                    | (any attack)                    |
| set-up           | 3.3%           | 96%                    | 665                             |
| survive          | 1.1%           | 74%                    | 2,280                           |
| control-distance | 9.9%           | 77%                    | 3,300                           |
| recover          | 4.7%           | 0%                     | 402                             |
| find             | 4.3%           | 44%                    | 172                             |
| escalate         | 0.8%           | 47%                    | 214                             |

"Served" reads what the card does (an attack serves wearing down, a hold or a hiding a set-up, a
step or a move technique distance, Gather or a heal recovery, and so on).

## What it says

- **Most of the time they agree.** Wearing down and finishing are most turns, and today's AI
  attacks on most of them. Where it doesn't, it is mostly stepping (its plan's distance) or
  readying.
- **Recovering is where they part.** Casters who have run dry of chakra (the illusionist, the
  medic, the sensor, the foresight and mimic fighters) hold "recover"; today's AI has them throw
  improvised blows and back off instead, and never gathers. Either the layer overvalues rest or
  today's AI wastes those turns; the planner (step 5) can settle it by playing both out.
- **Today's AI moves about more than the layer asks.** 3,300 steps and moves were made while the
  layer thought the fighter was already where its kit is strongest: kiting, zoning and stepping
  for a plan's set distance. Holds and swaps (2,280 moves that could serve survival) are mostly
  today's ordinary holds, thrown without any killer to answer.
- **Finding a hidden foe is half followed.** When nobody is in sight, today's AI searches or
  dispels on 44% of those turns and otherwise improvises.
- **Escalating is rarer in the layer than in today's AI.** Gates fighters climb from the kit on
  what the fight shows; the layer escalates when pressed, or as a climber's style, and still
  leaves 214 escalations made under other objectives. Worth watching once the planner acts.

These are the disagreements step 5 plays out: where the objective layer, through the planner,
does better than today's move, and where today's AI was right.
