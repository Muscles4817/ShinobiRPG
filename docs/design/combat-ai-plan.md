# Fighting minds: an objective-driven combat AI

Design document for how fighters decide in Plan & Watch. **Nothing here is implemented, and nothing
here is binding.** The objective catalogue, the planning algorithm and the player's controls are
deliberately left open: each section says what is proposed, what the alternatives are, and what
evidence would decide between them. Part 1 is how fighters decide today and what goes wrong.
Part 2 sets the principles. Parts 3–9 are the design: the architecture, identities, beliefs,
objectives, the planner, commitment and the player. Part 10 maps it onto the existing code.
Part 11 works through examples. Part 12 covers how we'd know it works, and Part 13 is a build
path. Part 14 lists the questions for the owner.

---

## Part 1: Today

### How a foe decides now

Each exchange, after the last one ends, every standing foe settles on its **intent** for the next
one (`intent.ts`, `rollIntents`), and the fight screen telegraphs it. The intent comes from one of
two different deciders, picked by a coin weighted by intellect grade (`planAdherence`: E 0.7 up to
S 0.9):

- **The plan** (`priority.ts`, `plannedPlay`): the foe's default loadout, played as a priority
  list exactly like the player's. Layered on top for minds that read the fight (intellect D+,
  `readsInTheMoment`) are a counter-pick against a defence it has seen (`counterPick`) and a
  change-up after `CHANGE_UP_AFTER` turns of one attack (`changeUp`).
- **Instinct** (`choose.ts`, `chooseCard`): a cascade of special cases checked in order (survive
  a killer, a set-up, a summons call, a ladder step, shelter, gather, find the hidden, a tool,
  heal when low, daze first, finish the open), then a weighted roll among the slotted cards. The
  weights come from technique power, `worth.ts` against this foe (sharpened by
  `worthSharpness`), what beats the seen defence (`beatsWeight`) and a repeat penalty
  (`repeatWeight`).

At its turn the foe plays its intent unless the exchange has made it pointless (`intendedCard`,
`keepsTo`), and then it chooses afresh. Between rounds, a foe that has seen enough attacks
(`adaptsAfter`) re-picks its ready defence (`adapt.ts`). Around all this sit about fifteen modules
that each own one tactical idea:

- `setups.ts`, hide, hold, finish
- `survival.ts`, a killer
- `shelter.ts`, `resting.ts`, `pacing.ts`
- `calling.ts`, `climbing.ts`, `stillness.ts`
- `targeting.ts`, `foeTeam.ts`, `roles.ts`
- `repertoire.ts`, a style strike by feel
- `chaining.ts`, `finishers.ts`, `pouch.ts`, `prep.ts`, `sight.ts`

Each is consulted from both the plan path (as kit play or slot conditions) and the instinct path
(as an override).

### What goes wrong

1. **Two deciders and a coin.** Whether a jōnin keeps to its plan or acts on instinct is a 15%
   roll, not a judgement. The two paths weigh the same situation differently, so the same foe
   in the same state can do sharply different things for no reason a player could read.
2. **Overrides, not trade-offs.** The special cases are an ordered cascade: whichever fires first
   wins. A set-up beats a finisher beats a heal because of where the lines sit in `choose.ts`,
   not because of the situation. Adding a tactic means finding its place in the order, and
   every new module has made that order harder to reason about.
3. **Beliefs are counts, and every mind reads them the same way.** `reads.ts` keeps the defences
   seen per distance and the attack styles seen. A foe reads them only through fixed
   thresholds (`adaptsAfter`) and multipliers (`beatsWeight`). Nothing is held with more or less
   confidence, nothing is predicted, and no fighter is ever wrong about you except by not having
   seen enough.
4. **No goal outlives an exchange.** Nothing in the state says "I am setting up a hold so my
   partner can finish". Sequences exist only where a module hard-codes them (`setups.ts`,
   `chains.ts`, a ladder), so a foe can't invent a two-step idea the code doesn't spell out.
5. **Repetition is optimal and the AI can't say why it repeats.** The experience bench (P0.4)
   measured 80–87% repeated turns. A naive re-planner cut that to 48% but dropped wins from 70%
   to 43%: in this engine, the best attack usually _is_ best again. Variety bolted on
   (familiarity, change-ups) fights the engine's own maths.
6. **Identity is one number.** Intellect grade sets adherence, adaptation speed, the read lean and
   worth sharpness all at once. A sharp coward and a sharp berserker decide the same way; only
   their kits differ. Traits like `coward` are rules, not temperament.
7. **The matrix is wide.** At 100 seeds, 260 of 462 build pairings fall outside a 15–85% band
   (P0.3). Some of that is balance, but much is decision quality: hive, puppet and dust users
   and the set-up killer fight poorly under the generic instinct roll.

### The read-the-run experiment (closed)

The owner asked to keep familiarity measured on a run of one move, instead of over the whole
fight, only if it was mechanically justified and free of side effects. It was neither:

- **Mechanically**, a technique seen five times in a fight is known whether or not something
  else came between. Resetting the read on any change of move models rhythm, not knowledge, and
  makes alternating two moves a free reset.
- **Its side effects:**
  - At the original constants, two foreign chūnin sensor foes crossed the "too much for fighters
    a scale below" bar: beaten at 0.317 against a limit of 0.30, up from 0.283.
  - The matrix outliers shifted.
  - A learned-panel test had to be rewritten.
  - The steeper variant broke twelve tests.

The patch is kept out of the code. "Has this move been read?" belongs in the beliefs of Part 5,
where both the count and the rhythm can be evidence without either becoming a hidden mechanic.
The WIP branch `combat/repetition` (a `fresh` slot condition and forced alternation in default
plans) is not merged and is not part of this design. The ten tests it broke exist only on that
branch; `main` is green.

---

## Part 2: Principles

1. **One mind, many fighters.** Foes, teammates, the player's own fighter when only watched,
   summons with plans, and any advice the plan screen gives all run the same decision process,
   fed different identities and different information. There is no separate "player AI".
