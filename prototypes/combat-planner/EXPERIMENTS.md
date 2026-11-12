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

| Foe keeps | Rule | Planner's best pair at the start | Planner's first move, 20 fights | Planner won | Default plan won |
| --- | --- | --- | --- | --- | --- |
| Dodge | **leap on** | blow > blow (+0.3) | **blow up close, 20 of 20** | 16/20 | 15/20 |
| Dodge | leap off | step back > blow (−4.3) | step back, 20 of 20 | 15/20 | 15/20 |
| Guard | leap on | step back > blow (−5.7) | step back, 20 of 20 | 16/20 | 16/20 |
| Guard | leap off | step back > blow (−5.7) | step back, 20 of 20 | 16/20 | 16/20 |

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

| Planner | First move | Won | Dealt | Taken | Time a decision |
| --- | --- | --- | --- | --- | --- |
| Depth 2, 16 rollouts, scored over 2 exchanges | step back, every fight | 15/20 | 83 | 68 | 0.7 s |
| Depth 2, **80 rollouts**, scored over 2 | **Lantern Flash, every fight** | **16/20** | 94 | 81 | 4.7 s |
| Depth 2, 32 rollouts, scored over **6** (default plan after) | step back, every fight | 10/20 | 73 | 81 | 4.8 s |

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
