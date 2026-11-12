# Planner experiments, round two

Three experiments asked for after the proof of concept: a defensive commitment mechanic and
whether a planner finds how to exploit it, where the planner's time goes and how to cut it, and
why the planner preferred stepping out of reach to Daze → Finisher. Nothing here changes
production combat code on `main`. The one rule tried (Experiment 1) lives only on this branch.

## Experiment 1: a Dodge leaps clear

### Choosing the mechanic

The first candidate was the Counter: a riposte leaves its user exposed until their next turn.
Checked against the turn order, it fails one-on-one:

- A Counter fires during the attacker's turn.
- The counterer's own turn, which closes the window, always comes before the attacker acts again.
- With a steady initiative order, the attacker never gets a turn inside the window.

It would only ever matter to a third fighter, a teammate. That may be worth having later, but the
planner prototype couldn't test it fairly.

The mechanic tested instead (`src/systems/combat/engines/plan/leap.ts`, on this branch only):
**a fighter who slips an attack up close with a Dodge ready leaps clear, and that pair ends at
mid.** In the world, dodging up close means jumping away.

- **Narrow:**
  - only a ready Dodge (a plain slip, an Evade or a substitution stays put);
  - only from close;
  - only the pair involved;
  - never for an illusion seen through.
- **Not a cost added for the planner's sake.** It is a positional consequence that cuts both ways:
  - a dodger who fights from range gets clear for free;
  - a close fighter who dodges must spend a turn coming back in, and may meet a hold-off;
  - an attacker who wants mid can throw a blow up close to make a dodger give it to them.

### Does the planner find how to exploit it? Yes, with nothing written for it

The scenario (`leap.test.ts`): you hold a strong Stone Sling (mid and far) and poor hand-to-hand,
starting up close. The foe is a quick, sharp-eyed brawler. Today's answer is to step back, a
contested step that costs the turn.

| Foe keeps | Rule        | Planner's best pair at the start | Planner's first move, 20 fights | Planner won | Default plan won |
| --------- | ----------- | -------------------------------- | ------------------------------- | ----------- | ---------------- |
| Dodge     | **leap on** | blow > blow (+0.3)               | **blow up close, 20 of 20**     | 16/20       | 15/20            |
| Dodge     | leap off    | step back > blow (−4.3)          | step back, 20 of 20             | 15/20       | 15/20            |
| Guard     | leap on     | step back > blow (−5.7)          | step back, 20 of 20             | 16/20       | 16/20            |
| Guard     | leap off    | step back > blow (−5.7)          | step back, 20 of 20             | 16/20       | 16/20            |

The planner switches to throwing a blow up close **only** when both the rule and a dodging foe
are present. The blow is worth something even when it misses, because the dodge hands over mid.
Nothing in the planner names the dodge, the leap or the idea of a bait.

The payoff in this scenario is small: one more win in twenty. The exploit is found, but it isn't
decisive here.

### Balance (benches, before and after, same seeds)

- **Every combat bench passes with the rule**, except the archetype matrix's CI check: one pair,
  Gates against the Assassin, crosses the band at the check's 8 seeds. At 100 seeds that pair was
  already outside the band before the change (91%, now 93%).
- **The full matrix at 100 seeds a pair:**
  - 285 pairs outside the band before, and 285 after;
  - the average cell moved 0.07 points;
  - only the Gates build moved, from 80% overall to 79%. Its largest change is against the
    Cloner, 73% to 65%.
- **Leaps are rare between AI fighters:** 1% of 2,772 watched matrix fights, almost all of them
  the Gates build, the only one whose default ready defence up close is a Dodge. The rule's
  weight falls where players choose Dodge.
