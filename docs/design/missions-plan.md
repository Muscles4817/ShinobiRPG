# Missions overhaul: review, decisions, plan

Working document for rebuilding how missions play, who goes on them and how they end. Part 1
is the review of today's missions. Part 2 records what we agreed. Part 3 is the design that
follows from it, with the Pilgrim Nun escort worked through as the reference job. Part 4 is
the build plan. Nothing here is binding until it is in Part 2.

---

## Part 1: The review

### How a mission plays today

1. **The board.** The mission hall is a notice board of tilted papers: rank, team stamp,
   title, a sword if a fight is likely, client, pay and how long it stays up.
2. **The notice.** A sheet with a one-line summary, chips (ryo, reputation, energy, slots,
   threat), the foes if you bought the client's report, any blocker, and _Accept_.
3. **The run.** Every slot is charged up front. `MissionScene` shows a vignette and a growing
   story feed; the choice bar offers _Continue_, _Fight_, _Size them up_ or a check's
   approaches with their odds.
4. **Encounters** switch to `EncounterScene` (field notes, recon, ways in); fights to the Plan
   & Watch screens and a fight report.
5. **The debrief** is a report card of rows: reward, docked ryo, reputation, missions done,
   team bond, and the last story line.

### What is wrong with it

Playing through is the weakest part of the game, and most of the problem is structure, not
the screens. The writing in the job fills is good; the shape it is poured into is not.

- **Every mission is the same template.** A straight line of three to five stages. A check is
  "pick a stat, roll, read one sentence". Nothing done in stage 2 changes stage 3.
- **Failure only shaves the pay.** `onFailure: 'penalty'` multiplies the reward by 0.75. You
  are never in a different situation because something went wrong.
- **Every choice is a stat pick.** There are no decisions about what kind of shinobi you are:
  speed against safety, pay against kindness, the job against the team.
- **There is no journey.** No sense of distance, days, weather, places passed or people met.
  Nothing happens between the authored stages.
- **Teammates are silent.** They are chips, allies in fights and a name in a check's odds.
  They have no opinions, no lines, and the job never changes how they feel about you beyond
  a flat bond award.
- **The world does not notice.** Nothing you do on a job shows up afterwards.
- **The debrief does not explain itself.** The run only stores one pay multiplier, so the
  card can say "docked" but not why. The last story line is shown out of context.
- **Rules drift.** Roll lines ("Perception check passed at 62%") put numbers in the story
  feed, against the UI rules. A genin can be sent solo against bandits (D-rank road and
  trouble templates) or onto a solo C-rank job (`RANK_FOR_MISSION.C = 'genin'`).

---

## Part 2: Decisions

1. **Three tiers of mission.**
   - **Short (errand):** one or two beats, within a day. Today's shape, tidied.
   - **Medium (journey):** **2 to 7 days**, built on the reference template in Part 3.
   - **Long (story arc):** **a week or more**, built around a story structure and a base
     location with its own objectives, rest, watch and bonding.
2. **One engine, three sizes.** All tiers are made from the same building blocks (Part 3.2).
   A long arc's excursions are built like medium jobs.
3. **Story structures.** Medium jobs follow **kishōtenketsu** (setting out, the road, the turn,
   arrival); the turn is the twist slot. Long arcs follow **Harmon's story circle**, whose
   "search" half is time at the base location.
4. **Missions remember.** Marks and threads carried through the run change later text,
   choices and stages. Failure moves the story (fail forward); it does not just cut pay.
5. **A D-rank charge is never lost.** At worst they are hurt: the pay is cut and the ending is
   sadder. From C-rank an escort can fail, and losing the charge may turn the job into a
   rescue.
6. **Written for both solo and team.** Templates mark team-only and solo-only beats.
7. **Genin never go solo into danger.** Danger comes from the foes. The board, the start
   action and a content test all enforce the assignment rules (Part 3.6).
