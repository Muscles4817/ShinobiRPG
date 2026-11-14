# Cue inference: Gate 2 prototype and bench

A throwaway prototype for `docs/design/combat-ai-plan.md` Part 5 ("Cues") and Part 8 rule 4,
and the evidence for Gate 2 of Part 13. No production code changed: it lives outside `src/`,
imports engine internals directly, and reads real fights only to collect decision points.

```bash
npx vitest run --config prototypes/cues/vitest.config.ts          # model tests + bench (about a minute)
CUES_DIAG=1 npx vitest run --config prototypes/cues/vitest.config.ts prototypes/cues/diag.test.ts
```

The bench rewrites `bench-output.md` (every table; the numbers below are copied from it).

## The model

Three pure, deterministic steps. The only imperfection is a hash of (fight, exchange, observer,
actor, channel): no `Math.random`, no Rng.

1. **Cue profile** (`profile.ts`). Every card gives one value on six channels, each with a
   loudness 0–1, read from what the card is (kind, art, rank, chakra cost, element, reach,
   verbs), never from a name:
   - _body_: forward (closing, close attacks), back, square (ranged), settle (defence, gather),
     coiled (a counter stance), light (Evade);
   - _hands_: seals (ninjutsu, genjutsu, fūinjutsu; louder with rank), fist, blade, pouch;
   - _chakra_: a flare with its element (louder with cost), or the inward draw of Gather;
   - _stillness_ (Gather, Brace), _eyes_ (fixed, or scanning for a Search);
   - _form_: the card's own signature (seal sequence, a named move's footwork, the tool drawn).
     Genjutsu is quiet: every cue of an illusion shows at 0.55 of its loudness.
2. **What the observer sees** (`observe.ts`). Per channel, a margin: observer perception (+8
   for a sensor, + a little chakra control, on the chakra channel only), plus the cue's loudness
   about the middle, minus the actor's concealment, plus hash noise of ±4. Clear at ≥ 0, a
   glimpse down to −6 (misread a fifth of the time, element lost), else missed. A form read
   clearly is recognised if the observer has seen this card from this actor, knows the
   technique, or is graded at least the technique's rank in its art (expertise); otherwise it is
   "unfamiliar". A glimpsed form is recognised only if familiar. Insight sees the card itself; a
   hidden actor gives nothing to eyes that don't see the hidden.
