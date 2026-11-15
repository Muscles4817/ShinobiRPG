# Foes who think ahead: the first bench

Step 5 of the objective-driven combat AI (`docs/design/combat-ai-plan.md` Part 13), first part: the
planner from the prototypes, in the engine (`engines/plan/mind/planner/`), driving foes in a fight
that tries it (`CombatExperiments.planner`, the "Foes think ahead" rule on trial in versus).

How a thinking foe decides:

- **When:** once a round, as it begins. It announces its plan's steps one exchange at a time,
  and plays as it always has once they're spent.
- **When it re-plans mid-round:** only on a cheap check (Part 8, rule 1): its next step can't be
  played, or a fact the step relied on didn't come true.
- **What it scores:** single first cards, plus pairs where the first card makes true what the
  second needs (`facts.ts`). The pairs are proposed from verbs and fields, never from names.
- **How it scores:** each candidate is played in the real engine, two exchanges deep, over seeds
  of its own.
- **What it aims for:** the objective it holds (step 4) weighs the outcome (`value.ts`).
  - Survive minds its own hurt more.
  - Recover values chakra and breath coming back (the experiment in
    `prototypes/objectives/RESULTS.md`).
  - Keeping distance values ending at home.
  - Find values no foe left hidden.
- **How much it searches:** set by its intellect tier (`ladder.ts`), inside the round's budget
  (900 simulated exchanges a round one against one).

Reproduce: `VITE_BENCH_REPORT=true npx vitest run src/test/bench/planner.test.ts --silent=false`.

## The run

The setup:

- Every ordered pair of the 22-member bench cast at chūnin, watched, two seeds: 968 fights.
- Each fight is played twice on the same seed: once with the foe on today's AI, once with it
  thinking ahead.
- The player's side plays as it always has.

Overall:

| Foe            | Wins  | Health margin (foe − player) | Time a fight (bench machine) |
| -------------- | ----- | ---------------------------- | ---------------------------- |
| Today's AI     | 47.4% | −0.056                       | 16 ms                        |
| Thinking ahead | 51.2% | +0.010                       | 129 ms                       |

By foe:

| Foe         | Wins, today | Wins, thinking | Margin, today | Margin, thinking |
| ----------- | ----------- | -------------- | ------------- | ---------------- |
| rusher      | 59%         | 61%            | 0.18          | 0.14             |
| powerhouse  | 61%         | 68%            | 0.08          | 0.06             |
| versatile   | 64%         | 73%            | 0.18          | 0.36             |
| illusionist | 84%         | 84%            | 0.38          | 0.47             |
| stalker     | 39%         | 59%            | 0.06          | 0.15             |
| mistBlade   | 61%         | 52%            | 0.12          | 0.12             |
| areaCaster  | 64%         | 66%            | 0.29          | 0.39             |
| sealer      | 23%         | 25%            | −0.30         | −0.34            |
| trapper     | 27%         | 32%            | −0.22         | −0.11            |
| medic       | 75%         | 73%            | 0.13          | 0.35             |
| sensor      | 45%         | 55%            | 0.02          | 0.05             |
| cloner      | 86%         | 84%            | 0.42          | 0.43             |
| counterer   | 64%         | 61%            | 0.13          | 0.19             |
| shrouded    | 52%         | 50%            | 0.01          | −0.06            |
| summoner    | 23%         | 34%            | −0.36         | −0.19            |
| puppeteer   | 9%          | 18%            | −0.64         | −0.52            |
| hive        | 2%          | 9%             | −0.65         | −0.63            |
| dust        | 14%         | 16%            | −0.48         | −0.40            |
| gates       | 66%         | 77%            | 0.06          | 0.19             |
| assassin    | 11%         | 41%            | −0.66         | −0.23            |
| foresight   | 57%         | 43%            | 0.01          | −0.11            |
| mimic       | 57%         | 45%            | 0.00          | −0.10            |

## What it says

- **Thinking foes fight better overall**, and most clearly where a kit has a combination today's
  AI doesn't play:
  - the assassin (11% → 41%), the hide-then-killing-blow line the prototype found;
  - the stalker (39% → 59%);
  - the gates fighter, the summoner and the puppeteer.
- **Three get worse:** the foresight fighter, the mimic and the mist blade. Their strength lies in
  what the engine does around their cards: eyes that see an attack coming, copying a technique
  once watched, hiding in mist.
  - Two exchanges of rollouts may not show what those are worth.
  - Or the plan's steps may override a kit play today's AI makes at the right moment.

  A first look, counting what they played over the same fights:
  - The foresight fighter threw kunai 94 times thinking, against 74 on today's AI. It used
    its fire technique 339 times, against 379.
  - The mist blade threw a plain blow 10 times against 0, and played its third cut 54 times
    against 85.

  So the planner sometimes settles on a weaker plain card. The likeliest cause is rollout noise
  at a two-exchange horizon: a few seeds can't tell a technique's real edge from luck. That
  needs diagnosing before the planner becomes the default (step 5's next part).

- **It costs about eight times as much a fight.** That is well inside the round budget, but
  enough that it must run off the main thread before it is the default (Part 7: a Web Worker).

Still to do in step 5:

- the three regressions;
- teams;
- other grades and the bestiary;
- the per-device timing;
- absorbing today's special-case modules one at a time (Part 10).