- **The rest of the test suite:** one failure, a seeded versus fixture (`versus.test.ts`, a
  puppeteer's opening) whose order of events the leap shifts. The story-text goldens are
  unchanged.

### Recommendation

The rule is sound, narrow and nearly balance-neutral. It gives a capable planner something real
to exploit, and the planner exploits it unprompted. But it is not decisive, and it moves the
game's feel for anyone who keeps Dodge ready up close: they will find themselves at mid often.
Keep it on this branch until the owner has played a few fights with it. If adopted:

- update the versus fixture;
- add Gates against the Assassin to the known outliers;
- add a line to CLAUDE.md decision 16.

The Counter version is worth revisiting once teammates are planned, since they are the ones who
could use a riposte's opening.

## Experiment 2: where the planner's time goes, and how to cut it

The full comparison is in `perf/RESULTS.md`, with every row in `perf/out/`.

### Profile (`profiling/`)

| Where the time goes                          | Share             |
| -------------------------------------------- | ----------------- |
| Simulating the real exchange                 | 98% of a decision |
| State cloning, candidate generation, scoring | under 1% together |

A decision simulated about 1,750 real exchanges, at roughly 0.4–0.7 ms each for one against one.
Each exchange costs more as fighters are added: about 1.1 ms one against one, 1.8 ms two against
two and 2.6 ms three against three, early in a fight.

Inside the exchange, by self time:

| Work                                                                                 | Share |
| ------------------------------------------------------------------------------------ | ----- |
| Narration (story lines, voices, staging, status text), which the planner never reads | ~26%  |
| Rules maths                                                                          | ~19%  |
| Exchange bookkeeping                                                                 | ~15%  |
| The engine's own decisions for the fighters                                          | ~12%  |

The lever is **how many exchanges** are simulated, and only then what each costs.

### The approaches, against a real-engine reference on 42 decision states

The reference is every first card × every second card, 64 rollouts on its own seeds. The states
come from the two prototype scenarios and 12 bench-build one-on-ones, at three points in each
fight. Two measures:

- **Near best:** the chosen first card is within 2 points of the reference's best.
- **Regret:** the reference's value of its best card, less its value of the card chosen.

The reference's own noise, split in halves, is 76% agreement and 86% near best.

| Approach                                         |                            ms a decision (median) | Near best | Regret mean / worst | Keeps the emergent combos                                      |
| ------------------------------------------------ | ------------------------------------------------: | --------: | ------------------: | -------------------------------------------------------------- |
| Prototype (depth 2, width 4, 16 rollouts)        |                            444 (exact savings on) |       83% |            2.4 / 51 | hide only: noise loses daze                                    |
| Exact savings: shared prefixes + silent exchange | same decisions, 43% fewer exchanges, ~¼ less each |           |                     |                                                                |
| Greedy, depth 1                                  |                                                72 |       64% |          17.6 / 195 | **loses both**                                                 |
| Depth 2, width 1, 4 rollouts                     |                                                50 |       79% |            3.2 / 44 | both                                                           |
| Depth 2, width 4, 32 rollouts                    |                                               801 |   **98%** |       **0.2 / 2.5** | both                                                           |
| Racing (2 → 16 rollouts)                         |                                               257 |       88% |          0.8 / 10.6 | hide only                                                      |
| **GOAP-proposed candidates, 8 rollouts**         |                                  **81** (p95 159) |       86% |            1.7 / 24 | **both**, and a bench build's own (Paper Veil → Pinched Flame) |
| Approximate model, depth 2                       |                                           **3.2** |       60% |            8.0 / 56 | plays the openings, loses the fights                           |
| Hybrid: approximate top two → real engine        |                                               103 |       64% |            7.0 / 56 | both                                                           |
| Caches and an offline table                      |                                            99–506 |    81–83% |     2.4–2.8 / 44–51 | barely help: states rarely repeat                              |

Closed loop, 30 fights per scenario, as daze-finish / hide-lethal wins:

| Approach                 | Daze-finish | Hide-lethal |
| ------------------------ | ----------- | ----------- |
| Default plan             | 2           | 11          |
| Prototype                | 6           | 30          |
| Depth 2, 32 rollouts     | 19          | 30          |
| GOAP-proposed candidates | 15          | 30          |
| Approximate model        | 4           | 30          |

GOAP candidates still find the Dodge-leap exploit of Experiment 1 at 8 rollouts: a blow against
the dodger, a step back against the guarder. They catch it through the single-card candidates,
not the schema.

### What each approach costs in emergence

- **Depth 1 is the one shortcut that destroys emergence.** Every set-up needs two steps seen
  together.
- **Fewer rollouts lose robustness, not ideas.** Their misses are noise, and large when they
  happen. The prototype's "kiting" was partly this.
- **GOAP narrows two-card ideas to what its schema has a fact for** (a daze opens a foe, a conceal
  hides you, a step moves the fight). A sequence whose second card needs something the schema
  doesn't know is never proposed, unless the single-card candidates catch it. They caught the
  leap; they won't catch everything. The schema reads verbs and fields, never names.
- **The approximate model is fast and wrong** wherever it skips a rule (ready defences, counters,
  clones, reach). It would need to grow towards the engine to be trusted, and then it isn't
  cheap.

### Open item from this experiment

With narration mocked to return empty strings, 5.4% of simulated outcomes changed. Non-empty
constants changed nothing. So some rule depends on whether a story line is empty. The engine
slices and re-tags story lines in a few places (`steps.ts`, `zoning.ts`, `staging.ts`), and
template choice depends on the lines already said (`fresh.ts`). It hasn't been pinned down. It
must be before a production silent mode, and it may be a small correctness bug in its own right.

### Recommendation

- **What to build:** GOAP-proposed candidates scored in the real engine, with shared prefixes, a
  silent exchange and about 8 rollouts.
  - About 80 ms a decision for one against one, and roughly 200 ms per deciding fighter at three
    against three.
  - It keeps the emergent combos and beats the prototype's setting on quality.
- **The 2 ms target is the wrong frame for this architecture.** Real-engine simulation buys about
  four exchanges in 2 ms.
- **How it fits a frame budget:**
  - plan once a round, not every exchange, since the player commits per round anyway;
  - plan between rounds, off the frame, while the round plays;
  - plan only for minds that read the fight, and keep the plain AI for the rest.
- **The runtime budget** should be set on real target devices with these figures in hand.

## Experiment 3: the daze scenario

The scenario:

- **You:** Spark (a small shot, close or mid), Lantern Flash (a daze, close or mid), Lantern
  Burst (heavy, lands only on an open foe, close or mid), and poor taijutsu.
- **The foe:** an average fighter with no techniques at all, only blows.

In the first closed-loop run the planner mostly stepped back to mid. Four explanations were
possible. Each was tested on its own, with the rules unchanged.

### Is the combo inferior? No. It is the best fixed strategy by a wide margin

Fixed strategies played as ordinary plans through the real engine (no planner), 300 fights each,
fought to the end (`diag.test.ts`):

| Strategy                           | Won     | Lost | Exchanges | Dazes a fight | Damage to an open foe per exchange |
| ---------------------------------- | ------- | ---- | --------- | ------------- | ---------------------------------- |
| Daze → finisher up close           | **66%** | 34%  | 8.4       | 2.4           | 30                                 |
| Kite to mid, daze → finisher there | 48%     | 52%  | 14.7      | 2.0           | 29                                 |
| Kite to mid, Spark                 | 27%     | 73%  | 14.8      | 0             |                                    |
| Spark up close                     | 5%      | 95%  | 7.3       | 0             |                                    |
| The kit's default plan             | 5%      | 95%  | 7.3       | 0             |                                    |

### Is kiting too powerful? No. It exploits a foe with no answer at range

At mid, this foe deals no damage at all. Its only move is to step in again, and a step in is
contested: at equal speed it fails about half the time, and the turn is spent either way. So
kiting halves the hurt taken within a few exchanges. But it slows the fight down rather than
winning it: kite strategies win less than the combo up close.

Give the same foe one weak ranged shot (Spark), as nearly every real foe has (a kunai, a
technique), and kiting collapses:

| Strategy, foe with a ranged shot | Won |
| -------------------------------- | --- |
| Daze → finisher up close         | 63% |
| Kite, daze → finisher            | 38% |
| Kite, Spark                      | 9%  |

Hurt taken per exchange up close also _rises_ for the kiter (18 against 10), because a step costs
the turn and leaves no Guard or Counter that exchange.

### Was the planner's evaluation missing something? Yes, in three ways

1. **Noise.** At the start, with 16 rollouts, "step back > Spark" edges "Flash > Burst" by a hair
   (−7.8 against −8.4). At 80 and 200 rollouts the combo wins clearly (+2.1 and +3.5 against
   about −8).
2. **The proof of concept's cap.** Its closed-loop fights stopped at 8 exchanges. Kiting delays
   the fight, so a cap scored by health traded rewards it.
3. **The horizon.** The score counts health over two or three exchanges and has no idea who wins
   the race. At depth 3, "step back > Flash > Burst" tops the ranking: avoiding a hit now looks
   better than it is over a whole fight.

### What the planner actually does in fights to the end

The planner, re-planning every exchange, against the rangeless foe, 20 fights each, fought to
the end (`closed.test.ts`):

| Planner                                                      | First move                     | Won       | Dealt | Taken | Time a decision |
| ------------------------------------------------------------ | ------------------------------ | --------- | ----- | ----- | --------------- |
| Depth 2, 16 rollouts, scored over 2 exchanges                | step back, every fight         | 15/20     | 83    | 68    | 0.7 s           |
| Depth 2, **80 rollouts**, scored over 2                      | **Lantern Flash, every fight** | **16/20** | 94    | 81    | 4.7 s           |
| Depth 2, 32 rollouts, scored over **6** (default plan after) | step back, every fight         | 10/20     | 73    | 81    | 4.8 s           |

Two things show here.

- **With the noise taken out, the planner opens with the combo.** At 16 rollouts it opens by
  stepping back, but still plays Flash and Burst from mid afterwards. Both versions beat every
  fixed strategy (75–80% against 66%), because they mix kiting with the combo against a foe who
  can't hit at range.
- **Scoring further ahead made it worse.** The exchanges past the searched sequence are played
  on the fighter's default plan, which never dazes, so a longer horizon weighs a bad policy more.
  A longer horizon only helps with a decent follow-on policy, or with a terminal estimate of the
  race instead of more simulated exchanges.

### Diagnosis

- **The combo is sound.** Among fixed strategies it is clearly the best.
- **Kiting is not too strong under the rules.** It pays only against a foe with nothing at range,
  and there it still wins less than the combo, because it delays rather than wins.
- **The planner's preference came from its own evaluation:** noise at 16 rollouts, the 8-exchange
  cap, and a short horizon with no estimate of who wins the race.
- **Fought to the end, the planner does better than any fixed strategy.** It kites the
  rangeless foe _and_ runs the combo from mid, mixing both. That is a fair use of a real weakness
  in the foe's kit.
- **Design feedback (not changed):**
  - **The kit's default plan never sets the finisher up.** The default plan slots the daze only to
    interrupt a foe readying a technique. Against a foe who only throws blows, the daze never
    fires, so the finisher never does either (5% won, against 66% for the plain combo). Default
    plans should pair a finisher with what opens it. That is a fix to `defaults.ts`, not to the
    rules.
  - **A fighter with no ranged option loses about half its turns chasing a kiter of equal speed.**
    That is how contested steps are meant to work (`stepping.ts`), and kunai in the starting pouch
    already answer it. Worth knowing for bestiary beasts, who carry no kunai.
- **For the planner design:**
  - Score candidates on a horizon long enough to see the race. A terminal estimate (who falls
    first at the current trade) is the cheap version.
  - Don't trust a ranking whose gap is inside the rollout noise.
