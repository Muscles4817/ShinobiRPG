# Planner performance: what each approach costs and what it keeps

This compares ways to make the prototype planner (`../beam.ts`) cheaper. Each one is measured on
speed **and** on decision quality against a generous real-engine reference. It is a throwaway
measurement. Nothing under `src/` was changed. Every number below comes from the runs recorded
in `out/` (machine-readable rows in `out/*.json`, every table in `out/tables.md`).

## Method

- **Decision states (42).**
  - The two prototype scenarios (daze → finisher, hide → killing blow), taken at exchanges 0, 2
    and 5 of a default-plan fight.
  - Twelve one-on-ones between bench builds (`matrixCast.ts`, chūnin scale), also at exchanges 0,
    2 and 5. The first fighter of each pair plans: rusher, versatile, stalker, assassin, sealer,
    medic, area caster, gates, illusionist, mist blade, trapper and counterer, against varied foes.
  - All seeded (`states.ts`).
- **Reference.** The real-engine planner, more generous than the prototype on every axis
  (`reference.ts`):
  - every first card extended by every card (depth 2, unbounded width);
  - 64 rollouts, on a seed stream no approach uses;
  - a first card's reference value is its best pair's mean.

  It costs 6,690 exchanges and 4.6 s per state.

- **Reference noise.** The same reference split into two halves of 32 seeds and judged against
  itself:
  - agreement 76%;
  - within 2 of the best 86%;
  - regret mean 0.8, worst 9.5.

  No approach can be told apart from the reference by much less than that.

- **Metrics.**
  - **agree**: the approach chose the reference's best first card, or one the reference values
    exactly as high. 26 of the 42 states have near-ties, often exact ones: step-back, Evade and
    Brace often lead to identical outcomes.
  - **near best**: within 2 health points of the best.
  - **regret**: the reference value of the reference's best first card, minus the reference value
    of the approach's first card. Mean and worst over the 42 states.
  - **combos**: what each approach plays at `daze@0` and `hide@0`.
  - **closed loop**: 30 fights for each prototype scenario, capped at 8 exchanges, re-planning
    every exchange (`closed.ts`, as `fight.ts`).
- **Timing.**
  - The comparison runs had 2 to 4 test processes running side by side on a 4-core machine, so
    their ms columns are inflated and noisy. Use them to compare rows with each other.
  - The key approaches were timed again alone, loud and silent (`silent/timing.test.ts`). Those
    are the ms figures quoted in the recommendation.
  - "exchanges" counts real `playExchange` calls actually played.

## Per-exchange cost, and how it scales

| Fight                      | loud µs / exchange | silent µs / exchange |
| -------------------------- | -----------------: | -------------------: |
| 1v1 (planner states, mean) |            580–690 |              410–520 |
| 1v1 (first exchanges)      |              1,080 |                  872 |
| 2v2 (first exchanges)      |              1,848 |                1,129 |
| 3v3 (first exchanges)      |              2,557 |                2,252 |

- The fixed cost of a decision outside the exchanges (listing cards, the engine's slot check per
  card) is 0.05 ms. Essentially all the cost is exchanges.
- An exchange costs roughly linearly in fighters: about 0.8 ms per fighter at the start of a fight.
- A planner's cost is exchanges per decision × cost per exchange × deciding fighters. The cards
  per fighter, and so the candidates, don't shrink with more fighters.
- At about 0.45 ms per silent 1v1 exchange, **the 2 ms bar buys about four real exchanges per
  decision.** Every approach below that keeps any lookahead in the real engine simulates 100 to
  2,000.

## Results

### Exact (decisions identical to the prototype's)

| Approach                           | ms median (alone) | exchanges | agree | near best | regret mean / worst | daze@0            | hide@0       |
| ---------------------------------- | ----------------: | --------: | ----: | --------: | ------------------: | ----------------- | ------------ |
| Prototype beam d2 w4 r16           | 1,222 (contended) |     1,708 |   62% |       83% |          2.4 / 51.4 | step-back > spark | veil > blade |
| + prefix sharing (E1)              |               568 |       970 |   62% |       83% |          2.4 / 51.4 | step-back > spark | veil > blade |
| + prefix sharing + silent exchange |               444 |       970 |   62% |       83% |          2.4 / 51.4 | step-back > spark | veil > blade |