2. **Fair information.** A fighter reasons only from what it could know:
   - what it has seen (gated by perception, sight, hiding and insight);
   - what it was told before the fight (scouting, a client's report);
   - what its side shares (teammates calling out, a shared mind);
   - its own kit and state.

   It never reads another fighter's loadout, intent roll, hidden stats or the Rng. Every input
   to a decision is named in a type that a test can check.

3. **Fair is not the same as symmetric.** Fairness means both sides work under the _same rules
   of knowing_. It does not mean both sides know the same things.
   - A sharp, experienced shinobi should predict an opponent's next move from their stance,
     habits, hand seals and past behaviour.
   - That does not mean anyone simply _knows_ which technique the other has queued.

   What each side learns comes from **cues** the action really gives off, read through the
   observer's perception, experience and tactical intelligence, and muddied by the actor's
   deception (Part 5, "Cues"). Two fighters facing each other learn different amounts about each
   other, and that difference is the point: it is where perception, experience, deception and
   intelligence earn their keep.

4. **Fair reactions.** No fighter reacts to something faster than the time structure allows its
   opponents to (Part 8). Calls and reconsideration are budgeted by the same rules on both sides,
   or the asymmetry is named and justified.
5. **Trade-offs, not overrides.** Tactics compete by value in the same currency. A special case is
   a source of candidate plans and a term in their value, never an early `return`.
6. **Variation from difference, not dice.** Two fighters in one situation decide differently
   because their identities, beliefs or kits differ. Randomness stays where it is honest:
   - imperfect perception;
   - noisy evaluation in a weak tactician;
   - breaking exact ties.

   It is never a flat coin between deciders. Everything still draws on the seeded Rng.

7. **Repetition is allowed to win.** A fighter repeats a move because it believes it will keep
   working, and stops when evidence says otherwise. Variety is never scored for its own sake.
8. **Explainable.** Every decision can say, in words, the objective it serves, the belief it rests
   on, and what would change its mind. This is the decision debugger for us and the read panel's
   source for the player (no numbers in story text; graded words only).
9. **The player's plan is theirs.** Whatever control the player has, the AI never overrides an
   instruction they gave. It may fill in what they left open.
10. **Cheap enough for a phone.** A watched fight of six fighters to its end must stay
    interactive. The budget is set in Part 7, and every algorithm is measured against it.
11. **Mechanics stay put.** This is a decision layer. It reads the existing rules (damage, avoid,
    reach, effort, conditions) and changes none of them. Benches keep holding the rules. Where the
    design turns up a rules question (the prototype found one, Part 7), it goes to the owner as a
    rules change of its own, never folded into the AI.

---

## Part 3: Architecture

```
                      ┌────────────────────────── identity (Part 4) ─────────────────────────┐
                      │                                                                      │
observations ──► beliefs ──► assessment ──► objectives ──► plan ──► commitment ──► action
 (Part 5)        (Part 5)     (Part 5)       (Part 6)      (Part 7)   (Part 8)      (a Card)
                     ▲                                                     │
                     └───────────── what happened (lines, causes) ◄────────┘
                                                    │
                                         explanation (why, what would change it)
```

- **Observations** are events a fighter perceived. They are written by the exchange as it
  resolves, from the same lines and cause stamps (`causes.ts`) the player reads, filtered by
  what that fighter could see.
- **Beliefs** are interpretations of observations, each with a confidence. Examples: "keeps a
  Counter up close", "can't slip a wide area", "is nearly out of chakra", "has a killing blow".
  Beliefs are per fighter, or per shared mind.
- **The assessment** is the situation as this fighter sees it, computed fresh each time it
  decides: threat, opportunity, resources, positions, tempo and team state. It combines its own
  true state with its beliefs about everyone else.
- **Objectives** are what the fighter is trying to bring about over the next few exchanges. One
  is active, and others are kept as fallbacks.
- **The plan** is a short sequence of intended actions that serves the active objective,
  including where to stand.
- **Commitment** decides which part of the plan is binding (the telegraph) and when the fighter
  may reconsider.
- **The action** is a `Card` and target, exactly what `plannedPlay` and `chooseCard` return today,
  so everything downstream (the exchange, causes, staging, sound) is untouched.

### Where it lives

A new folder inside the engine, `systems/combat/engines/plan/mind/`, of pure functions. The
mind's memory (beliefs, the active objective, the plan, budgets spent) is stored on each
`PlanFighter`, or on the round for a shared mind. That is inside the engine's opaque
`CombatState`, so the save shape at the game layer doesn't change. A fight saved mid-round in
the old shape decodes with empty beliefs, and the engine's existing legacy defaults
(`upgradeLegacy`) fill them. Nothing outside the engine imports the mind. The view reads its
explanations through the existing view fields (`intent`, `known`, the read panel, round advice).

### Sketch of the shapes (illustrative only)

```ts
interface Mind {
  readonly identity: Identity; // Part 4, derived at fight start
  readonly beliefs: Readonly<Record<string, Beliefs>>; // about each other fighter, by id
  readonly objective?: ActiveObjective; // Part 6
  readonly plan?: readonly PlannedStep[]; // Part 7
  readonly budget: { readonly breaks: number }; // Part 8: reconsiderations left
}

interface Belief<T> {
  readonly value: T; // the hypothesis ("counter", "close", "low")
  readonly evidence: number; // weighted observations for it
  readonly against: number; // weighted observations against it
  readonly lastSeen: number; // exchange, for decay
}
```

The confidence is derived from evidence, never stored (`confidence(b)`, Part 5), so tuning how a
mind weighs evidence never needs a migration.

---

## Part 4: Fighting identity

An identity is how a fighter _wants_ to fight, apart from how _well_ it can. It is a small record
of dimensions, each a number from 0 to 1 used as a weight in valuation. None of them is ever a
probability of doing something.

| Dimension                 | What it weighs                                                                                   | Low                        | High                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------- |
| **Philosophy**            | which objectives it reaches for first: overwhelm, outlast, outwit, protect                       | (categorical, see below)   |                                  |
| **Preferred range**       | value of plans that keep it at its distance                                                      | indifferent                | will spend turns to get there    |
| **Aggression**            | value of damage dealt now against damage avoided                                                 | waits for openings         | presses every exchange           |
| **Risk tolerance**        | how variance and worst cases are discounted: plans judged on their downside or their average     | judges by the worst case   | judges by the upside             |
| **Resource management**   | weight on chakra, breath, tools and summons kept for later                                       | spends freely              | hoards for the finisher          |
| **Adaptability**          | how fast beliefs move objectives (the switching threshold)                                       | sticks to the opening idea | changes approach on new evidence |
| **Deception**             | value of plans that hide intent: feints, hiding, baiting a seen defence                          | straightforward            | prefers the indirect route       |
| **Discipline**            | how strongly a chosen objective and plan persist (hysteresis), and resistance to bait            | impulsive                  | holds the line                   |
| **Tactical intelligence** | competence (one of its sources, below): planning depth, beam width, evaluation noise, hypotheses | shallow, noisy             | deep, precise                    |

Philosophy is categorical. It is a prior over objectives, not a script:

- **Overwhelm**: damage and tempo objectives get a bonus.
- **Outlast**: defend and recover objectives get a bonus, and attrition counts as winning.
- **Outwit**: set-up, deceive and deny objectives get a bonus.
- **Protect**: cover and support objectives get a bonus.

A fighter may hold two philosophies, weighted.

### Competence is separate from temperament, and it has more than one source

The dimensions above other than tactical intelligence are _style_: a reckless genius and a
cautious dullard are both coherent. Style never makes a fighter better. That separation is what
lets "a sharp coward and a sharp berserker decide differently" (Part 1.6).

Competence is not one number either. An experienced taijutsu specialist can make excellent
close-combat decisions without being a brilliant general. So competence is a small set of
sources, each applying where it belongs:

| Source                    | Where it comes from                                                                                                       | What it sharpens                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tactical intelligence** | intellect grade                                                                                                           | choosing objectives, plans that cross arts or involve teammates, how many hypotheses it entertains, reading absences                                                   |
| **Art expertise**         | the fighter's grade in each art, and the time spent in it                                                                 | planning depth, accuracy of evaluation and reading cues _within that art's exchanges_: a taijutsu master sees a close-range sequence three steps deep with a dull mind |
| **Combat experience**     | fights fought, by kind of foe (the field book already counts foes fought and beaten; rank as a proxy for authored people) | stronger priors about that kind of foe ("bandits rush"; "illusionists hide first"), so beliefs form faster and from fewer observations                                 |
| **Specialised knowledge** | what the fighter was taught: a school's teachings, a clan's arts, a sensei's lessons, a report on this foe                | named patterns it recognises at once: a Gentle Fist stance, a hand-seal sequence, a summoner's tell                                                                    |

In the planner, each decision draws on the relevant source rather than on intellect alone:

- A close-range taijutsu sequence is searched as deep as the better of tactical intelligence and
  taijutsu expertise.
- Reading a foe's cues uses perception plus expertise in the foe's art: you read what you know
  yourself.
- Forming a belief about a kind of foe starts from the experience prior.

All of these come from data the game already keeps. Experience is the one new thing that would
need storing per character, and the field book's counts may be enough to start with.

### How competence reaches the planner: one planner, scaled by tier

Every mind runs the same planner. Its tier (from tactical intelligence, lifted by expertise for
sequences within one art) sets how much it considers and how well it sees. A dull fighter is
never a separate hard-coded AI. This ladder was measured in `timing/RESULTS.md`:

| Tier | First cards considered               | Two-card chains             | Seeds per option | Error in reading the foe | Reads the telegraph | Between exchanges | Time a decision (1v1) |
| ---- | ------------------------------------ | --------------------------- | ---------------- | ------------------------ | ------------------- | ----------------- | --------------------- |
| E    | 3                                    | no (pairs if the art is C+) | 2                | ±30%                     | no                  | keeps the plan    | 9 ms                  |
| D    | 4                                    | no (same)                   | 3                | ±20%                     | yes                 | keeps the plan    | 16 ms                 |
| C    | 5                                    | pairs                       | 4                | ±10%                     | yes                 | keeps the plan    | 27 ms                 |
| B    | 6                                    | pairs                       | 6                | ±5%                      | yes                 | keeps the plan    | 43 ms                 |
| A    | 8                                    | pairs                       | 8                | exact                    | yes                 | keeps the plan    | 70 ms                 |
| S    | all, and every follow-up to the best | pairs                       | 16               | exact                    | yes                 | re-scores         | 248 ms                |

What the measurements showed:

- **Each tier wins a little more than the one below.** Against a C copy of the same build, net
  health a fight ran E −15, C 0, S +8.
- **The lowest tier roughly ties today's AI** on the player's side but does worse as a foe. It
  may need four first cards.
- **Which first cards a mind considers decides which combos it finds, not depth.** Hide →
  killing blow first appears at D, because E's three first cards never include the hide.
- **The spread is small next to fight-to-fight noise.** A difference players can feel will
  likely come from identity and beliefs (wrong reads, temperament), not search budget alone.

### Where identities come from

In order, each layer adjusting the last:

1. **Derived from the body and kit.**
   - Preferred range from the kit's home band (`homeBand`).
   - Resource management from how much of the kit costs chakra.
   - Deception from hiding, illusion and clone techniques held.
   - Risk tolerance nudged by health scale and size.

   This alone gives every bestiary foe and generated genin a coherent identity for free.

2. **Traits and temperament.** Person traits (already used for bond tastes) and combat traits map
   onto dimensions. For example, `coward` means low risk tolerance and outlast. A pack can map
   its own traits.
3. **Archetype.** A foreign-shinobi archetype (scout, vanguard, sensor, medic, trapper, captain),
   a sensei archetype or a fighter type (`exam/fighterTypes.ts`) gives a template.
4. **Authored.** A `PersonDef` or `EnemyDef` may set any dimension outright (an optional
   `fighting` field), for named characters whose style is canon or story.
5. **Context.** The game layer may tilt it for the fight's purpose: a spar lowers aggression
   against a finished foe, an exam bout raises discipline, a cornered rogue raises risk. This
   goes through the `CombatSetup`, as an optional field.

The player's own identity, when the AI acts for them, is set by the player (Part 9), never
inferred from their stats.

### Validation

Identities are data, so they are validated like content:

- every dimension is in range;
- an authored philosophy has at least one objective it can pursue with its kit;
- a preferred range is one its kit can attack from.

---

## Part 5: Assessment and beliefs

### Observations: what a fighter could know

An observation is written for each fighter who perceived an event, at the moment it happens:

| Observation   | Example                                          | Who perceives it                                                        |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| Action seen   | "B threw Lantern Wind at mid"                    | anyone with B in sight; insight or perception ≥ B's names the technique |
| Outcome       | "it was slipped; Dodge was ready"                | the two involved; onlookers in sight                                    |
| Defence shown | "B kept a Counter up close"                      | anyone who attacked B there, or watched                                 |
| Cue           | "B shifts onto the back foot, fingers stiff"     | anyone with B in sight, read as below ("Cues")                          |
| Wound / state | "B is badly hurt", "B is dazed", "B is held"     | in sight; graded words, not numbers                                     |
| Effort        | "B is breathing hard", "B's chakra is guttering" | perception against B's; a sensor reads chakra better                    |
| Absence       | "B didn't counter when it could have"            | interpreting the lack of an expected reaction: tactical intelligence C+ |
| Told          | "the report says B carries a hive"               | scouting before the fight; a shared mind; a teammate's call-out         |

Today's `reads.ts` (defences per distance, attack styles) becomes two of these observation kinds,
so nothing it knows is lost.

### Cues: what an action gives away before it lands

Today's telegraph names the exact card a foe has queued, with insight or with perception at least
the foe's. Under this design, an action being readied gives off **cues** instead. The action
produces cues, and the observer infers the action from them. The two steps are separate, and
everyone uses them, on either side.

1. **What an action gives off.** Each card has a cue profile, read from what it is, never tagged
   by hand:
   - **Body:** weight shifting in or back, a guard dropping, a blade drawn.
   - **Hands:** seals forming. More seals give away more, and a one-handed or sealless technique
     gives away little. `handsFull` and the blade rules already say when signs are slow.
   - **Chakra:** a flare. Sensors read it best, and a deep reserve flares big.
   - **Eyes and aim:** whom they are watching.
   - **Stillness:** gathering, meditating, a Brace.
2. **How clearly it is seen.** The observer's perception, against how quickly and quietly the
   actor readies it (speed, skill in the art, the art itself: genjutsu is quiet, a large
   ninjutsu loud). Sight, hiding and ground apply as they do now.
3. **What the observer makes of it.** The cues are evidence for the predictions of Part 5, mixed
   with the observer's beliefs about this foe:
   - Expertise in the foe's art turns "stiff fingers, weight back" into "a palm strike inside the
     guard".
   - Experience turns it into "this kind of foe always opens with a hold".
   - Specialised knowledge names the technique outright: you know that seal sequence.
   - Insight, and eyes that see everything, read it fully, as they already do.

   The result is a **prediction with a confidence**, said in graded words ("likely a technique at
   range: fairly sure"). The exact technique is named only when the evidence is strong enough.

4. **Deception** works on step 1. A feint gives off the cues of another action (a deception
   identity reaches for it, a feint card or technique enables it). Clones and illusions already
   show bodies that aren't there. Hiding gives off nothing. A sharp, expert observer is harder to
   fool, because their beliefs weigh the feint's cues against everything else they know.

What changes for the player:

- The foe panel shows **what you see** (cues) and **what you make of it** (the inference and
  its confidence), not the queued card. The mockup shows this panel.
- Your slot conditions keyed on the telegraph ("foe readying a technique") key on the
  inference, at a confidence the condition names.

What changes for foes: they read you the same way. They see your stance, hands and chakra, never
your list.

The asymmetry this leaves is honest. A perceptive, expert fighter learns more about a clumsy one
than the other way round. That is the game rewarding perception, experience and deception, not
the engine favouring a side.

What we must check before committing to it (it touches the player's information):

- The player must not end up knowing _less_ than the game owes them. A foe the player out-reads
  should be as readable as today's telegraph makes it.
- The plan screen must still have something concrete to plan against at low perception.

A prototype of the inference alone, on today's telegraphs, would answer both before any engine
change.

### Cues: what the prototype showed, and what the owner decided

A prototype and bench (`prototypes/cues/`, `RESULTS.md`) tested the model above on 67,657 real
decisions from 2,904 watched fights.

**What it found:**

- **No wrong names, and honest confidence words.** No card was ever named wrongly. "Sure" was
  right 98–99% of the time, "fairly sure" 89–94%, "maybe" 55–66%.
- **Out-reading a foe:** the kind of move is right 94% of the time (today 96%). A technique seen
  before is named 97% of the time (today 100%).
- **Being out-read gives more than today's telegraph:** the exact card is known 54% of the time
  at the widest gap, against today's 28%. Habits and familiar forms help.
- **Slot conditions** keyed on "fairly sure" catch 89–97% of real events and are wrong 0–3% of
  the time.
- **Fair, not symmetric:** foes read the player about as well as the player reads foes.

**The owner's decisions:**

- **A technique seen for the first time is described, not named.** Today's telegraph names a
  technique you've never met just because your perception is at least the foe's. Under cues a
  name needs knowledge: having seen it before, knowing it yourself, or skill in its art at its
  rank. Otherwise the panel says what was _clearly_ seen: the element in the flare, the reach in
  the stance, and seals in the hands. For example: "Likely an unfamiliar fire technique, at
  range, with seals."
  - Measured (`describe.test.ts`) on first-sight techniques against a foe you out-read: 50% are
    named, and **95% are named or described**.
  - Every statement a description made was true.
- **Concealment is weighted towards perception.** How well a fighter hides a readied move is
  mostly their own perception, some speed and a little skill in the art. The prototype uses
  0.7 × perception + 0.2 × speed + 0.1 × skill, minus 3: a watchful fighter knows what gives
  them away. That keeps "you out-read them" meaning what players expect.
  - If speed and skill alone hid a move, only 49% of techniques would be named at equal
    perception.

**Also adopted from the prototype:**

- **A ready Counter has its own "coiled" stance cue.** Without it, an unseen Counter reads as a
  plain blow.
- **Names need the form actually seen, never habit alone.** Naming from habit gave up to 12%
  wrong names at low perception.
- **Slot conditions name a confidence**, defaulting to "fairly sure".

**Still open: feints.** What enables a feint, and what it costs. Fooled shares:

| Observer                    | Fooled |
| --------------------------- | ------ |
| With insight                | never  |
| Sharp and expert in the art | 47%    |
| Neither                     | 84%    |

### Interpretations: hypotheses

Beliefs are hypotheses about another fighter, in a few families:

- **Habits**: "keeps Dodge ready at mid"; "leads with its strongest attack"; "throws this
  technique whenever it is at close".
- **Capabilities**: "has a killing blow"; "can't reach far"; "can heal"; "has something it
  hasn't shown". The last is a prior that decays as the fight goes on without a reveal.
- **Resources**: "low on chakra"; "out of breath"; "pouch nearly empty".
- **Intentions**: "is setting up a hold on me"; "is playing for time"; "is protecting the one
  behind it".
- **Weaknesses**: "slow to slip area techniques"; "can't see through illusions"; "goes blind
  after a blast".

Which hypotheses a mind entertains is bounded by tactical intelligence. A dull mind keeps only
habits about defences and its own last hit. A sharp one keeps intentions and absences. Holding
fewer hypotheses is cheaper, and it is also _characterful_: a dull brawler genuinely doesn't
consider that you are baiting it.

### Confidence: from evidence, not a dial

Each hypothesis accumulates weighted evidence for and against it. Confidence is a function of
the two, with a prior:

```
confidence = (evidence + prior·k) / (evidence + against + k)
```

- `k` is the prior's strength. A sharper mind uses a weaker prior and learns faster.
- Each observation's weight depends on how clearly it was perceived: a clear sight is 1, a
  glimpse is less, a telegraph without the technique's name less still.
- Older evidence decays by `adaptability`. An adaptable mind forgets the opening rounds faster
  and tracks change. A rigid one holds its first impression.
- Repetition is evidence, and so is variety. Five of the same attack builds the habit "leads
  with X". Two techniques alternating builds "alternates", which is itself predictable. This is
  where the read-the-run idea belongs: a mind _may_ hold "uses X in runs" as a hypothesis, but
  the mechanic (`familiarity.ts`) stays a separate, whole-fight rule.

There is no flat "70% chance to notice". A fighter notices when its evidence crosses what its
decision needs, and two fighters who saw different things believe different things.

### Predictions

Beliefs feed a **prediction** for each relevant opponent: a short distribution over what they will
do next, by action class:

- attack, by style: blow, flurry, break, sure, illusion, jutsu;
- defend, by kind;
- move, recover, call, hide.

It is built from habits, known capabilities, the cues read this exchange (very strong evidence
when they name the technique) and their apparent objective. The planner (Part 7) values candidate plans
against the prediction. Better beliefs give sharper predictions and better plans. Wrong beliefs
give confident mistakes, which is what a bait or a feint exploits.

### Assessment: the situation, read

The assessment is computed each time the fighter decides, from its own true state plus its
beliefs. It is a fixed set of named readings, each a small graded value:

| Reading         | Built from                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------- |
| **Threat**      | the predicted harm of each foe against me over the next exchanges (`worth.ts` the other way)    |
| **Opportunity** | open foes (dazed, held, guard down), a foe out of chakra, a seen defence my kit beats           |
| **Lethality**   | can anyone end me this exchange (`survival.ts`'s killer test, from beliefs)? Can I end them?    |
| **Resources**   | my chakra, breath, tools and summons, against what my best plans need                           |
| **Position**    | distances and rows: who can reach whom (`canReach`, `distanceBetween`)                          |
| **Tempo**       | who is winning the trade of health and resources per exchange, and how many exchanges to a fall |
| **Team**        | allies standing, held, in danger; the team mark; shared-mind state                              |
| **Context**     | tiring and stalemate clock, the fight's purpose (spar, exam), hidden foes                       |

Every reading comes with the beliefs it used, so the explanation can name them ("they keep a
Counter up close: fairly sure").

---

## Part 6: Objectives

An objective is a state of the fight the fighter is trying to bring about within a horizon of a
few exchanges, with a test for success and conditions for giving up. **The catalogue below is
illustrative.** It shows the range the system must handle, not the final list. Part 13 starts
with a small subset and grows it by evidence.

| Objective (candidate) | Wants                               | Typical plans                                        | Gives up when                          |
| --------------------- | ----------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| **Wear down**         | trade damage favourably             | best-worth attack; style strike; chain               | trades turn against it                 |
| **Finish**            | end a foe who can be ended now      | finisher on an open foe; the killing blow            | the foe recovers or escapes            |
| **Set up**            | make a foe open for a big hit       | daze, pin, hide → hold → finish; bait a defence      | resisted twice, or the partner falls   |
| **Survive**           | not be ended by a killer            | hold the killer, Evade, step back, Brace             | the threat passes                      |
| **Control distance**  | fight from where my kit is strong   | step, entry, hold-off, knock                         | there, or the cost is too high         |
| **Deny**              | stop their plan working             | break a hold, Dispel, Search, pressure a caster      | denied or failed                       |
| **Protect**           | keep an ally standing               | intercept, pull free, heal, mark their attacker      | the ally is safe or down               |
| **Recover**           | rebuild chakra, breath or health    | Gather, heal, step out of reach, shelter             | enough, or pressed                     |
| **Escalate**          | change the fight's scale            | open a gate, call a summons, Sage Mode, uncover eyes | escalated, or no longer worth the toll |
| **Deceive**           | make them believe something false   | feint a habit, then break it; clones; hide           | they stop biting                       |
| **Find**              | locate a hidden foe                 | Search, sense, areas                                 | found                                  |
| **Outlast**           | win the tiring clock or a stalemate | defend, recover, minimal effort                      | the clock no longer favours me         |
| **Disengage**         | leave the fight                     | flee, cover a retreat                                | away, or cornered                      |

### Choosing an objective

The candidate approach, to be tested, is **utility** over the assessment:

```
U(objective) = philosophy prior
             + situational value  (what the assessment says it would gain)
             + probability of success (from predictions, judged by risk tolerance)
             − cost (resources it would spend, weighed by resource management)
             + persistence bonus if it is the active one (discipline)
```

The ChatGPT note's `U = B + S + P + R − C` maps onto this. Its `R` (repetition) is deliberately
absent: repetition is handled through beliefs about being read, which lower the probability of
success, not through a variety term.

- **Hysteresis.** A fighter switches objective only when another beats the active one by a margin
  set by discipline and adaptability. This stops dithering without a timer.
- **Interrupts.** A few readings bypass hysteresis: a killer in reach, an ally being finished, a
  plan made impossible (target gone, out of chakra). These are the same events that grant
  mid-round calls to the player (Part 8), so both sides react to the same things.
- **Fallbacks.** The runner-up objective is kept, so an interrupted plan has somewhere to go
  without a full re-think.
- **Team objectives.** A team, or a foe team that reads the fight (`foeTeam.ts`), may hold a
  shared objective ("set up the jōnin for the captain") from which members take roles. This is
  how `roles.ts` and `foeTeam.ts` stances re-express.

### Why objectives at all

Objectives give plans a reason that lasts beyond one exchange. That is what lets a fighter spend
a turn on something worth nothing now (stepping in, a hold, a feint) because of what it buys
later. It also gives the explanation its first clause ("they're trying to set you up").

---

## Part 7: The planner

Given an objective, the planner chooses the next action, and usually a few more after it. Three
families were asked for. They are compared here without choosing one.

### Candidates

**A. Utility objective selection with bounded forward search.** The objective is chosen by
utility (Part 6). Then a beam search over short action sequences, depth 2 to 4 exchanges and
width K, scores each sequence with a cheap forward model:

- expected damage and condition odds from the rules;
- the opponents' predicted replies, from beliefs;
- resource cost;
- the objective's success test.

The best sequence's first step becomes the intent. The rest is the plan, kept for commitment.

- Depth and width come from tactical intelligence: a dull mind looks one step ahead with a
  narrow beam, a sharp one three or four steps with a wider one.
- Opponents are modelled as their predicted distribution, not searched, so this is not minimax.
  That keeps the cost linear in the number of opponents.

**B. Goal-Oriented Action Planning (GOAP).** Actions declare symbolic preconditions and effects:
"Hide: effect hidden", "Hold: precondition reach, effect target held", "Finish: precondition
target open". A* searches for the cheapest action chain that makes the objective's goal state
true, and utility picks the goal.

**C. Utility action selection (no lookahead).** Each exchange, every legal action is scored
directly against the active objective and the assessment, with considerations as response
curves (Infinite Axis Utility style). Sequences emerge only where a consideration rewards a
step that enables a later one, for example "a held target is worth more if I have a finisher".

### Comparison

| Criterion                              | A: utility + beam search                                                                                            | B: GOAP                                                                                              | C: utility action selection                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Compute per decision**               | K × depth × actions × forward-model cost. Bounded by intellect; the forward model must be cheap (no full exchange). | A* over symbolic states: cheap when the action set is small, worse with many techniques and fighters | actions × considerations. Cheapest by far                              |
| **Stochastic outcomes**                | natural: expected values and risk weighting in the evaluator                                                        | poor: effects are symbolic and certain; odds must be bolted on as action costs                       | natural: considerations can be odds                                    |
| **Opponent responses**                 | modelled through predictions at each depth                                                                          | outside the model (the world is static while planning)                                               | only through the current prediction                                    |
| **Emergent tactics**                   | high: any sequence the forward model rewards, including ones nobody wrote                                           | high for chains of preconditions (hide → hold → finish falls out); low for trade-offs                | low to medium: two-step ideas need a hand-written consideration        |
| **Maintainability**                    | the forward model must track the rules; drift is a risk (Part 12 tests it against the real engine)                  | every technique needs symbolic pre/effects, generated from verbs; an action schema to keep           | simplest to read; considerations multiply and their curves need tuning |
| **Explainability**                     | "the best line I saw was X, Y, Z": concrete                                                                         | "to reach goal G: X, then Y": very legible                                                           | "X scored highest because…": legible per step                          |
| **Integration with the engine**        | needs a forward model (an abstract exchange) built from `rules/`                                                    | needs an action schema derived from verbs                                                            | uses `worth.ts` and existing checks almost as they are                 |
| **Fit with telegraphs and commitment** | good: the plan's first step is the intent, the rest is the commitment                                               | good: the chain is the plan                                                                          | weak: no plan to commit to beyond the next action                      |
| **Character expression**               | depth and width map onto intelligence; risk is in the evaluator                                                     | intelligence = plan length; risk is awkward                                                          | intelligence = evaluation noise and sharpness only                     |

### Hybrids worth prototyping

- **C now, A later.** Utility action selection under an objective layer is the shortest step from
  today: `chooseCard`'s weights become considerations, and the cascade becomes candidates. Then
  add depth-2 lookahead only for objectives that need it (set up, control distance, escalate).
  The risk is that two-step ideas stay hand-written.
- **A with GOAP-generated candidates.** Use GOAP's precondition chains only to _propose_ the
  sequences the beam search scores, so the beam isn't spent on nonsense. This gets B's emergent
  chains and A's handling of odds, at the cost of both schemas.
- **A with a learned or tabulated forward model.** Precompute expected outcomes for (attacker
  grade, defender grade, technique class, defence kind) from bench runs, so evaluation is a
  table lookup. This is cheap, and it stays honest about the real engine because benches
  regenerate it.

### The forward model (needed by A and its hybrids)

The forward model is an _abstract_ exchange, not the real one:

- It never touches the Rng and never uses information the fighter lacks. It simulates the
  opponent as believed, not as they are.
- It takes expected values from the existing formulas: `avoid.ts` slip odds, `rules/damage.ts`
  gap damage, `conditionResist`, `effortOf`, `canReach`, `distanceBetween`.
- It runs turns in initiative order, as the engine does.
- It tests itself: a bench compares its predicted outcomes against the real engine's over many
  seeds. If the two drift past a set tolerance, CI fails, so a rule change that the model misses
  is caught.

### The compute budget

The first draft set a bar of 2 ms a decision and 150 ms a watched fight. Measuring showed that bar
is the wrong frame for a planner that simulates the real exchange
(`prototypes/combat-planner/perf/` and `timing/`):

- One real exchange costs about 0.4–0.7 ms one against one, and 1.5–2.1 ms three against three.
  So 2 ms buys about four simulated exchanges.
- What matters is _when_ the thinking happens, not how small one decision is. Planning once a
  round, behind the replay and the plan screen, leaves seconds to spend.

The budget is now set per round, fight-wide, and split between the fighters who plan by their
tier's weight (E 1, D 2, C 4, B 6, A 9, S 36; the ladder is in Part 4):

| Fight | Simulated exchanges a round | On the bench machine | On a phone (assumed 3–5× slower) |
| ----- | --------------------------- | -------------------- | -------------------------------- |
| 1v1   | 900                         | about 450 ms         | 1.4–2.3 s                        |
| 2v2   | 600                         | about 600 ms         | 1.8–3 s                          |
| 3v3   | 400                         | 600–800 ms           | 1.8–4 s                          |

- **Where it runs:** in a Web Worker, off the frame. Foes plan during the last exchange's replay
  (their first card is what they telegraph), allies during the plan screen, and mid-round
  re-plans during the previous exchange's replay.
- **What it fits:** a chūnin cast planning at its own grades already fits the 3v3 budget. A
  fight full of S minds gets roughly an A mind's search each.
- **Still to do:** measure it on real target devices (Part 14).

### Plans that work through the opponent's reaction

Valuing outcomes is not enough. A planner must also find plans whose value comes from **what
they make the opponent do**: a weak blow thrown to draw a counter that leaves its thrower open,
a step back that tempts a dry foe to gather, a show of a killing blow that makes a sharp foe
spend turns on Evade. The test of tactical flexibility is that it finds these without a bespoke
"bait" rule. For that, two things must hold:

1. **The opponent model reacts.** The forward model must predict the opponent's reply _to the
   state the plan creates_, not a fixed distribution. Candidate A does this, because its
   prediction is re-made at each depth. Candidate B (GOAP) cannot, because its world stands still
   while it plans. Candidate C sees reactions only one step out.
2. **The rules give reactions a price.** A bait pays only if the reaction costs the reactor more
   than the turn spent baiting it. The prototype (below) found that this, not the planner, is
   what limits bait in today's engine.

### The proof of concept (`prototypes/combat-planner/`)

Before anything else is built, a throwaway prototype tests candidate A's core claim: that a
planner with no combinations written into it finds useful two- and three-action combinations by
itself.

- **How it is built.** It searches sequences of one fighter's own cards with a beam search.
  - Each sequence is scored over the same seeds by **the real Plan & Watch exchange** played on a
    copy of the fight, as the planner believes it to be. It never uses the fight's own dice.
  - It has one objective: health dealt, minus health taken, with a win or a fall weighed heavily.
  - A test checks that its code names no technique, verb or combo.
- **What it found** (one run is recorded in the prototype's README):
  - **Daze, then the finisher.** Greedy picks a plain shot. Two exchanges ahead, it finds the
    daze followed by the finisher that only lands on an open foe. The fighter's own default plan
    never uses the daze at all.
  - **Hide, then the killing blow.** Greedy throws the blade straight away (value 3.5). Two ahead,
    it finds conceal → blade (value 188): a lethal blow on a foe who can't see you goes through
    their guard.
  - **A belief moves the value.** Believing the foe sharp-eyed drops the same plan from 188 to 65.
  - **Whole fights, 30 a side, re-planning every exchange in the real engine:**

    | Scenario            | Default plan       | Planner               | What the planner played                                   |
    | ------------------- | ------------------ | --------------------- | --------------------------------------------------------- |
    | Hide, then blade    | won 11/30, took 66 | won **30/30**, took 6 | opened conceal → blade every time                         |
    | Daze, then finisher | won 2/30, took 99  | won 6/30, took 50     | mostly stepped back out of reach of a foe with only blows |

    In the second scenario the planner mostly stepped back out of reach. The diagnosis
    (`EXPERIMENTS.md`, Experiment 3) found that was mostly rollout noise and an 8-exchange cap.
    With 80 rollouts and fights fought to the end, it opens with the daze every time and wins
    16/20, better than any fixed strategy, by mixing the combo with kiting a foe who can't reach
    it.

  - **An induced reaction.** The model has it: a sharp foe out of chakra gathers 0 times in 100
    trials held up close, and 48 times after a step back. But the bait (step back, then hit the
    gathering foe) ranks second at depth three (72 against 91), so it is never chosen. In today's
    rules the reactions most worth baiting (the ready Guard, Dodge and Counter) are free and
    automatic, and the ones that cost something carry a small price. Whether to give a reaction
    a price is a **rules question for the owner**. It is not something the AI should paper over.
  - **A reaction with a price, found unprompted.** One narrow rule was tried, on the design branch
    only: a ready Dodge that slips an attack up close leaps clear to mid. The planner, with
    nothing written for it, started throwing a blow up close at a dodger who wanted range,
    20 fights in 20. It did so only when both the rule and a dodging foe were present (step back
    in all three controls). The rule is nearly balance-neutral and stays experimental until the
    owner has play-tested it (Experiment 1).
- **What it cost.** 530–625 ms a decision at depth two. The ways of cutting that were then measured
  against a slow reference planner (`perf/RESULTS.md`):
  - **The exact savings change no decisions.** Sharing simulated prefixes cuts 43% of the
    exchanges; a silent exchange with no story text makes each about a quarter cheaper.
  - **Looking only one move ahead is the one shortcut that destroys the combos.**
  - **Caches and offline tables barely help**, because fight situations rarely repeat.
  - **An approximate maths model** is fast (3 ms) but wrong wherever it skips a rule.
  - **GOAP-proposed candidates scored in the real engine** are the best trade: about 80 ms a
    decision, every combo kept, the Dodge exploit included.

### What was decided, and what is still open

The prototypes settled the planner (`EXPERIMENTS.md`, `perf/RESULTS.md`, `timing/RESULTS.md`):

- **Candidate A, with GOAP-proposed candidates.** Utility objective selection, with candidate
  sequences proposed from preconditions read from verbs and technique fields (never names) and
  scored in the real engine:
  - prefix sharing and a silent exchange;
  - a horizon of two exchanges;
  - the fighter's default plan playing on past the searched cards.
- **Plan once a round, with cheap reactive checks** (Part 8, rule 1). That is 2.5× cheaper than
  re-planning every exchange, for a small loss: 5 wins in 72 bench fights.
- **One planner for every mind**, its search scaled by tier (Part 4), so the dullest fighter
  runs the same planner with a narrow view, never a separate hard-coded AI.
- **The real-engine planner stays the referee.** Any faster model of the fight is judged against
  it before it replaces it.

What the prototypes showed the evaluation must handle:

- **Noise.** Rankings inside the rollout noise can't be trusted.
- **The race.** A horizon too short to see who wins the race favours delay. Scoring further
  ahead on a poor follow-on plan made things worse. A terminal estimate of the race is the cheap
  fix, still to try.

Still open:

- **Tier spread.** The ladder's effect is real but small next to fight-to-fight noise. A
  difference players can feel may need the identity and belief layers, not search alone.
- **Benches with the planner on.** The comparisons above (bench health, decision quality, the
  matrix, experience metrics) have yet to be run with the planner driving foes, at step 5 of the
  build (Part 13).

---

## Part 8: Time, commitment and fairness

### The time structure today

| Unit         | What happens                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Round**    | four exchanges (`ROUND_EXCHANGES`). The player sets their plan before it; between rounds, foes rethink defences (`adapt.ts`). |
| **Exchange** | every fighter takes one turn, in initiative order. Foes play the intent they telegraphed unless invalidated.                  |
| **Turn**     | one action resolved: the attacker's card against the defender's ready defence.                                                |

The player commits once a round to a _conditional_ plan: a priority list per distance with `when`
conditions and target rules, evaluated live at each of their turns. Mid-round calls stop the
round on six triggers (summoned, revealed, held, hurt, killer, ally down), each once a fight,
plus `FREE_CALLS` of their own by intellect.

Foes re-decide every exchange, but publicly. Their next action is telegraphed a full exchange
ahead, and the player's plan can key on it ("readying a jutsu").

### Who knows what, when

| What                         | The player                                              | A foe                                      |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------ |
| The other side's next action | **yes**: the telegraph (named with perception ≥ theirs) | **no**: the player has no telegraph        |
| The other side's whole plan  | known cards seen, or all with insight                   | never; only reads of defences and styles   |
| Reconsiders mid-round        | through conditions (live) and calls                     | every exchange                             |
| Reacts within an exchange    | conditions evaluated at their turn                      | intent kept unless invalidated (`keepsTo`) |

Today's balance trades a foe's re-decision every exchange against the player's view of every
foe's next move. It is roughly fair, but by accident, and it is fair only by being lopsided both
ways. Under the proposed rules both columns obey the same rules of knowing (Principle 3):

| What                         | Either side                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| The other side's next action | inferred from cues (Part 5), as clearly as perception, expertise and experience allow; feints muddy it |
| The other side's whole plan  | never; only beliefs built from what was seen, or all with insight                                      |
| Reconsiders mid-round        | later steps freely; the step already under way only on a call or break                                 |
| Reacts within an exchange    | at their own turn, from what the exchange has shown so far                                             |

### Proposed rules

1. **Everyone has a plan of a round's length; how much of it is binding differs.**
   - An NPC's mind plans once a round: its objective, and the best first card for it, with the
     fighter's own default plan playing on from there. The prototypes found the round plan is
     almost always one card plus that default plan, whose live conditions run the rest of the
     round.
   - Three cheap checks re-plan it mid-round, and nothing else does (they cost microseconds and
     fire about 0.4 times a round):
     - its next card can't be played;
     - a fact the plan relied on didn't come true (a foe open, itself hidden, a distance);
     - one of the player's call triggers fired for it.
   - Only the top tier re-scores between exchanges, and only with plenty of rollouts. A cheap
     re-score on few rollouts did worse than keeping the plan.
   - Its **next step is binding** once it is under way, which is the moment it starts giving off
     cues. It may change only if the step is invalidated (as `keepsTo` today) or by spending a
     **break** (rule 3).
   - The steps after the next are intentions, not commitments. The NPC re-plans them each
     exchange as its beliefs update. This is what "foes reconsider every exchange" means, made
     fair: they reconsider _beyond_ what they've shown.
2. **The player commits to a round, as today, but on equal terms.**
   - Their conditions are evaluated live. That is the same power as an NPC's re-plan of later
     steps.
   - A condition may key on what they read of a foe's next move, at a confidence the condition
     names. How much they read is their perception, expertise and experience against the foe's
     concealment, as it is for the foe reading them.
3. **Breaks mirror calls.** An NPC may abandon a telegraphed step only on the same triggers that
   grant the player a mid-round call:
   - summoned, revealed, held, hurt, killer, ally down;
   - plus free breaks by intellect, from the same `FREE_CALLS` table.

   Both sides then react to the same surprises with the same budget. A break gives off its own
   cue ("changes their mind"), so it is never invisible to someone watching.

4. **Cues both ways, not telegraphs both ways (the owner's direction).** Neither side is shown
   the other's queued card. Both receive the cues the readied action really gives off, and infer
   from them by their own perception, expertise and experience (Part 5, "Cues"). This keeps
   feints and surprise possible and still gives a sharp foe something real to react to. It
   replaces the earlier choice between a symmetric telegraph and no player telegraph. Still to
   test (Part 13): that the player, reading cues, never ends up worse off than today's telegraph
   leaves them against a foe they out-read.
5. **No reaction faster than a turn.** Nothing a fighter does reacts _within_ another fighter's
   turn, except the defences that already do (ready defence, intercept, spin, shield). Those stay
   rules, not decisions. An NPC that wants to answer an attack does it at its next turn, as the
   player does.
6. **Initiative is information.** A fighter acting later in an exchange has seen more of it. Both
   the forward model and the player's conditions read the current exchange as it stands at their
   turn. That is already true for the player and becomes true for NPCs, whose intent stands only
   if not invalidated.

### Is the AI then competent without cheating?

Under these rules a competent foe is one that:

- builds accurate beliefs from what the player shows;
- plans a round ahead;
- gives away only what its readied step's cues show;
- breaks only when the player could have called.

It never reads the player's slots, never sees their queued card, and never changes a step under
way for free. Its edge has to come
from understanding, which is what the bench's sharp-versus-dull test (Part 7) measures.

---

## Part 9: The player and the shared mind

### One architecture

The player's fighter has a `Mind` like anyone else. What differs is **who supplies which layer**:

| Layer      | NPC                  | Player (today)                              | Player (could be)                                          |
| ---------- | -------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| Identity   | derived, authored    | none                                        | chosen by the player as a doctrine                         |
| Beliefs    | its own observations | the read panel shows what _they_ could know | the same beliefs, shown                                    |
| Objective  | utility              | implicit in slot order                      | chosen, or suggested and confirmed                         |
| Plan       | planner              | the priority list                           | the priority list, or the planner under player constraints |
| Commitment | Part 8 rules         | the round, plus calls                       | the same                                                   |

The player's beliefs are computed by the same perception rules, which gives three things for free:

- the read panel is honest (it shows what you could know, graded);
- round advice is the mind's own view ("they keep a Counter up close: fairly sure");
- a watched player fighter plays by the mind instead of the default plan.

### Interface alternatives considered

1. **Priority list, advised (closest to today).** The player keeps slots, conditions and targets.
   The mind supplies the forecast ("this slot will rarely fire because…"), the round review and
   one suggestion. It never edits the list.
   - Agency: full.
   - Cost: none new.
   - Risk: the list stays the ceiling of the player's play, and repetition stays the player's
     own choice.
2. **Orders (objective mode).** The player picks an objective for the round ("set them up",
   "wear down", "protect Aiko", "outlast"), optionally a doctrine (aggression, risk, resources),
   and the mind plans the actions.
   - Like a teammate's stance, for yourself.
   - Agency: strategic.
   - Phone: one tap a round.
   - Risk: players who like the card puzzle lose it, and the AI's quality _is_ the player's skill.
3. **Orders with pins.** As 2, but the player may pin actions:
   - "open with Ember Fang";
   - "never use the scroll";
   - "keep Guard ready up close".

   The mind plans around the pins. Pins are the player's and the planner treats them as hard
   constraints, so the plan stays theirs.
   - Agency: high and adjustable.
   - Risk: a more complex screen.

4. **Plan, then edit.** The mind proposes a full priority list for the round from its objective.
   The player edits it like today's, and edits are kept (as `stance keeps edited cards` does).
   - Agency: full.
   - Risk: proposals the player doesn't understand. Each slot carries its reason.
5. **Per-exchange choice.** The player picks every action live. Rejected as a default: it breaks
   Plan & Watch's round rhythm and the phone budget. It is noted only because the mind makes it
   cheap to offer as a "focus" mode in a special scene (a duel), if wanted later.

### The owner's direction: three levels of one interface

Prototype 1 (advised list), 4 (plan then edit) and 3 (orders with pins) **together, as three
levels of one interface**, not as modes chosen once. They suit different situations and
different amounts of engagement: a known foe in a routine job, or the duel that matters. The
mockup (https://claude.ai/artifact/7WJVAf8o39zmcz5arbyB8o) does it like this:

- **One switch, one plan.** A three-stop control, "Who plans this round" (your list, plan then
  edit, orders), sits above the same plan: slots per distance with their conditions and targets,
  and one ready defence per distance. The switch decides only who fills the slots you haven't
  set, and how much of the list you see.
- **A hand-set slot and a pin are the same thing.** Both are the player's, carry their seal and
  are hard constraints for the planner. The mind's slots are marked as drafted, each with its
  one-line reason. Slots it changed to fit around your edit are marked as re-drafted.
- **Moving between levels never loses anything.**
  - Orders → plan then edit opens the drafted plan as the list, with your pins already in it.
  - Editing a slot makes it yours, and the mind re-drafts around it.
  - Plan then edit → your list turns the reasons into forecasts and adds the one suggestion.
  - "Ask for a plan" from your list refills only empty and drafted slots.
  - Back to orders turns every slot you set into a pin, worded as an order ("open with Ember
    Fang").
- **Forbid pins act on the hand**, not on slots: a forbidden card is never reached for, even in
  an emergency.

Decided after the clickable prototype (https://claude.ai/artifact/5u6NUFDoxSsmLCMj7KD3P1):

- **Doctrine is a standing preference**, not part of a round's order: how you fight
  (aggression, risk, chakra) is set once, behind a "How you fight" control on the plan screen
  at every level, and holds for every round until changed. The mind drafts by it; slots you set
  are never touched.
- **Your list adopts everything as yours.** There is no third "from the draft" mark: moving to
  your list makes every slot and defence yours, and the list shows no ownership stamps at all.
  "Ask for a plan" fills only empty slots; handing a slot back empties it for the mind to fill.
  Moving to Orders after that brings the whole list across as pins, folded into one entry
  ("Your list, kept as pins") with a way to hand the list back in one press; forbidden moves stay
  listed on their own.

Still open from the mockup:

- Which stop does a mid-round call open on? Probably the one you were on, with the order kept.
- Does the planner get your intellect's slot count, so a draft always fits back into your list?
  The prototype assumes yes.

Per-exchange choice (5) stays out. Orders without pins (2) is simply level 3 with no pins.

### Teammates

Teammates already fight by `stance` and take `orders` the bond has earned (`teamOrders.ts`).
Under the mind:

- a stance becomes an objective prior plus identity tilts;
- an order becomes a pin.

The bond's gating stays exactly as it is.

### Meaningful repetition, measured

The experience bench's "repeat rate" is replaced as a goal by two measures computed from the
mind's own explanations:

- **Dominated repeats.** The fighter repeated a move when, by its _own_ beliefs, another option
  scored clearly higher. This is a decision bug.
- **Exploited repeats.** The fighter repeated a move after the target had shown it was read: its
  slips of that move rising, or a beating defence raised. This is a perception or adaptability
  matter, and expected in dull or rigid minds.

Raw repeat rate is still reported, with no target. A fighter that throws its best attack eight
times because it keeps landing is playing well.

---

## Part 10: Integration with the existing engine

### Reused as they are

These are mechanics, or knowledge the mind reads. They don't change.

| Module                                                                                    | Role under the mind                                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `rules/` (damage, avoidance, defence, effort, reach, rows, elements, conditions, pace, …) | the forward model's formulas                                                    |
| `worth.ts` (`cardWorth`)                                                                  | the core of "what is this action worth against this foe", used by every planner |
| `distance.ts`, `pairMoves.ts`, `rows.ts`, `canReach`                                      | position reading and movement effects                                           |
| `cards.ts`, `playable`, `needed.ts`, `slots.ts` (`fromSlot`)                              | legal actions and the player's slot semantics                                   |
| `causes.ts`, `slotTrace.ts`, `roundWhy`, `fightGlossary`                                  | observations' source, and the explanation surface                               |
| `intent.ts` (telegraph text, `intendedCard`, `keepsTo`)                                   | the commitment surface (Part 8)                                                 |
| `roundCalls.ts` (triggers, `FREE_CALLS`)                                                  | the shared trigger list for calls and breaks                                    |
| `rules/familiarity.ts` (`familiarScale`, whole fight)                                     | a mechanic: being read makes you easier to slip; beliefs predict it             |
| `reads.ts`                                                                                | becomes two observation kinds (Part 5)                                          |
| `team.ts` stances, `teamOrders.ts`                                                        | objective priors and pins                                                       |
| defaults (`defaults.ts`, `kitSlots.ts`)                                                   | the player's default plan, and a fallback policy for any fighter without a mind |

### Absorbed into the mind

Each of these is a tactical idea now written as an override. Under the mind each becomes an
objective, a candidate generator, or a term in valuation, and its tests become scenario tests of
the mind ("facing a killer, a sharp fighter holds them or gets out of reach").

| Module                                                                     | Becomes                                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `judgement.ts` (adherence, `adaptsAfter`, `beatsWeight`, `worthSharpness`) | tactical intelligence and adaptability. **The adherence coin goes.**                      |
| `choose.ts` (the instinct cascade and weighted roll)                       | candidate actions and considerations                                                      |
| `priority.ts` `counterPick`, `changeUp`                                    | prediction-driven valuation: a counter-pick is what beats a believed defence              |
| `setups.ts`                                                                | the **Set up** objective (hide → hold → finish as a candidate sequence)                   |
| `survival.ts`                                                              | the **Survive** objective and the lethality reading. The killer test stays as a function. |
| `shelter.ts`, `resting.ts`                                                 | **Recover** and **Outlast**                                                               |
| `pacing.ts`                                                                | resource management (keep chakra for the finisher)                                        |
| `targeting.ts`, `foeTeam.ts` mark, `roles.ts`                              | target valuation and team objectives                                                      |
| `adapt.ts` between-round rethink                                           | choosing the ready defence from predictions, every round, by adaptability                 |
| `climbing.ts` worth-opening, `calling.ts` decision, `stillness.ts`         | **Escalate**. The ladder's and summons' rules stay mechanics.                             |
| `sight.ts`, Search/Dispel instincts                                        | **Find**                                                                                  |
| `pouch.ts`, `prep.ts` instincts                                            | candidates under any objective                                                            |
| `finishers.ts` (open-target logic)                                         | **Finish**                                                                                |
| `stepping.ts` `makingFor`, `fightsFromHome`                                | **Control distance** and the preferred range                                              |

### Needs special handling

These are rules about bodies, perks and contracts, not judgement. The mind must respect them,
and some shape what a mind _is_.

- **Shared minds** (`mindContract.ts`, `sharedMind.ts`, `oneMind.ts`). One `Mind` serves several
  bodies. Beliefs and objective are shared, actions per body. The source takes no turns, and its
  fall ends every body. The architecture must allow one mind to many bodies from the start.
- **Shadow clones and summons with plans** (`shadows.ts`, `summonPlans.ts`). A shadow clone
  shares its maker's beliefs (it _is_ them) but plans its own turns, which makes it a natural
  test of one mind and many bodies. A summons has its own small mind, with an identity from
  its contract and beliefs told by its caller at the call.
- **Puppets** (`puppets.ts`). Driven, not minded: the master's mind plans the puppet's turns as
  part of its own plan, limited by threads held. Slack puppets drop out of the plan.
- **Perks that change perception.** Each one changes observation, not decision logic:
  - insight sees every card held;
  - foresight gives sharper predictions, which is precisely what the mind models;
  - all-seeing sees hidden bodies and threads;
  - mimicry adds a watched technique to the kit, and so to the candidates;
  - the blind spot is a belief that sharp foes can form about an all-seeing fighter.

  The perks' combat rules stay in `rules/eyes.ts` and the rest.

- **Ladders, Sage Mode, meditation, veils.** Their costs, tolls and timing are rules. The mind
  decides _whether_ (Escalate) but never changes how.
- **Hives and dust.** Pools with their own rules. The mind values their costs and the losses an
  area would bring (`worth.ts` already does).
- **Chains and the style strike** (`chaining.ts`, `repertoire.ts`). A chain is a macro-action:
  one turn of several moves, each only while the last landed. The style strike's "feel" choice
  stays a rule of the art, applied after the mind picks "strike with my style". It is part of
  what the art _is_, not tactics. The mind treats both as single actions with their expected
  values.
- **Combination techniques.** These need a partner who knows the other half. The candidate exists
  only when a partner is placed, which is a team objective's concern.
- **The player's plan.** The player's slots, conditions and pins are hard constraints. The mind
  never edits them, and when it acts for the player it plays inside them (`kitPlay`'s rule).
- **Spars, exams, stalemates.** The fight's purpose comes in through the setup as context
  (Part 4.5). The engine still owns the result rules.
- **Cowardice, pack and the other kit traits.** Their mechanics (`rules/kit.ts`) stay. Their
  _temperament_ (a coward flees when hurt) moves into identity, so a cowardly foe that isn't
  hurt fights normally.

### What doesn't change for content

Packs author no new data unless they want to. Identities derive from kit and traits, and
objectives and the planner read existing technique data. An optional `fighting` field on
`PersonDef`, `EnemyDef` and `CombatantSetup` lets authors pin a named character's style.

---

## Part 11: Worked examples

The numbers below are illustrative, to show the reasoning. They are not tuned values.

### Situation A: the Counter up close

> Round 3, exchange 1. You (a chūnin taijutsu fighter, 60% health, chakra half full) stand at
> close range with one foe. In rounds 1–2 you kept **Counter** ready up close and it punished
> two plain blows. The foe is at 75% health with a strong taijutsu technique (a _break_), a
> mid-range ninjutsu shot and a hold.

The beliefs every foe below can form are the same, because they saw the same thing. "Keeps a
Counter up close" has two clear observations, both punished blows. How much each foe makes of
it, and what it does about it, differs:

| Foe                                                                      | Identity                                           | Belief and confidence                                                         | Objective chosen, and why                                                                                                                        | Plan for the round (first step telegraphed)                                                                                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gentle-palm adept** (sharp, B; outwit; discipline high; risk low)      | evidence strong, weak prior                        | "Counter up close: sure". Predicts: Counter ready next exchange.              | **Set up**. A _break_ beats a Counter (`beats`), but a hold first makes the break unslippable, and risk-averse minds pay one turn for certainty. | Hold → break → break. Telegraph: "Readying a technique". If the hold is resisted twice, fall back to **Wear down** with breaks.                                               |
| **Street brawler** (dull, E; overwhelm; aggression high; discipline low) | strong prior, holds only defence habits            | "Counter up close: maybe" (two observations aren't enough against its prior). | **Wear down**, at close. It doesn't entertain "they're baiting me".                                                                              | Blow, blow, blow. It walks into the Counter again. After a third punished blow the belief crosses its threshold and it switches to its _break_: slow to learn, but it learns. |
| **Lantern-wind illusionist** (sharp, B; outwit + deceive; prefers far)   | sure of the Counter, and _also_ "closes to strike" | Predicts: Counter if I stay, a step in if I leave.                            | **Control distance**. Its kit is better at mid, and the Counter is irrelevant there.                                                             | Step back → ninjutsu shot → illusion. Telegraph: "Backing off". If you follow with an entry, its hold-off (`zoning.ts`) meets you.                                            |
| **Retired captain** (sharp, A; protect; teammate of a genin at 30%)      | sure                                               | Your next likely target is the genin (threat to the weakest).                 | **Protect**. Covering its genin beats trading with you.                                                                                          | Steps between, keeps Guard → hold on you → blow. The break waits.                                                                                                             |

All four act on the same belief. The difference is what they want and how sure they need to be.
The brawler's mistake is in character, and the read panel can say why: "doesn't believe you'll
Counter again yet".

### Situation B: the killer

> Round 4. A foe opens the fifth gate (`ladder`) and announces a killing blow. Each defender
> below is at 55% health; the killer's blow, by their beliefs, would take 70–90%.

| Defender                                           | Lethality reading                                      | Objective               | What it does                                                                                                                            | Today, for contrast                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Sharp medic** (outlast; risk very low)           | "can end me: sure"                                     | **Survive**             | Evade this exchange (danger share, `evadeFocus`), then step back. The gate's toll will do the work, and outlasting the killer is a win. | `survival.ts` picks a fixed order: hold, Evade or step, Brace.                                      |
| **Sharp swordsman with a hold** (outwit; risk mid) | "can end me: sure"; "a held killer can't strike: sure" | **Survive** by **Deny** | Hold the killer (a _channelled_ pin, `holding.ts`), then strike the held body. The beam search finds hold → finish beats waiting.       | Hold, if `setupPlay` happened to apply.                                                             |
| **Reckless genin** (dull; overwhelm; risk high)    | "can end me: maybe" (it never saw a gate before)       | **Wear down**           | Throws its best attack, gambling it fells the killer first.                                                                             | The same, _if_ the adherence coin landed on instinct. Under the mind it is in character every time. |
| **Captain with a teammate in reach** (protect)     | "can end my teammate: fairly sure"                     | **Protect**             | Intercepts, at a cost it accepts.                                                                                                       | No rule covers this today.                                                                          |

### Situation C: the hidden set-up killer

> Forest ground, round 1. A foe with a conceal, a hold and a lightning blade (`lethal`) faces
> two genin and a sensei.

- **A sharp set-up killer** (outwit, deceive, patient) takes **Set up**: hide, hold the frailest
  (the mark), finish. Under the mind this is a three-step plan its beam search finds. Today it
  is the hand-written `setups.ts`.
- **The same kit, dull** sees only **Wear down**. It hides when hurt (shelter) and throws the
  blade at whoever is in front, guard or not. The kit is the same, the play is worse, and it is
  explainable: "too impatient to set it up".
- **The sensei on your side** forms "something is hidden that could end the frail one: fairly
  sure" from the vanish and the blade's earlier glimpse. It takes **Find**, and it Searches
  before the hold can land: a Deny that no module writes today.

### Situation D: when repetition is right

> A genin with one strong ninjutsu shot faces a slow bandit captain at mid. The shot lands four
> times out of four.

| Fighter                                         | Repeats?              | Why                                                                                                                                                                                                                    |
| ----------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The genin (any identity)**                    | yes, a fifth time     | "lands on them: sure"; no evidence the captain has adapted. The best action stays best. This is not a dominated repeat.                                                                                                |
| **The genin, after the captain slips it twice** | changes, if adaptable | Beliefs: "they've read the shot: fairly sure". The predicted success drops, so a blow or a hold now scores higher. A rigid genin keeps throwing it: an _exploited repeat_, in character, and the round review says so. |
| **The captain** (sharp)                         | changes its defence   | Its belief "leads with the shot at mid: sure" drives its ready defence to Dodge at mid, from the prediction, not from `adaptsAfter`'s fixed count.                                                                     |

### Situation E: the player gives orders (interface 3)

> Same as A, from your side. You pin "keep Counter ready up close" and choose the order **Wear
> down**. Your doctrine: aggression mid, risk low.

The mind's beliefs about the foe: "has a break: sure" (seen in round 1) and "Gentle-palm style:
fairly sure". It predicts the hold and the break for the coming round. Inside your pin, it plans:

1. Step back to mid, where the break can't reach and the Counter pin doesn't apply.
2. Your ninjutsu shot.
3. Step in again only once the foe has spent its hold.

The plan screen shows the three steps and one line: "They'll try to hold you up close, so this
keeps you out of reach until they've used it". You can accept it, edit a step (it becomes your
slot, pinned), or switch to your own priority list.

---

## Part 12: How we'd know it works

1. **Every existing bench keeps its bar.** Lethality (equals fight two to three rounds, about
   half each), content, bestiary and foreign shinobi, defence, holds, teams and retinues. These
   hold the _rules_, and the mind must not shift them except by playing better.
2. **New decision benches.**
   - **Sharp beats dull**: the same build and stats, tactical intelligence A against E. A clear
     majority, but not a certainty.
   - **Identity shows**: in a fixed scenario, aggressive and cautious identities choose
     measurably different objectives.
   - **Scenario tests**: each absorbed module's behaviour as a scenario of the mind (Part 10).
   - **Fair information**: a test that perturbs everything a fighter couldn't know (the
     opponent's slots, hidden stats, the Rng's future) and checks the decision doesn't change.
     This is the strongest guard against cheating, and it is cheap.
   - **Forward model drift**: predicted against real outcomes, within tolerance.
3. **The matrix narrows for the right reasons.** Fewer pairs outside the band, with the poorly
   piloted builds (hive, puppet, dust, set-up killer) improving the most.
4. **Experience metrics.** Dominated repeats near zero for sharp minds; exploited repeats tracking
   adaptability; plan screens per fight; how often the explanation can name an objective.
5. **The budget** (Part 7).
6. **Goldens and prose.** Decisions change the fight text, so goldens move. Every regeneration is
   read, as now.

---

## Part 13: A build path (not authorised)

The owner has not authorised a build. Each gate must be passed, with numbers, before the next is
asked for.

1. **Gate: planner proof of concept. Passed.**
   - Unscripted combos were found and played in the real engine, and so was an induced reaction
     under a priced Dodge.
   - The approach and its cost are settled: GOAP candidates in the real engine, once a round,
     scaled by tier, inside a fight-wide budget per round (Part 7).
   - Left for the build, not the gate:
     - a terminal estimate of the race;
     - timing on real devices;
     - the Dodge rule, which waits on the owner's play-test.
2. **Gate: cue inference. Passed, with the owner's decisions** (Part 5).
   - The kind of move and a known technique are read close to today's telegraph when you
     out-read a foe.
   - A first-sight technique is described rather than named: 95% named or described, every
     description true.
   - Low perception still gives a usable read.
   - Left for the build:
     - feints, which need a rule;
     - running the inference in shadow beside today's telegraph before players see it.
3. **Gate: one-interface controls.** Feel-test the three levels as clickable screens at 1440 and
   390, from the mockup, before any engine work.
4. **Then, each its own PR with benches green:**
   - a decision log for today's AI (why each move was chosen), as the baseline. **Done (#305):**
     `docs/design/research/decision-baseline.md`;
   - observations and beliefs, shown only. **Done:** `engines/plan/mind/` (witnesses, evidence,
     beliefs, words), shown in the read panel as "What you make of them". Cues and predictions
     (Part 5) come with the objective layer;
   - identities and competence sources, derived;
   - the objective layer in shadow;
   - the planner switched on for foes, absorbing modules one at a time (Part 10);
   - teammates and watched players;
   - the player controls;
   - the commitment rules.

Fixes the prototypes turned up, already merged into `main`:

- an attack lost in a field no longer depends on its story line (#301);
- default plans now slot what a finisher needs beside it (#302).

---

## Part 14: Open questions for the owner

Settled:

- **Telegraphs.** Cues both ways, never the queued card (Part 5, Part 8 rule 4).
- **Controls.** Orders with pins, plan then edit, and the advised list, as three levels of one
  interface (Part 9). Doctrine is a standing preference; your list adopts everything as yours.
- **The planner.** GOAP candidates in the real engine, once a round, one planner scaled by tier
  (Parts 4, 7, 8).
- **Movement.** Stepping back stays as it is. A fighter with no range being outplayed at range is
  the cost of having no range.
- **Dodge.** The leap stays experimental until play-tested. Variants ("keep close", "break
  away", "reposition") are analysed in `EXPERIMENTS.md`. The recommendation is to take the
  intention from the plan's _fight at_ rather than add options, with repositioning left for team
  fights.
- **Cues.** A first-sight technique is described, not named; concealment is weighted towards
  perception (Part 5).
- **The build.** Not authorised; gated (Part 13).

Still open:

1. **The Dodge play-test.** Adopt, change to the derived intention, or drop. It is now in the game
   as a versus rule on trial (#303).
2. **Feints.** What enables them (a technique, a trait, an identity's deception) and what they
   cost.
3. **Prices for other reactions.** A Counter that leaves its user exposed matters only once
   teammates plan, so it can wait for that.
4. **Target devices.** Which phone and PC set the budget, so it can be measured there.
5. **How visible identity is.** Should a scouting read name a foe's temperament ("reckless",
   "patient"), or should players learn it by fighting?
6. **Experience.** Is the field book's count of foes fought enough, or should a character keep
   experience by kind of foe and by art?
7. **Authored styles.** Should named characters get authored identities?
8. **Balance timing.** Do we hold balance changes until the mind lands, so we don't tune twice?