3. **Inference** (`infer.ts`). A posterior over: the basics anyone has (strike, throw, steps,
   Evade, Brace, Gather; Search when the observer hides; Dispel when an illusion is in play),
   the cards seen from this actor (each weighted by how often it was seen: habit), a form
   recognised, and three "not seen yet" buckets (a technique, a body move, a counter stance)
   whose prior fades over the fight. Each is multiplied by the likelihood of the sighting:
   a clear mismatch leaves 0.1 (0.04 for an expert in the card's art), a glimpse 0.45. Out:
   a class (thirteen, finer than today's lines), the same read at today's grain, a confidence
   word from the class's mass (sure ≥ 0.9, fairly sure ≥ 0.65, else maybe), the masses slot
   conditions key on, and a **name only when the top card has ≥ 0.6 of the mass and its form
   was actually seen** (habit alone never names).
4. **Feints**: the actor wears a bait card's profile with a thin flare (×0.5) and a hollow form;
   an expert who reads the form clearly sees it hollow, and only a sharp mind (intellect C+)
   keeps a feint hypothesis (prior 0.08, ×40 on a hollow form).

Two concealment variants were benched:

| Variant                      | Concealment                                                             |
| ---------------------------- | ----------------------------------------------------------------------- |
| **watchful hides** (default) | 0.7 × the actor's perception + 0.2 × speed + 0.1 × skill in the art − 3 |
| body hides                   | 0.55 × speed + 0.25 × skill in the art                                  |

## The bench

67,657 decision points from 2,904 watched fights: every ordered pair of the 22 matrix-cast
members (`matrixCast.ts`), at genin, chūnin and jōnin scale, two seeds, through the real
`createPlanEngine`.

- _Player reads foe_: before each exchange, the foe's announced card (`state.intents`) is the
  truth today's telegraph tells.
- _Foe reads player_: the card the player actually played that exchange (from `uses`/`streak`;
  a hold-off fires outside the streak) is the truth. Today foes see nothing; the "today" columns
  there show a symmetric telegraph.
- Memory (cards seen, how often) is built per observer from plays they had in view.

"Today's class" is today's telegraph line, with one change: a body move (a breath-paid taijutsu
or blade technique, which a styled strike plays) counts with the strike. "Exact card" is a basic
by its class, a technique or tool by its name. Percentages are of all points, so the 4% where
the foe is hidden caps both columns at about 96%.

### 1. The player reads foes, by perception gap (watchful hides)

| gap (you − foe)                              |      n | today: told | today: exact | cue: today's class | cue: exact | named, today / cue | cue names wrong |
| -------------------------------------------- | -----: | ----------: | -----------: | -----------------: | ---------: | -----------------: | --------------: |
| ≤ −5                                         |  5,746 |         96% |          28% |                87% |        54% |           0% / 39% |              0% |
| −4..−1                                       |  5,861 |         97% |          46% |                94% |        75% |           0% / 56% |              0% |
| 0                                            |  9,737 |         96% |          96% |                94% |        85% |          94% / 76% |              0% |
| +1..+4                                       |  5,091 |         95% |          95% |                94% |        89% |          91% / 80% |              0% |
| ≥ +5                                         |  2,045 |         97% |          97% |                97% |        91% |          95% / 86% |              0% |
| **out-read (gap ≥ 0)**                       | 16,873 |         96% |          96% |            **94%** |    **87%** |      **93% / 79%** |              0% |
| out-read, a technique or tool seen before    |  6,299 |        100% |         100% |               100% |        97% |         100% / 97% |              0% |
| out-read, a technique or tool on first sight |  3,249 |         81% |          81% |                75% |        42% |          81% / 42% |              0% |
| out-read by the foe (gap < 0)                | 11,607 |         96% |          37% |                91% |        64% |           0% / 46% |              0% |
| insight                                      |  6,247 |         96% |          96% |                96% |        96% |          96% / 96% |              0% |

By the cue model's own measure of out-reading (perception against the foe's concealment of that
card, at a middling cue): margin ≥ 0 gives today's class 94%, exact 87%; margin < −6 (1,104
points) gives 78% and 17%.

By the observer's grade in the foe's art (techniques named, today / cue): E 52% / 61%, D 52% /
65%, C 54% / 68%, B 36% / 55%, A 71% / 72%. Expertise names unfamiliar techniques on first sight
and sharpens likelihoods; it matters most where perception doesn't carry.