8. **Crews are assigned per job**, not fixed to your genin team:
   - Chūnin lead some C-rank jobs and **safe** B-rank jobs; they may take a C-rank solo
     sometimes.
   - Chūnin go out with their old team, lead a random team of genin, go with one or two other
     chūnin, or (for A-rank) go under a jōnin lead with two other chūnin.
   - Jōnin take B and A solo, depending on their experience.
9. **Threads show as words with dots**: "At ease ●●○".
10. **The debrief is built from a ledger** of causes and effects, so it can say what happened
    and why.

---

## Part 3: Design

### 3.1 The tiers

| Tier   | Feel                     | Shape                                   | In-game length |
| ------ | ------------------------ | --------------------------------------- | -------------- |
| Short  | A vignette               | Setup, maybe a complication, resolution | 1–2 slots      |
| Medium | A trip with a turn in it | Ki · Shō · Ten · Ketsu                  | 2–7 days       |
| Long   | A stay somewhere else    | Harmon's circle around a base location  | 7+ days        |

**Short.** The cat, the weeding and the lantern patrol stay quick. They gain failure that
costs something with a reason in the ledger, perhaps one mark that changes the ending, and
the new debrief. No legs, camp or twist.

**Medium.** Legs measured in days, authored beats, drawn road events, a camp scene, a twist,
an encounter shaped by everything before it, and an ending chosen by marks. Part 3.4 works
one through.

**Long.** One authored arc, not a template (sketch in 3.9).

### 3.2 Building blocks

Missions **stay a list of stages**. Branching comes from stages that skip themselves when
their condition fails, not from a graph. Fail forward is "failure sets a mark, and a later
stage that needs it appears". Saves keep a stage index.

| Block                 | What it is                                                                                                                                                        | Owner                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Marks                 | Named flags on the run (`run.marks`). Templates declare them; validation checks every mark read is set somewhere.                                                 | `systems/missions`         |
| Threads               | Small labelled counters (trust, daylight) declared per template, with a word for each level, shown as words with dots.                                            | `systems/missions`         |
| Conditions            | `when` on stages, approaches, choices and text variants: has / lacks a mark, a thread at least a level, crew is solo / team / led by you, and all / any of these. | `systems/missions`         |
| Effects               | What a result does: set a mark, move a thread, bond (crew or charge), time, harm, energy, pay with a cause. Replaces `onFailure: 'penalty'`.                      | `systems/missions`, `game` |
| `decision` stage      | Options carry a `Tone` and effects; no roll. Traits' tastes decide how teammates and the charge take it.                                                          | `MissionStage`             |
| `leg` stage           | A day (or days) of travel: an authored beat, a drawn road event, or a quiet stretch in one line.                                                                  | `MissionStage`             |
| `camp` stage          | Pick N activities before the fire burns down: talk, watch, train, rest, cook.                                                                                     | `MissionStage`             |
| `ending` stage        | Variants by condition; the first that matches is the ending.                                                                                                      | `MissionStage`             |
| The charge            | An optional character on the job: name and tastes (trait likes / dislikes), written by the fill.                                                                  | content                    |
| Road event pools      | Events keyed by region, season, weather and time of day, drawn by seed hash like the board. Written once, drawn by every job.                                     | `content/shared/road/`     |
| Twists                | Per template, a weighted list, rolled with the Rng when the job starts and kept as a hidden mark. Fills opt in by giving the twist's text.                        | template                   |
| Voices                | Short lines by moment (check passed / failed, decision, camp, arrival) and trait, filled by the talk-template machinery.                                          | `content/shared/talk/`     |
| Ledger                | Each effect recorded with its cause line and stage. The debrief and failure reports read it.                                                                      | `MissionRun`               |
| Memories, world marks | Notable moments kept on people; world marks that gate follow-up jobs and people. Later phase.                                                                     | `people`, new world slice  |

Reused as they are: tones and trait tastes, the encounter (recon, alertness, approaches,
`encounterPay`), conversations for camp talk, seed hashing for draws, `checkHand` for who
takes a check, team orders and the medic between stages.

### 3.3 Days on the road