- **Prefix sharing** (`sim.ts`): the state after each prefix is kept per seed, so the first
  exchange of every child is played once.
  - It gave identical values and choices to `beam.plan` on 42 of 42 states (`exact.test.ts`).
  - Exchanges fell 43%, from 1,708 to 970.
  - The "default continuation duplication" is part of the same saving: `[a]` followed by the
    default plan now reuses `[a]`'s first exchange.
- **Silent exchange** (`silent/`): the narration entry points are mocked to a constant, and the
  story log is emptied before each exchange.
  - **The first outcome check failed.** With the narration mocked to return `''`, 143 of 2,648
    three-exchange rollouts differed from the loud ones (5.4%), in health, breath, chakra,
    intents, reads and results.
  - Bisecting the mocks found the cause: only `tell` returning an _empty_ string changes
    anything. Returning the template, a constant `'x'`, or the real text changes nothing (0 of
    1,324). Emptying the log changes nothing (0 of 2,648).
  - So some rule branches on whether a told line is empty. It doesn't read the line's content.
    I did not find the reading site. It is worth finding before a production silent mode is
    built.
  - With non-empty constants and an empty log, outcomes were **identical** in 2,648 of 2,648
    rollouts (7,900 exchanges over all 42 states and every first card). That configuration is
    the one used.
  - It saves 14–35% per exchange, about a quarter typically (615 → 472 µs for E1 alone; 583 → 408 µs at r32). That is
    smaller than the profile's 26% narration share implied, because `choose`, voice marks and
    staging still run.
- Together, prefix sharing and silence take the same decisions from 1,222 ms to 444 ms, 2.75×
  faster at no cost.

### Width, depth and rollouts (all with prefix sharing)

| Approach               |          ms median | exchanges |   agree | near best | regret mean / worst | daze@0                    | hide@0                |
| ---------------------- | -----------------: | --------: | ------: | --------: | ------------------: | ------------------------- | --------------------- |
| greedy d1 r16          |                 72 |       126 |     52% |       64% |    **17.6 / 194.8** | spark                     | **blade** (misses)    |
| d2 w1 r4               |     69 (50 silent) |       111 |     48% |       79% |          3.2 / 44.4 | flash > burst             | veil > blade          |
| d2 w4 r4               |                134 |       239 |     55% |       81% |          2.7 / 44.4 | flash > burst             | veil > blade          |
| d2 w2 r8               |                171 |       310 |     57% |       81% |          2.8 / 44.4 | flash > burst             | veil > blade          |
| d2 w4 r8               |   297 (217 silent) |       484 |     60% |       83% |          1.7 / 24.3 | flash > burst             | veil > blade          |
| d2 w1 r16              |                329 |       445 |     67% |       83% |          3.9 / 51.4 | flash > burst             | veil > blade          |
| d2 w2 r16              |                369 |       624 |     62% |       81% |          2.9 / 51.4 | step-back > spark         | veil > blade          |
| d2 w4 r32              | 1,184 (801 silent) |     1,945 | **86%** |   **98%** |       **0.2 / 2.5** | flash > burst             | veil > blade          |
| d3 w2 r8               |                455 |       734 |     57% |       81% |          2.6 / 41.2 | step-back > flash > burst | veil > blade > strike |
| selective d1→d2 r8 w2  |                150 |       268 |     57% |       81% |          2.8 / 44.4 | flash > burst             | veil (+ default)      |
| selective d1→d2 r16 w4 |                530 |       896 |     62% |       83% |          2.4 / 51.4 | step-back > spark         | veil (+ default)      |

- **Rollouts are what matter, not width.**
  - Width 1 to 4 barely moves quality at a fixed seed count.
  - Going from 16 to 32 seeds takes regret from 2.4 to 0.2 and the worst case from 51 to 2.5.
  - The prototype's live setting (r16) chose step-back over the Lantern Flash at `daze@0` on its
    seeds 1..16. The reference values the Flash 9 points higher. That is noise: r4, r8 and r32
    all pick the Flash.
