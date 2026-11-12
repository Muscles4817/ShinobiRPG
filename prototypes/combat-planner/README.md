# Combat planner proof of concept

A throwaway prototype for `docs/design/combat-ai-plan.md` (Part 7). It answers one question
before any of the design is built: **does a planner with no combinations written into it find
useful two- and three-action combinations by itself, in the real Plan & Watch engine?**

It is not part of the game:

- it lives outside `src/`, so no build, lint or arch check sees it;
- it imports engine internals directly;
- it is slow (see Cost).

Run it with:

```bash
npx vitest run --config prototypes/combat-planner/vitest.config.ts --silent=false
```

The run takes about four minutes.

## What it is

- **`beam.ts`**: candidate A of the design. One objective (wear the foe down without being worn
  down: health dealt, minus health taken, with a win or a fall worth 150). It runs a beam search
  over sequences of the fighter's own cards, one card per exchange.
  - Each sequence is scored by playing it, and then the fighter's own default plan to the
    horizon, over the same seeds for every sequence.
  - It prunes two things, both by the engine's own judgement: first cards the engine would pass
    over now, and sequences whose outcomes are identical on every seed.
- **`forward.ts`**: the forward model, the real exchange (`resolveExchange`, the round's end,
  foes' intents) played on a copy of the fight.
  - It draws its own seeds, never the fight's.
  - Foes in it can be replaced by the planner's belief of them (`Belief`).
  - Foes decide by the engine's own AI, which stands in for "how I expect them to react". In the
    design, that is the prediction from beliefs.
- **`fight.ts`**: whole fights, closed loop. The planner re-plans before each exchange, plays
  only the first card, and the exchange is resolved with the fight's own seeds.
- **`scenarios.ts`**: fights built through the engine's real `start`, and plain technique data.
  None of the techniques is a body move, so the style strike (which already picks and chains
  body moves by feel) can't play them for the planner.

The first test checks the planner's code names no technique, verb or combo.

## What it showed (one run, recorded)

| Check                                  | Result                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Daze, then the finisher**            | Greedy (depth 1) picks Spark. Depth 2 finds Lantern Flash → Lantern Burst (the finisher only lands on an open foe). The fighter's own default plan never uses the Flash at all.                                                                                                                                                          |
| **Hide, then the killing blow**        | Greedy picks the Wick Blade straight away (value 3.5). Depth 2 finds Lantern Veil → Wick Blade (value 188): a lethal blow on a foe who can't see you goes through a guard.                                                                                                                                                               |
| **A belief changes the value**         | Believing the foe sharp-eyed drops Veil → Blade from 188 to 65. It is still the best plan, but now a worse bet.                                                                                                                                                                                                                          |
| **Whole fights, 30 each, closed loop** | Hide-lethal: default plan won 11/30 and took 66; depth 2 won **30/30** and took 6, opening Veil → Blade every time. Daze-finish: default won 2/30 and took 99; depth 2 won 6/30 and took 50. In the live fights it mostly _stepped back out of reach_ of a foe who only has blows (also unscripted), rather than playing the daze combo. |
| **An induced reaction**                | The model has it: a sharp foe out of chakra gathers 0 times in 100 rollouts held up close, and 48 times after a step back. But at depth 3 the bait (step back, then hit the gathering foe) ranks second, 72 against 91, and isn't chosen in any variation tried.                                                                         |

### Why the bait loses: a rules finding, not a planner one

The planner can only find a plan that _induces a reaction_ if the reaction costs the reactor
something worth more than the turn spent baiting it. In today's rules, the reactions that most
invite baiting, the ready Guard, Dodge and Counter, are **free and automatic**:

- a Counter that fires leaves its user no more open than before;
- nothing a fighter does in answer to a blow commits them.

The reactions that do cost something (Gather, Evade, Brace, a step, a ready defence changed
between rounds) mostly answer chakra, killers or distance, and their price (`GATHER_OPEN`
0.4) is small against a turn. So "throw a weak blow to draw the Counter, then punish it" has no
payoff to find.

That is for the owner to decide as a rules question, for example a Counter that, once it fires,
leaves its user committed until their next turn. It is not something to fold into the AI.
Under a rule like that, the same search would weigh the bait with nothing new written for it.

## Cost

| Search                     | Time per decision |
| -------------------------- | ----------------- |
| Depth 2, 16 rollouts, live | 530–625 ms        |
| Greedy                     | 30–50 ms          |

The design's bar is 2 ms. Simulating the real exchange is the honest way to _prove_ emergence,
and far too slow to ship. Part 7's options for closing the gap are:

- a tabulated forward model regenerated from benches;
- fewer rollouts, with common random numbers;
- generating candidates with GOAP preconditions;
- limiting depth to the art in play.

## Limits

- **One-on-one, one objective.** Teams, objectives and identities aren't in it.
- **Open-loop sequences inside the search.** Each sequence is fixed card by card, not "if they
  gather, then…". The live fights re-plan every exchange, which recovers some of that.
- **The opponent model is the engine's real AI on the foe's real kit**, as if with insight. A
  belief only replaces its attributes.