A medium job is measured in days. A week can't be seven days of taps, so each day is a leg
that plays one of three ways: an **authored beat**, a **drawn event**, or a **quiet stretch**
summed up in one line with chips for time, food and rest ("Two quiet days along the coast
road").

**Budget for a medium job:** 5–8 real decisions in all, one full camp scene for about every
two nights; other nights pass in a line unless an event is drawn. It feels long because the
road and the places change, not because there are more screens.

**Life on the road.**

- **Food:** rations are carried. Hunger ticks each day as now, so packing food is real
  preparation (the market, or the client provides some). Running short is a complication.
- **Training:** a camp activity drills by the fire at reduced efficiency, through
  `growCharacter`. On team jobs the sensei's weekly lesson happens on the road.
- **Rest and wounds:** nights restore energy; injuries heal over the days as at home.

**The village keeps moving.** Peers, the board and gossip already catch up lazily by day.
Missed things say so (a festival in the gossip, a lost teacher session). A notice warns when
a job would bring you home after an exam you're nominated for, and the sensei won't sign it.

**Pay** scales with days away: a named constant for ryo per day away, checked by the pacing
bench, so a week-long job competes with a week of training and errands.

**Time** is charged per leg, in whole days. Every end-of-day rule (meal cleared, hunger, peer
growth) must be correct across multi-day jumps, with tests, before anything builds on it.

### 3.4 The reference job: the Pilgrim Nun

The short-escort template played with Kohaku's fill. Team-only beats are marked 班.

**Threads:**

- **Kohaku's trust:** doubtful → polite → at ease → trusts you. Starts at _polite_.
- **Daylight:** three dots each morning. Detours and setbacks spend one; at none, dusk falls
  before the day's goal.

**Marks** it may set: `knows-why`, `saw-scouts`, `night-road`, `charge-hurt`, and one hidden at
the start, the twist.

**Over the days:**

| Day | Leg              | What happens                                                                                    |
| --- | ---------------- | ----------------------------------------------------------------------------------------------- |
| 1   | Setting out      | Meet Kohaku. The hill road with a drawn event. Night at the Shiraki waystation, or a cold camp. |
| 2   | The pilgrim road | The spring. The dusk decision. The full camp scene below the pass.                              |
| 3   | The boulders     | The twist revealed. The encounter. Arrival and the lantern.                                     |
| 4   | Home             | A quiet stretch: one line, chips, the debrief.                                                  |

#### At the board

The notice names the kind of job and its length: _Escort. Three days on the hill road._ A
glyph row shows its shape (road, road, camp, road, a sealed encounter the report unseals) and
the crew (3.6).

#### 起 Ki: setting out

**Meeting the charge** (`decision`):

> Sister Kohaku looks you up and down. "You're very young. Have you eaten?"

- _"I ate. We should get moving."_ (earnest)
- _"…Not yet, actually."_ (kind): she presses a rice ball on you. Trust up.
- _"That isn't part of the job."_ (challenge): she laughs, but trust down.

Kohaku has tastes like a trait (likes kind and earnest, dislikes tease), so the tone rules
decide how a reply lands. 班 Teammates react to the same tone through their own traits.

#### 承 Shō: the road

**The hill road** (`leg`, day 1): the fill's chatter, then one event from the hill-road pool,
for example:

> An ox-cart has slid into the ditch. Its owner is trying to lift it alone, red in the face.

- **Help:** a strength check (班 or the strongest teammate). Costs a dot of daylight. Kohaku
  notices (trust up); kind teammates approve.
- **Walk on:** brash teammates approve. Kohaku says nothing, which says plenty.

Other draws: a wayside shrine, a peddler, a storm, a rival team heading the other way, a fork
with a shortcut. This is where repeat runs differ.

**The spring** (`check`, day 2), failing forward: the same three approaches as today.

- **Success:** no time lost. Succeeding through patience also raises trust.
- **Failure:** a dot of daylight lost ("she blesses you too, at great length"). The pay is not
  touched; the lost light matters later.
- 班 A line from a teammate afterwards, chosen by their traits.

**Dusk** (`decision`, only when daylight is gone):

> The light is going. The boulders are an hour on, and the road is narrow.

- **Push on in the dark:** sets `night-road`. Skips the camp; arrives a night sooner; the
  encounter is in darkness.
- **Make camp below the pass.**

With daylight left there is no decision: you reach a roadside shrine's shelter before dark,
and the camp is warmer.

#### The camp

**Around the fire** (`camp`, pick two, then the fire burns down):

- **Sit with Kohaku:** at _polite_ or better she tells you why she goes (the fill's
  confidence line, her brother). Sets `knows-why`; trust up. Below that she changes the
  subject.
- 班 **Sit with a teammate:** a campfire conversation with camp-flavoured templates. Bond as
  usual plus a camp bonus.
- **Take first watch:** a perception check (班 or the crew's best sentry). Success sets
  `saw-scouts`: _a figure on the rocks ahead, gone when you look again._
- **Drill by the fire:** a reduced-efficiency training session.
- **Sleep properly:** energy back.

Solo, it is Kohaku, the watch, the drill or sleep. Going without a crew should feel lonelier,
not just shorter.

#### 転 Ten: the turn

**The twist revealed** (rolled at the start; the fill decides which it supports):

- **Desperate men:** the robbers are starving; the lookout is a boy no older than you. Talking
  becomes easy. Sparing them sets a world mark.
- **Hidden cargo:** the lantern case is heavy for a reason (offerings for the shrine) and the
  robbers know it. Foes start alert. Confronting Kohaku costs trust.
- **Followed:** 班 another genin team has shadowed you from the village, eager to help. They
  join the encounter as a rival with their own idea of how to handle it.
- **No twist:** rare, so twists never become a pattern you can rely on.

**The boulders** (`encounter`), shaped by everything before:

- `saw-scouts`: count and terrain are already in the field notes.
- `night-road`: sneaking is easier, but Kohaku stumbles; below _at ease_ she may be hurt
  (`charge-hurt`).
- Trust _at ease_ or better: Kohaku stays where you tell her; a fight doesn't put her at risk.
  Below that she may run when the fighting starts (a quick check afterwards).
- 班 Approach cards carry a tone (head-on challenge, talk kind, sneak quiet), so teammates
  weigh in: _"Ren wants a fight."_ _"Aiko looks at the boy, then at you."_ The pick moves bond.
- The twist adds or reshapes approaches.

#### 結 Ketsu: arrival

**The foot shrine** (`ending`):

- `knows-why` and _trusts you_: she hangs the lantern among a thousand others, then hands
  you the taper and asks you to light it. A memory is made; Kohaku leaves a small gift.
- `charge-hurt`: quieter. She thanks you, limping. The pay is cut, with the reason.
- Otherwise: today's ending line.
- Twist epilogue: with the desperate men spared, _the boy watches you go from the rocks_. A
  world mark can later post a follow-up or bring him to the academy gate.

The trip home is a quiet stretch.

#### Authoring cost

The template goes from about 13 placeholders to about 25 (the charge and tastes, the
confidence, two or three endings, twist texts). Writing per fill roughly doubles; the pools
for road events, voices and camp talk carry most of the variety and are written once.

### 3.5 The debrief

Built from the ledger. For the run above:

> **The Pilgrim Nun**, stamped _a rough road, well walked_
>
> **The road**
> Set out: took Kohaku's rice ball. She warmed to you.
> Hill road: pulled a carter out of the ditch. It cost the light you'd need later.
> The spring: tried to hurry the blessing and lost the last of the day.
> Camp: heard about her brother. Ren kept watch and saw a man on the rocks.
> The boulders: the lookout was a boy. You talked them down.
> The shrine: you lit the lantern together.
>
> **Pay** (chips): posted ryo, _escort arrived safe: full_, Kohaku's gift, reputation with
> _talked them down_ as its reason.
> **Crew:** Ren (chip), "you trusted his watch". Aiko (chip), "she'd have helped the carter
> too."
> **Carried home:** a memory, _the night below the pass_. The boy on the rocks: you may see
> him again.

- Every number is a chip with its cause beside it. A cut names the beat that caused it.
- The client's word comes in their own voice, as the payoff rather than a stray last line.
- When you led, a line rates your leadership (3.6).
- A **grade stamp** (clean, rough, botched) is scored from conduct marks, as the exam's
  `conduct.ts` does.
- On failure, **what would have helped**, from the same reading scouting makes: "They had an
  archer. Reading the camp first would have shown it."

### 3.6 Crews and assignment

#### Crew shapes

| Crew          | Who                                                               | Leads                                 |
| ------------- | ----------------------------------------------------------------- | ------------------------------------- |
| Solo          | You                                                               | You                                   |
| Old team      | You and your genin teammates                                      | The sensei from C-rank; otherwise you |
| Genin to lead | You and 2–3 generated genin                                       | You                                   |
| Chūnin squad  | You and 1–2 other chūnin (authored chūnin or promoted classmates) | The senior one, or you                |
| Jōnin-led     | A jōnin, you and 2 chūnin                                         | The jōnin                             |

The crew is set when a job is posted (seed hash, like the board), so the notice says who
goes: _"Lead three genin"_, _"With Hotaru and Gen"_, _"Under Jōnin Ise, with two chūnin"_.

#### Danger

Each `EnemyDef` gets a danger class: **petty** (a pickpocket, a drunk, a goose), **armed**
(bandits, beasts), **deadly** (rogue ninja and spirits a match for a chūnin), **elite**
(jōnin-level). Every class is validated against the foe's stats. A job's danger is its worst
foe, **twist foes included**, so nobody has to remember to mark a job dangerous.

A **safe** B-rank job has no elite foe. (Built as: chūnin-level rogues are what chūnin squads
are sent against; holding chūnin to armed foes would have left them almost no B-rank work,
since nearly every B-rank job in the packs has a rogue shinobi or a strong spirit in it.)

#### Who gets what

| Your rank | D                                       | C                                                     | B                                           | A                                             |
| --------- | --------------------------------------- | ----------------------------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Genin     | Solo if petty or no foes; else old team | Old team, sensei leads                                | never                                       | never                                         |
| Chūnin    | Solo                                    | Lead genin, old team, chūnin squad, or solo sometimes | **Safe only:** lead genin or a chūnin squad | Only jōnin-led, with two chūnin               |
| Jōnin     | Rarely posted                           | Lead genin                                            | Solo, or lead a squad                       | Solo once experienced; otherwise lead a squad |

- **"Sometimes"** is decided per posting by seed hash and a named share, so the same job may
  come up solo one week and as a squad job the next.
- **Jōnin experience** is the senior-mission record (`isSeniorMission`). A new jōnin gets B
  solo and A only as a squad; the share of A posted solo grows with the record (named
  constants).
- **Enforced three times:** the board never posts a disallowed pairing; the start action
  refuses one; a content test runs every job in every pack against every rank and fails CI on
  a genin alone against armed foes, a chūnin on an unsafe B, or a chūnin on an A without a
  jōnin.

#### Who leads changes how it plays

- **You lead:** every decision is yours. Crew give opinions and take orders (genin all orders;
  chūnin peers as far as your bond goes, the existing team-orders rule). Their safety is on
  you: a hurt genin is a ledger line, costs reputation and earns a word from the hall. The
  debrief rates your leadership.
- **Someone else leads:** at decisions you **advise**. The leader takes your call or overrules
  it by their judgement, style and your bond, so a trusted subordinate gets their way more
  often. Some beats become the leader's: _"Ise sends you ahead to scout."_
- **Genin under a sensei** is the same rule, formalising what `senseiAlong` already does.

Leading genin introduces the village's next generation; chūnin squads put you beside exam
rivals; a jōnin lead is a mentor in waiting.

#### The Pilgrim Nun under these rules

Bandits make it armed. A **genin** walks it with their old team (at D the sensei stays home, so
you make the calls: a first taste of leading). A **chūnin** takes it solo, or rarely leads two
fresh genin down the same road.

### 3.7 Presentation

- **One field screen** for every non-fight beat: a header with the route strip (legs, where
  you'll camp, where you're headed) and the day and time; the sky and backdrop change with
  each leg; the crew and the charge stand in the scene with their threads as words with dots.
- A **beat card** near the thumb holds the current situation. An encounter expands within it
  rather than switching screens. The story so far folds behind it as a log.
- Story arrives **in beats**, a few lines at a time.
- Choices are written as actions or speech. Odds are a small chip; on approach cards the
  crew's opinions sit beside them.
- A roll is a **moment** ("Ren leaps for the ledge…") and then an **ink stamp** in the margin
  (成 / 失 with the stat glyph). No numbers in the story.
- Fights stay their own scene, opened from the beat card and returning to it.

### 3.8 Consequences after the job

- **Follow-ups:** world marks post thank-you or grudge jobs (spare the farmers, and their
  village posts a job), so arcs run across several missions.
- **The world changes:** Kohaku's lantern hangs at the shrine; the freed bridge turns up in
  gossip; a spared leader resurfaces as a harder foe.
- **Clients remember you** and ask for you by name.
- **Memories** on people come back in conversation and in how they treat you.

### 3.9 Long arcs (sketch)

One authored arc around Harmon's circle:

1. **You → Need:** the village and the briefing.
2. **Go:** the journey to the base, built from medium legs.
3. **Search:** a temporary **base location**, an ordinary `LocationDef` with places (an inn, a
   camp, a foreign village's market or training ground), so place pages work there. An
   **objectives list** (main and side), days passing, bonding, watch and rest, and short
   excursions built like medium jobs.
4. **Find:** the midpoint discovery.
5. **Take:** the price. Something goes wrong; someone is hurt; the low point.
6. **Return:** the climax and the road back.
7. **Change:** the debrief and a changed world.

Acts advance on objectives done or deadlines passed. This needs its own design pass after
medium jobs work.

---

## Part 4: Build plan

Each step lands green (`npm run check`, `npm run check:release`) with tests, and with a
migration and a previous-version save test wherever the save shape changes.

1. **Crews and assignment.**
   - `EnemyDef.danger`, validated; `missionDanger` over every foe a job can bring.
   - `MissionDef.withTeam` → `crews` (mostly derived from rank and danger).
   - An assignment rule in `systems/missions` replaces `rankForMission` / `RANK_FOR_MISSION`:
     rank, record, job rank and danger, and the day's seed → a crew, or none.
   - Crew picking (generated genin, authored chūnin and promoted peers, the pack's jōnin) by
     seed hash; `run.crew` (leader, members) replaces `fieldTeamIds` for allies, orders, the
     medic and bond.
   - The board, the start action and a whole-pack content test enforce the rules.
   - The notice names the crew. Rewrite CLAUDE.md decisions 16 and 20.
   - Migration: a run in progress gets a crew from today's team rule.
2. **Multi-day time and life on the road.** Per-leg day charging; end-of-day rules proven
   across multi-day jumps; rations; drilling by the fire; the sensei's lesson on the road; exam
   collision warnings; pay per day away on the pacing bench.
3. **The building blocks.** Marks, threads, conditions, effects, the ledger; the `decision`,
   `leg`, `camp` and `ending` stages; road event pools; twists; voices. Validation for
   declared marks, threads and twist texts. Migration: runs in progress get empty marks, full
   threads and an empty ledger.
4. **The Pilgrim Nun** as the first medium job, end to end, solo and with each crew.
5. **The debrief** rebuilt on the ledger, with the grade stamp, crew lines and what would have
   helped.
6. **The field screen** (3.7), then converting the other road and trouble templates to medium
   jobs and tidying the short errands.
7. **Consequences:** world marks, follow-up jobs, memories, returning clients.
8. **Long arcs:** a design pass, then the first arc.