- **Greedy (depth 1) is the only setting that loses the combos.** It throws the Wick Blade
  unhidden (regret 195 at `hide@2`) and never plays the Flash.
- **Depth 3 bought nothing at r8** over depth 2: its horizon is longer, but it has the same noise.
- **Selective depth works as designed but saves little.** First-step values are seldom clear: it
  deepened 33 to 37 of 42 times. At r8 it finds the daze combo and plays the Veil (with the
  default plan after, which then throws the Blade).

### Goal-directed candidates and pruning

| Approach                   | ms median          | exchanges | agree | near best | regret mean / worst | daze@0                    | hide@0           |
| -------------------------- | ------------------ | --------: | ----: | --------: | ------------------: | ------------------------- | ---------------- |
| racing 4→32 keep 4         | 1,105              |     1,136 |   79% |       95% |          0.7 / 24.3 | flash > burst             | veil > blade     |
| racing 2→16 keep 2         | 350 (257 silent)   |       563 |   67% |       88% |      **0.8 / 10.6** | step-back > spark         | veil > blade     |
| racing 1→8 keep 2          | 208                |       279 |   52% |       76% |          4.3 / 52.0 | step-back > spark         | veil > blade     |
| GOAP pairs r16             | 211                |       333 |   67% |       83% |          2.1 / 41.2 | flash (+ default)         | veil (+ default) |
| **GOAP pairs r8**          | **96 (81 silent)** |   **166** |   57% |   **86%** |      **1.7 / 24.3** | flash (+ default)         | veil (+ default) |
| GOAP pairs r4              | 107 (contended)    |        83 |   50% |       81% |          3.0 / 44.4 | flash (+ default)         | veil (+ default) |
| GOAP pairs + width 1 r8    | 160                |       259 |   57% |       86% |          1.7 / 24.3 | flash (+ default)         | veil (+ default) |
| GOAP candidates raced 2→16 | 78                 |       127 |   60% |       81% |          2.8 / 41.2 | **step-back** (+ default) | veil (+ default) |
| GOAP candidates raced 4→32 | 176 (105 silent)   |       253 |   71% |       83% |          2.5 / 41.2 | flash (+ default)         | veil (+ default) |

- **Racing (successive halving)** spends seeds where the race is close. At about the same cost it
  gives the best regret short of r32: 2→16 has regret 0.8 against E1's 2.4 at 58% of E1's
  exchanges. But at `daze@0` the pruning at 2 seeds still lets step-back through.
- **GOAP candidates** (`goap.ts`) score every first card followed by the default plan, plus only
  the pairs where the first card makes a precondition of the second true.
  - Facts come from the technique data and verbs, never from names:
    - `open` is made by daze and pin;
    - `unseen` is made by conceal;
    - `boosted` is made by empower, shroud and clone;
    - `at:<band>` is made by a step;
    - a finisher needs `open`, a killing blow needs `open` or `unseen`, a wounding card is helped
      by `boosted`, and a short-reach card needs its band.
  - This cuts exchanges by 83% against E1 (166 against 970) at **better** regret (1.7 against
    2.4).
  - It finds the opening of both prototype combos. Its best-scored sequence is "Flash, then the
    default plan", which plays the Burst when the foe is open, so the scored pair and the
    default continuation tie in value.
  - It also finds the **bench's own set-up kill**: the assassin's Paper Veil (conceal) then
    Pinched Flame (lethal), from the original pack. The reference's best line at
    `assassin-v-sensor@2` and `@5` is Paper Veil > Pinched Flame. The prototype's own setting
    (E1, r16) misses it at both states (regret 13 and 51) and throws the Pinched Flame unhidden.
    GOAP r8 finds it at @5, and r16 at both.
