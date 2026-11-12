# Planner experiments, round two

Three experiments asked for after the proof of concept: a defensive commitment mechanic and
whether a planner finds how to exploit it, where the planner's time goes and how to cut it, and
why the planner preferred stepping out of reach to Daze → Finisher. Nothing here changes
production combat code on `main`. The one rule tried (Experiment 1) lives only on this branch.

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

RESULTS_A

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