By class: strikes and body moves 95%, steps 96–98%, throws 96%, techniques 88%, techniques on
themself 98% at today's grain (75% at the finer grain: an attack and a self-technique look alike
until the form is read), counter stances 75% (today's "settling into a stance" is 100%).

### 2. Confidence words are calibrated

| word        | share (all) | class right | share (out-read) | right | share (out-read by foe) | right |
| ----------- | ----------: | ----------: | ---------------: | ----: | ----------------------: | ----: |
| sure        |         67% |         99% |              80% |   98% |                     48% |   99% |
| fairly sure |         20% |         92% |              13% |   89% |                     29% |   94% |
| maybe       |         10% |         64% |               2% |   55% |                     20% |   66% |

"Sure" is right ~99% everywhere; perception moves how often you get to say it. Named cards are
never wrong in the bench (0% at every gap) once a name needs the form seen.

### 3. Slot conditions under inference (player side, no insight)

Today a condition reads the announced card itself, whatever the player's eyes, so today = truth.
Under inference it fires when the mass on its event reaches a threshold.

| condition     | threshold | true | fires when true (all / gap < 0) | firings wrong (all / gap < 0) |
| ------------- | --------: | ---: | ------------------------------: | ----------------------------: |
| foe-readying  |       0.5 |  58% |                       94% / 88% |                       2% / 1% |
| foe-readying  |      0.65 |  58% |                       89% / 78% |                       0% / 1% |
| foe-readying  |       0.9 |  58% |                       72% / 46% |                       0% / 0% |
| foe-attacking |       0.5 |  70% |                       97% / 93% |                       3% / 3% |
| foe-attacking |      0.65 |  70% |                       94% / 86% |                       3% / 2% |
| foe-attacking |       0.9 |  70% |                       78% / 57% |                       0% / 0% |
| foe-closing   |       0.5 |  11% |                       98% / 91% |                       1% / 4% |
| foe-closing   |      0.65 |  11% |                       97% / 84% |                       0% / 1% |
| foe-closing   |       0.9 |  11% |                       62% / 39% |                       0% / 0% |

### 4. The reverse: foes reading the player

| gap (foe − you)                                 |             n | sym. telegraph: exact | cue: today's class | cue: exact | named, sym. / cue |
| ----------------------------------------------- | ------------: | --------------------: | -----------------: | ---------: | ----------------: |
| ≤ −5                                            |         5,105 |                   30% |                86% |        53% |          0% / 38% |
| −4..−1                                          |         5,568 |                   48% |                93% |        78% |          0% / 63% |
| 0                                               |         9,251 |                   95% |                93% |        82% |         95% / 77% |
| +1..+4                                          |         4,880 |                   94% |                93% |        86% |         92% / 79% |
| ≥ +5                                            |         2,194 |                   96% |                91% |        85% |         94% / 85% |
| out-read, a technique seen before / first sight | 7,768 / 3,498 |             99% / 84% |          99% / 80% |  95% / 41% |                   |

The same function of the same inputs, both ways: fair. Any one pair is not symmetric: a sharp
fighter reads a dull one at gap +5 better than the dull one reads them at −5 (85% vs 53% exact).
Today foes get nothing; under cues they get about what the player gets.

### 5. Feints (both directions, a technique's cues worn over a non-technique card)

| observer                                   |     n | fooled | fooled, fairly sure+ | feint suspected | reads the true class |
| ------------------------------------------ | ----: | -----: | -------------------: | --------------: | -------------------: |
| insight                                    | 2,575 |     0% |                   0% |              0% |                 100% |
| sharp (intellect C+) and expert in its art | 3,322 |    47% |                  31% |             25% |                  19% |
| expert, not sharp                          | 8,199 |    66% |                  55% |              0% |                  21% |
| sharp, not expert                          |   177 |    76% |                  58% |              0% |                   5% |
| neither                                    | 1,983 |    84% |                  72% |              0% |                   4% |

Feints work, and work worst against the sharp expert; that ordering is what the design asks for.
Expertise alone already halves the confident fooling (it reads the thin flare and the form
against what it knows). Only a sharp mind names a feint as such, and only a quarter of the time,
because the hollow form needs a clear form read.

### 6. Body hides (the variant)

With concealment from speed and skill alone, out-reading by perception no longer means seeing:
out-read (gap ≥ 0) gives today's class 89% and techniques named 57% against today's 93%; at
gap 0 only 49%. By the cue model's own margin (≥ 0) it is 95% and 78% (as good as the default).

## What a line looks like

From the bench's samples (`bench-output.md`, "Player-facing lines"), by gap:

| gap    | truth                          | the foe panel says                       |
| ------ | ------------------------------ | ---------------------------------------- |
| ≤ −5   | Whispering Dread               | "Likely Whispering Dread: fairly sure."  |
| ≤ −5   | Tide Lash                      | "Perhaps an attacking technique: maybe." |
| −4..−1 | Moonfall Slash                 | "Likely a blow up close: fairly sure."   |
| 0      | Gale Heel                      | "Gale Heel: sure."                       |
| ≥ +5   | step in                        | "Likely closing in: fairly sure."        |
| ≥ +5   | White Flame Heel (first sight) | "Perhaps an attacking technique: maybe." |

No numbers; the name only where its form was seen; the hedge is the confidence word.

## The gate verdict

**(a) Never worse off than today against a foe you out-read: holds for the class, holds for a
name you have seen, fails for a name on first sight.**

- Class at today's grain: 94% against today's 96% when out-reading (the 2 points are counter
  stances, which today names by sight, and techniques mistaken for strikes at "maybe").
- A technique or tool seen before: named 97% against 100%, never wrongly.
- On first sight: named 42% against today's 81%. This shortfall is structural, not tuning:
  today names a technique the player has never met because perception ≥ the foe's; under cues,
  a name needs knowledge (the technique seen, known, or within your expertise). No setting of
  the constants closes it without giving names back for free, which is the telegraph again.
- Overall naming when out-reading: 79% against 93%.

**(b) Something to plan against at low perception: holds.** Out-read by the foe, the player
still gets today's class 91% of the time (87% at ≤ −5), with "sure" or "fairly sure" 77% of the
time, and names 46% of techniques (where today names 0%), from habits and familiar forms.
Surprise: at low perception cues give _more_ than today, because experience names what
perception alone never did.

**(c) Slot conditions keyed on inference work at 0.5–0.65.** At "fairly sure" (0.65) they fire
for 89–97% of true events and are wrong 0–3% of the time; low perception costs 10–15 points of
recall, not precision. At "sure" (0.9) they miss a quarter to a third of events.

**Fairness**: the reverse direction matches the forward within a few points at each gap.

## Recommendations before building it

1. **Decide what "out-reads" means.** The gate only holds by perception gap if concealment leans
   on the actor's perception ("watchful hides": a fighter who notices tells hides their own).
   If concealment should be speed and skill (body hides), then the promise to the player must be
   stated in the cue model's own terms (perception against concealment), where it holds equally.
2. **Replace "a name on first sight" with what is visibly true of it.** The 39-point first-sight
   shortfall is the one real loss. Say what the cues show plainly when the form is unfamiliar:
   the art, the element, the reach and size ("an unfamiliar fire technique, at range, wide:
   fairly sure"). That is most of what a plan needs, and it is honest. Then the name can stay
   earned.
3. **Give the counter stance its own cue** (here, "coiled"). Without it, an unseen counter is
   read as a blow; it is the one class today shows better (100% vs 75%), and Situation A of the
   design turns on it.
4. **Slot conditions name a confidence; default to "fairly sure"** (0.65): recall 89–97%,
   wrong 0–3%. Offer "maybe" (0.5) for cheap defensive reactions and "sure" (0.9) for
   expensive commitments. Today's conditions read the announced card whatever the player's
   eyes; that should end with this change, on both sides.
5. **Names need the form seen**, never habit alone. With habit naming allowed (name at 0.6 of
   the mass), wrong names rose to 12% at low perception; requiring the form brought them to 0%.
6. **Habits carry a lot.** Bench fighters repeat their default plan, so habit priors predict
   well; a deception identity (Part 4) or a varied plan will lower every number here.
   Re-bench once identities exist.
7. **Feints need a rules decision**: what card or verb enables one, and what it costs. In this
   model a feint fools most observers; only a sharp expert catches some (25%).
8. Before the engine change, put the inference in shadow: show "what you see" and "what you make
   of it" beside today's telegraph and log disagreements in real fights.

## Caveats

- The player side's truth is the announced intent; the foe side's is the card played, since the
  player chooses live. A committed-step rule (Part 8 rule 1) would make both intents.
- One-on-one only: "eyes" (whom they watch) is profiled but never decides anything here.
- Every cue profile number is a guess from the design's description, tuned only by the few
  constants named above; the bench measures this model, not the truth about shinobi.
- Insight rows are capped at 96% only by hidden foes.

## Files

- `profile.ts` cue profiles and classes; `observe.ts` sight; `infer.ts` inference; `words.ts`
  the player-facing line; `today.ts` today's telegraph as a reader; `hash.ts` noise.
- `collect.ts` decision points from real fights; `evaluate.ts` scoring; `bench.test.ts` the
  bench (writes `bench-output.md`); `model.test.ts` the model's key properties;
  `diag.test.ts` diagnostics, on demand.