- **Its blind spot:** a two-step idea the schema has no fact for. At `counterer-v-powerhouse@5` it
  plays Return Current where stepping back is 24 points better. Stepping back out of a
  powerhouse's reach is a value only the full beam (or a width-1 extension) sees.

### Lightweight approximate evaluation

| Approach                        | ms median            | real exchanges | model evals | agree | near best | regret mean / worst | daze@0                | hide@0               |
| ------------------------------- | -------------------- | -------------: | ----------: | ----: | --------: | ------------------: | --------------------- | -------------------- |
| approx model d2                 | **3.8 (3.2 silent)** |              0 |         197 |   43% |       60% |      **8.0 / 55.8** | flash > burst         | veil > blade         |
| approx model d3                 | 73                   |              0 |       3,698 |   48% |       64% |          7.3 / 45.3 | flash > flash > burst | veil > blade > blade |
| hybrid: approx top 2 → real r8  | 131 (103 silent)     |            209 |         197 |   45% |       64% |          7.0 / 55.8 | flash > burst         | veil > blade         |
| hybrid: approx top 3 → real r16 | 368                  |            628 |         197 |   52% |       71% |          5.6 / 44.4 | step-back > spark     | veil > blade         |

- The model (`approx.ts`) is an expected-value exchange built from the engine's pure reckonings.
  - `cardWorth` from `worth.ts` gives avoid odds × gap damage.
  - `avoidOdds`, `conditionResist` and `searchChance` give the odds of a daze or pin taking hold
    and of a conceal holding.
  - `LETHAL_SCALE` applies to a killing blow that strikes to kill.
  - Steps move the distance.
  - The foe's telegraph, then its best card, answers each exchange.
- **It finds both prototype combos, at 3–4 ms**, about 200 model evaluations. It is the only
  approach anywhere near the 2 ms bar.
- **It is not good enough to decide.**
  - 60% of its choices are within 2 of the best, and its mean regret is 8.
  - It ignores ready defences, counters, clones, rows, breath and summons. For example it
    chooses Evade at `assassin-v-sensor@5`, where the reference's Paper Veil is worth 56 more.
  - Its estimate of each `cardWorth` call is also not cheap: about 15–20 µs per model step.
- **Hybrids inherit the model's misses.** Its top 2 or 3 often doesn't contain the right first
  card (near best 64–71%), and the real engine can only pick among what it was given.

### Cached or precomputed estimates

| Approach                            | ms median | exchanges | agree | near best | regret mean / worst | hits                                                          |
| ----------------------------------- | --------: | --------: | ----: | --------: | ------------------: | ------------------------------------------------------------- |
| leaf memo, fine key (d2 w4 r16)     |       579 |       907 |   62% |       83% |          2.4 / 51.4 | 8% of leaf exchanges                                          |
| leaf memo, coarse key (d2 w4 r16)   |       506 |       845 |   62% |       83% |          2.4 / 51.4 | 15% of leaf exchanges                                         |
| decision table, coarse key, offline |        99 |       167 |   57% |       81% |          2.8 / 44.4 | 20/42 states, 14 of them the fight-opening states (see below) |

- **Leaf memo (within a decision)** memoises a sequence's last exchange by the abstract state it
  starts from, the card and the seed. The abstract state is distance, health and chakra buckets,
  conditions and telegraphs.
  - Only 8 to 15% of leaf exchanges hit, so it saves at most 13% of exchanges.
  - It took identical decisions to E1 on these states, but that is luck, not a guarantee: a hit
    reuses another state's health change.
  - The key itself (JSON of conditions) eats part of the saving.
- **Decision table (across decisions, offline)** is filled from 325 planner decisions in
  default-plan fights on seeds the decision states never use. A miss falls back to d2 w2 r8 and
  fills the table.
  - It hit 20 of 42 states, but 14 of those are the fight-opening states, which are the same
    state in every fight of a matchup. Only 6 of the 28 later states hit.
  - Its quality is its fallback's. Hits don't hurt or help measurably.
  - A table keyed on abstract state helps exactly where the state repeats: the opening
    decision, which can be precomputed per matchup. Elsewhere, health and chakra buckets almost
    never repeat in a one-on-one.

### Closed loop (30 fights each, cap 8 exchanges)

| Approach                             | daze-finish: won, dealt / taken | hide-lethal: won, dealt / taken | ms / decision (contended) | what it played                |
| ------------------------------------ | ------------------------------: | ------------------------------: | ------------------------: | ----------------------------- |
| default plan                         |                   2/30, 67 / 99 |                  11/30, 87 / 66 |                         0 | —                             |
| greedy d1 r16                        |                   2/30, 61 / 99 |                  12/30, 87 / 66 |                        45 | spark, spark / blade, blade   |
| E1 = prototype (d2 w4 r16)           |                   6/30, 51 / 50 |              **30/30, 100 / 6** |                       411 | kites: step-back ×30          |
| racing 2→16 keep 2                   |                   6/30, 50 / 52 |                  30/30, 100 / 6 |                       200 | kites                         |
| d2 w4 r32 (closest to the reference) |              **19/30, 88 / 77** |                  30/30, 100 / 6 |                       635 | flash > burst ×22             |
| d2 w1 r4                             |              **19/30, 87 / 76** |                  30/30, 100 / 6 |                        35 | flash > burst ×22             |
| GOAP pairs r8                        |                  15/30, 80 / 61 |                  30/30, 100 / 6 |                       104 | flash > burst ×22             |
| GOAP candidates raced 4→32           |                  14/30, 81 / 64 |                  30/30, 100 / 6 |                       103 | flash > burst ×22             |
| hybrid: approx top 2 → real r8       |                  15/30, 80 / 62 |                  30/30, 100 / 6 |                        76 | flash > burst ×22             |
| approx model d2                      |                   4/30, 78 / 68 |                  30/30, 100 / 6 |                         2 | flash > burst ×22, then worse |

Rows read: wins out of 30, then mean health dealt / taken. The "flash > burst ×22" openings are
the same across planners because the second card depends on whether the Flash dazed: 22 times it
did; 8 times it didn't, and they Flash again.

- **Hide → killing blow survives every approach except greedy:** 30 of 30 wins, Veil > Blade
  every time.
- **Daze → finisher is where approaches differ, and the prototype's setting was the unlucky
  one.**
  - The planner closest to the reference (r32) plays Flash > Burst and wins 19 of 30, against
    the prototype's 6 of 30, where it mostly stepped back out of reach.
  - The README's account of the live fights ("mostly stepped back out of reach") describes
    r16's noise, not the planner's real preference.
  - The kiting also scores worse on the planner's own objective over the fight: dealt minus
    taken is +1 for E1 against +11 for r32.
- **Approx model alone** opens with the combo but loses the fights (4 of 30). Its later
  decisions, where defences and positioning matter, are poor.

## What each approach loses, and why

- **Prefix sharing, silent exchange:** nothing. They are exact, and checked. The silent exchange
  must keep told lines non-empty: a rule reads whether a line is empty.
- **Fewer rollouts:** robustness. With few seeds the beam picks on noise, and the misses are big
  when they happen: assassin @5 at 44–51, all from too few seeds. Common random numbers
  help comparisons but don't remove that.
- **Narrow width or selective depth:** little on these states. Most of the decision is the first
  card, and the second card is the obvious pay-off.
- **Depth 1 (greedy):** the combos. It is the one cut that destroys emergence.
- **GOAP candidates:**
  - Two-card ideas with no symbolic fact, such as stepping out of a foe's reach to change its
    choices, or a bait. The default continuation recovers some of them.
  - A schema to maintain. Today it is 6 verbs and 3 technique fields.
- **Racing:** the cheap end (1→8) prunes good candidates on one or two seeds.
- **Approximate model:** everything the model doesn't model. It is the only family that is fast,
  and the least accurate by far. A model good enough to decide would have to carry the ready
  defence, counters and reach, which is to say most of the exchange.
- **Caching:** little, because states don't repeat. Only fight openings are worth tabulating.

## Recommendation

**Use GOAP-generated candidates, scored by the real engine with prefix sharing and a silent
exchange, over 8 rollouts, and precompute each matchup's opening decision.**

- **Cost:** about 81 ms median and 160 ms p95 per decision in a 1v1 (silent, measured alone),
  about 166 real exchanges.
  - That is about 12× cheaper than the prototype's live planner (about 1,000 ms alone: its 1,708
    exchanges at E1's per-exchange cost; 1,222 ms in the contended run), and 7× cheaper than E1
    loud (568 ms).
  - At 3v3 an exchange costs about 2.5× as much, so expect about 200 ms per deciding fighter.
- **What it keeps:**
  - Quality is better than the prototype's setting: regret mean 1.7 against 2.4, worst 24
    against 51, and 86% near best against 83%.
  - It finds the opening of both prototype combos, and the bench assassin's real-content
    set-up kill.
  - In closed loop it wins hide → blade 30 of 30 and daze → finisher 15 of 30 (prototype
    setting 6, default plan 2).
- **Where more seeds pay:**
  - If quality matters more than cost, race the GOAP candidates 4→32: 105 ms silent, 71% agree.
  - If every two-card idea must stay visible, race all pairs 2→16: 257 ms silent, regret 0.8,
    the best regret per exchange spent.
- **The 2 ms bar is not reachable with real-exchange rollouts.**
  - It is about 4 real exchanges, and nothing that keeps lookahead used fewer than about 100.
  - The only approach under 5 ms is the approximate model, and it isn't accurate enough to decide.
- **Honest paths from here:**
  1. **Decide less often.** Plan once per round rather than per exchange (a 4× saving), and only
     for fighters whose tactical intelligence warrants a planner (a dull mind uses its default
     plan, as the design already says).
  2. **Move the budget off the frame.** A plan computed between rounds, while the watch screen
     plays, can take tens of milliseconds per fighter without anyone waiting.
  3. **Build a much better abstract model, using the real engine as its check.** The model
     tested here, about 200 lines on the engine's own `worth.ts` reckonings, already finds both
     prototype combos at 3–4 ms but mis-ranks half the bench states. It would need to model
     ready defences, counters and reach first. The real-engine planner at r32 (regret 0.2) makes
     a usable referee for that, and the decision states and reference here can be its bench.

  The provisional 2 ms target should be revisited against those, not met by cutting depth to 1,
  which is the one change that loses the emergent combinations.

## Running it

```bash
# reference (≈ 3.5 min), then the comparison parts (≈ 5–10 min each, can run side by side)
npx vitest run --config prototypes/combat-planner/perf/vitest.config.ts prototypes/combat-planner/perf/reference.test.ts
npx vitest run --config prototypes/combat-planner/perf/vitest.config.ts prototypes/combat-planner/perf/compare-a.test.ts   # also -b, -e, -d
CLOSED='tag:default|GOAP pairs r8' npx vitest run --config prototypes/combat-planner/perf/vitest.config.ts prototypes/combat-planner/perf/closed.test.ts
# exactness of prefix sharing (≈ 2.5 min)
npx vitest run --config prototypes/combat-planner/perf/vitest.config.ts prototypes/combat-planner/perf/exact.test.ts
# silent exchange: outcome checks, uncontended timing, scaling (run alone for timing)
npx vitest run --config prototypes/combat-planner/perf/silent/vitest.config.ts
# tables from out/*.json
npx vitest run --config prototypes/combat-planner/perf/vitest.config.ts prototypes/combat-planner/perf/report.test.ts
```

Files:

- `sim.ts`: the real-engine forward model with prefix sharing and an exchange count.
- `planners.ts`: beam, selective depth, racing, GOAP.
- `goap.ts`: the precondition schema.
- `approx.ts`: the approximate model and the hybrids.
- `cache.ts`: the leaf memo and the decision table.
- `states.ts`: the decision states.
- `reference.ts`: the reference.
- `compare.ts`: the metrics.
- `closed.ts`: closed-loop fights.
- `silent/`: the mocked narration, outcome checks, timing and scaling.

The main prototype config now excludes `perf/`, so the original four-minute run is unchanged.
