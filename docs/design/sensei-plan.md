# The genin years: a sensei-led game until chūnin

Working document for making the genin years about your sensei. Until you make chūnin, your
sensei runs your week: they train you on their own schedule, read what will get you killed and
set you work on it, take you out of the village and bring you home, and teach you the game as
they go. Each sensei does it their own way, and the ways are data, so generated senseis can be
as distinct as authored ones. Part 1 reviews what the game has today. Part 2 records what we
agree. Part 3 is the design. Part 4 is the build plan. Part 5 records what was built. Nothing
here is binding until it is in Part 2.

---

## Part 1: The review

### What a sensei is today

The pieces exist, but they are separate rules that happen to name the sensei:

1. **Team assignment** (`game/people/senseis.ts`): two jōnin ask for your team, scored on your
   grade in their specialty, shared traits and nature. `SenseiProfile` holds the specialty,
   favoured traits, nature, a `style` line, a single `lesson` line and `toleratesReplacement`.
2. **The weekly lesson** (`actions/trainWith.ts`): your sensei is a teacher with no price who
   comes to the training ground by day once a week. The lesson uses the teacher rule (the grade
   gap × rank × quirk), with steering (`specialty` or `weakest`, free at a bond stage), and
   gives `SENSEI_BOND`. On the road it happens by the fire (`lessonAway`).
3. **Slips after a lesson** (`slipsAfterLesson`): the library permit (`game/permits.ts`), the
   week's travel pass (`game/leave.ts`) and the start of tree-walking (`game/exercises.ts`).
4. **Crews** (`game/crew.ts`): the sensei leads your old team on serious jobs (`seriousJob`:
   C-rank and up, or a foe much stronger than you). A genin goes alone only against petty foes.
5. **The exam**: the sensei nominates (bond, their judgement of your grades, a record), says
   the word the week before, and decides whether a replacement is tolerated.
6. **Teammates** get the sensei's lesson on their own weekday (`game/people/regimen.ts`).
7. **Teacher profiles** (`content/teachers.ts`): quirk (patient, harsh, natural,
   distracted), steering, signature `teaches`, sessions a week, a price.

### What is missing

- **Nobody runs your week.** Between lessons the sensei is just a person on a schedule. The
  game is the same whether you are a fresh genin or a jōnin, apart from the rules that block
  you.
- **No advice.** Weakness is only "the stat furthest behind" for steering senseis. Nothing says
  what will get you killed, though the fight rules know: evasion, guard, resistance and
  toughness are separate layers (`rules/defence.ts`), and scouting already reads a foe in words.
- **Talent is hidden and nobody tells you.** `aptitudeKnown` fills in only through training and
  gifts. The sensei is the obvious person to see it.
- **Out-of-village D-ranks go without the sensei.** The rule reads rank and danger, not
  distance, so a D-rank escort two days down the coast can be yours alone.
- **No onboarding.** Systems open as their rules allow; nothing introduces them.
- **Senseis differ in one line of text, a specialty and a quirk.** There's no backstory, no
  rituals and no way they run a team, so a generated sensei would be a name and a specialty.
- **Promotion doesn't end anything.** Making chūnin changes what the rules allow, but the
  relationship stays the same.

---

## Part 2: Decisions

Agreed.

1. **The mentorship lasts while you are a genin with a sensei.** `underSensei(state)` is the
   one question every rule asks (`game/mentorship.ts`). Promotion to chūnin ends it in a
   farewell scene, and the sensei becomes an ordinary teacher with no price.
2. **The sensei's control is soft but weighty.** They set a week's plan. Turning up and doing
   the work pays (faster growth on the assigned work, bond, praise, earlier signatures).
   Skipping costs bond, and they say something next time. Nothing is locked: the rest of the
   week is yours, and the plan loosens as your bond grows (the `freeAtStage` idea, applied to
   the whole week).
3. **Any job that leaves the village goes with your sensei.** In-village E and D jobs are
   yours alone (or with a genin squad, as now). A job with a `leg` stage or an `endsAt` is
   led by your sensei with your old team, whatever its rank. This amends decision 21 in
   `CLAUDE.md`.
4. **The sensei reads you in words, never numbers.** What will get you killed (the weakest
   defence layer against the foes you meet), what you are good at, and what you haven't found
   yet: a sensei's read is a new way to learn a talent (`aptitudeKnown`).
5. **The tutorial is the sensei.** Systems are introduced by curriculum beats, in an order and
   voice that depend on the sensei. Nothing new is locked behind a beat; the beat is the
   introduction and a small first-time reward. A player can skip it in one line at the first
   meeting ("I paid attention at the academy").
6. **A sensei is built from independent dimensions** (Part 3, the pool). Authored senseis pick
   from it, and generated ones roll it with coherence rules. Every dimension is a rule the game
   plays, not only flavour text.
7. **Every sensei has a story** told in beats by bond stage, ending in a personal arc that may
   come back for you later.

8. **Skipping costs regard, not bond.** Regard is the sensei's judgement of you, apart from
   how much they like you. Skipped sessions and missed team days lower it, kept assignments
   raise it, and the exam nomination reads it alongside bond.
9. **The opening test never fails you.** It is a scare: you pass by what you did, not by
   winning, and what you did sets your starting regard.
10. **One full lesson a week, plus short sessions.** However often a sensei trains you, the
    week holds one full lesson (with its slips); the other sessions are short ones that
    together are worth one more lesson, split over however many there are, so a daily sensei
    doesn't outpace the pacing bench. A short session takes energy but no time slot, so it adds
    to a day's training instead of replacing a drill, and it earns regard, not bond.

---

## Part 3: The design

### The week

At the weekly lesson the sensei gives you **the week's plan**, a paper slip on the Shinobi tab
and a line in the ticker each morning it matters:

- **Sessions**: days and a time slot when they are at the training ground for you. One is
  the full lesson (as today, with its slips); the rest are short sessions in their format
  (drill, spar, march…). Their `cadence` decides how many and how punctual: Gōran is there
  every dawn; Yomi says Thursday and comes on Friday.
- **An assignment**: one piece of work picked by their lens (below), stated as something you
  can see done: "Get your taijutsu to D", "Master tree-walking", "Win a spar against Haru",
  "Eat properly before every job this week". While the assignment is open, growth on it gets
  the sensei's spec (decision 11: a sensei's teaching is a `ModifierSpec`). Done by the next
  lesson, it pays bond and regard and moves the next signature closer.
- **Team days**: a ritual (a meal, a challenge, a camp) or a team job the sensei has picked
  off the board ("Gate at dawn tomorrow").

The plan is drawn from the seed and the week (`hashUnit`, like the board), stored when given,
so it is reproducible and never touches the Rng. Attendance, skips and the assignment's state
live in a new `mentor` slice of the people state.

**Grip** decides how much of the week the plan claims and how it loosens. A tight sensei plans
most days and notices every absence. A loose one plans one session and a meal. At a bond stage
(`loosensAtStage`) the plan shrinks and the assignment becomes a suggestion you may swap.

### The read

`game/senseiRead.ts` turns your state into a few sentences the sensei says at the lesson and
when you ask them:

- **What will get you killed**: your weakest defence layer (evasion, guard, resistance,
  toughness) rated with the same functions the fight uses, against the foes on jobs you can
  take. "Anyone with a genjutsu walks straight through you."
- **What hurt you**: the last few fights' outcomes keep what did the most harm (a short list on
  the `mentor` slice). "That archer had you pinned for three exchanges. Learn to close."
- **What you are good at**: your best stat and its limit, from `naturalLimits`.
- **What you haven't found**: a stat whose talent is unknown and high. The sensei sees it,
  depending on their lens and your bond, and sets `aptitudeKnown` to a sense. This is the most
  exciting thing a sensei can say, so it is rare and comes at a lesson.

Each lens picks which of these lead and becomes the assignment.

### Missions

- Under a sensei, the board shows in-village E and D jobs as now. Every job that leaves the
  village is posted with your sensei leading your old team (`crewOn`, `validateCrews` and the
  start action all read the new rule).
- Some team days are a job the sensei chose. It is pinned on the board with their note and
  needs no browsing; missing it costs the same as a skipped session.
- On the job, the sensei's `onMissions` posture decides how they fight and when they step in
  (below). The debrief gets a line from them.

### The curriculum (the tutorial)

A `CurriculumBeat` introduces one thing:

- training drills
- a spar (Plan & Watch)
- preparing tools
- eating before a job
- the jobs board
- buying a client's report
- the travel pass
- the library permit
- a control exercise
- cooking
- the exam

Each beat has a trigger (a day, a first time, a stat), a lesson card in the sensei's manner,
and a small first-time reward. The order comes from their philosophy: a body-first sensei opens
with a spar, a teamwork sensei with the opening test, a fundamentals sensei with drills and the
library. Beats already gated by rules (pass, permit, exercises) become beats rather than
silent unlocks. Skipping the curriculum marks every beat seen.

### The opening test

After team assignment and before the chakra paper, the sensei's test is a scene with a
`busyReason` (decision 14). Its kind is a dimension: bells (a spar with an objective, the
team's choices count), survival (a short `examOnly`-style job in the woods), a spar, an
interview (a conversation), or none. It doesn't fail you out. It sets your starting regard,
first assignment and a memory everyone shares.

### Rituals and talk

- **Rituals** are team days of a kind: a meal (`hostDinner` at an eatery, the sensei pays), a
  challenge (a contest of one stat against the sensei or a teammate, with forfeits), tea and
  a talk, a debrief after each job, a training camp (a short journey to a `wilds` place).
- **Talk**: sensei conversations unlock by bond stage and by events (first job out, first
  injury, the exam), drawn from pools by moment and manner like crew voices, so the weekly
  line doesn't repeat.
- **Story**: a `SenseiStory` is beats by bond stage (conversations, a memory, a sight of
  something at their home) and a closing arc (`ArcDef`) opened by a world mark the last beat
  leaves. Their old team, a wound, a rival, a student they lost. Camps by the fire draw on it.

### The farewell

Promotion adds a sensei moment to the ceremony: their farewell words (by manner), a gift
(their signature technique if unlearned, a piece of their gear, a recipe), and a shared memory.
After it the plan stops, the lesson becomes `trainWith` with their profile and no price, and
their talk turns to that of peers.

### The pool: how senseis differ

All in `content/senseis.ts` as `SenseiWays` on `SenseiProfile`. Every field is read by a rule.

| Dimension     | Values                                                                              | Read by                                    |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `philosophy`  | body, teamwork, fundamentals, edge (strengths), survival, control, shadow (stealth) | curriculum order, session formats, rituals |
| `lens`        | weakest stat, weakest defence, specialty, team gap, hidden talent                   | the read, the assignment                   |
| `grip`        | tight, firm, loose, with `loosensAtStage`                                           | the plan's size, skip costs                |
| `cadence`     | sessions a week, time slot, punctual, late or irregular                             | the plan, the sensei's schedule            |
| `formats`     | drill, spar, team drill, field trip, theory, meditation, march, mission review      | short sessions (what grows, energy, lines) |
| `quirk`       | patient, harsh, natural, distracted (today), plus playful, cryptic, by-the-book     | teaching factor, lines                     |
| `feedback`    | blunt, warm, Socratic, competitive                                                  | the read's wording, comparing teammates    |
| `rituals`     | meal, challenge, tea, debrief, camp, each with a cadence                            | team days                                  |
| `rewards`     | praise, signature, gear, recipe, meal                                               | what a done assignment pays                |
| `onMissions`  | shield (steps in early), watchful, lets you fail; a fight stance                    | combat allies, retreat, the debrief        |
| `test`        | bells, survival, spar, interview, none                                              | the opening scene                          |
| `gatekeeping` | pass stage, permit stage, nominates early, usual or late, `toleratesReplacement`    | `leave.ts`, `permits.ts`, exam entry       |
| `classRegard` | champions the dead last, pushes the best, even                                      | starting regard, the read's wording        |
| `story`       | beats by bond stage, a wound, a rival, a lost student, a closing arc                | talk, memories, the arc                    |

**Coherence rules** (validated, and obeyed by the generator): a `teamwork` sensei drills the
team (`team-drill`) and keeps a team day; a `tight` grip has at least three sessions and a
`loose` one at most three; a `shield` sensei is never `loose`; a `lens` of hidden talent needs a
quirk that isn't distracted; a `signature` reward needs signatures to teach and a `recipe`
reward a favourite recipe.

**Archetypes** (`systems/profile`-style quick picks for senseis): the drillmaster, the
strategist, the guardian, the gourmand, the prodigy, the old hand, the eccentric. Each fixes
a few dimensions and leaves the rest to the roll.

### The senseis as they would be

Naruto pack:

- **Guy**: body; lens specialty; tight; daily at dawn; drills and marches; natural; warm and
  competitive; challenges; shield; spar test; champions the dead last.
- **Kakashi**: teamwork; lens team gap; firm; few sessions, late; team drills and spars;
  distracted; cryptic; mission review; lets you fail; bells; pushes the best.
- **Kurenai**: fundamentals; lens weakest defence; firm; regular days; theory and drills;
  patient; warm; tea; shield; interview.
- **Asuma**: edge; lens specialty (taijutsu and ninjutsu); loose; meals as the team day;
  spars; patient; blunt; watchful; survival test.

Original pack:

- **Gōran**: body; tight; every dawn; harsh; blunt; marches; challenges; spar test.
- **Akari**: edge; lens hidden talent; firm; natural; competitive; pushes the best.
- **Yomi**: shadow; lens weakest; loose and irregular; distracted; Socratic; field trips at
  night; interview.
- **Tetsu**: fundamentals; lens weakest defence; firm; patient; silence as praise (the
  rewards skip praise); drills; tea.
- **Ito**: control; lens team gap; firm; patient; theory; mission review; bells with seals.

---

## Part 4: Order of work

Each step is one run: tests, `npm run check`, a save migration where the shape changes, and a
Part 5 entry.

1. **The mentorship and the road rule.** `underSensei`; a job that leaves the village is led by
   your sensei; `validateCrews` and the board follow. Update decision 21 in `CLAUDE.md`. No save
   change.
2. **Senseis as data.** `SenseiWays` on `SenseiProfile` with every dimension, its validation and
   coherence rules; fill every sensei in both packs. Nothing reads it yet except validation.
3. **The week.** The plan (sessions by cadence and formats, the full lesson kept), the
   `mentor` slice (save bump and migration: an existing genin gets a plan from next week),
   attendance and regard (decision 8), the plan slip on the Shinobi tab,
   morning ticker lines. Pacing bench: a follower and an ignorer of the plan.
4. **The read and the assignment.** `senseiRead`, the weakest defence layer from the fight
   rules' public functions, harm kept from recent fights, talent reads, assignment kinds and
   their spec and rewards.
5. **The curriculum.** Beats, order by philosophy, lesson cards, the skip line, and the pass,
   permit and exercise beats in place of silent slips.
6. **The opening test.** The scene between team assignment and the chakra paper, its kinds,
   starting regard. Existing saves count it as taken.
7. **Team days.** Rituals and sensei-picked jobs pinned on the board.
8. **Talk and story.** Sensei talk pools by moment and manner, story beats, a closing arc for
   one sensei in each pack as the reference.
9. **The farewell.** The ceremony moment, the gift, the change to a peer.
10. **Generated senseis.** Archetypes and the roll with coherence, for jōnin the generator makes
    (other villages, replacements when a sensei falls).

## Part 5: What was built

1. **The genin years and the road rule.** `underSensei` (`game/mentorship.ts`): a genin with a
   sensei. `JobProfile.away` is set for a job with a `leg` stage or an `endsAt`, or one posted
   only at halls outside the start village (`postedAway`, `content/jobProfile.ts`). A genin's
   D-rank chore that is away goes to the old team instead of alone, and the sensei leads the
   old team on every away job in the genin years (`senseiLeads`, `game/crew.ts`), as well as on
   serious ones. That covers the road escorts, the salt-lantern arc and the town jobs at
   Shiomachi and the ford. `validate.ts` reads a posted-away job as teamable. Decision 21 in
   `CLAUDE.md` amended. No save change.
2. **Senseis as data.** `SenseiWays` (`content/senseis.ts`) on every `SenseiProfile`, with every
   dimension of the pool but the story (step 8) and the extra quirks (the `feedback` list carries
   `cryptic` instead). `validateSenseis` checks ranges, lists and the coherence rules. All ten
   senseis are filled (`packs/original/senseiWays.ts`, `packs/naruto/people/senseiWays.ts`).
   Three dimensions are read already: `gatekeeping` sets the bond stage for the travel pass and
   the library permit and how many jobs a nomination wants (`nominationMissions`: early 7, usual
   10, late 14); `onMissions` sets the sensei's stance in a job's fights (shield covers you,
   watchful supports, lets-fail holds). No save change.
3. **The week.** The plan (`game/sensei/plan.ts`): `cadence.sessions` meetings a week (half,
   rounded up, once the bond reaches `loosensAtStage`), spread evenly or, for an irregular
   sensei, on hashed days; the first is the full lesson, the rest short sessions in the
   sensei's formats; a late sensei comes a slot after they said. `senseiSession` drills the
   format's stat (a drill is the sensei's specialty) at `WEEK_OF_SESSIONS` (one lesson) split
   over the week's short sessions, by the teacher rule against the sensei, for energy and no
   time slot, with regard and no bond (sessions with bond pulled the nomination far ahead of the
   bench). `GameState.mentor` (save v40) keeps regard, the last settled day and this week's
   outcomes; `settleMentor` runs as each day begins: a lesson is kept if had that week by its
   day, a session if you came, excused if you were on a job, away or laid up, else missed (regard
   down by grip, and a line); then a morning line says when they expect you. Choosing a sensei
   sets their first view of you (`startingRegard`, by class standing). The nomination needs
   regard 40. The village screen shows their slip (`views/senseiWeek.ts`, `SenseiSlip`): the
   week's days with ink stamps, regard in a word, today's line and a button for today's
   session. The focused player of the pacing bench keeps sessions; `pacing/sensei.test.ts`
   checks that keeping them puts you ahead by less than 15% fighting power after a month, and
   that skipping them costs the nomination. The early and late nomination habits are 8 and 13
   jobs.
4. **The read and the assignment.** After each weekly lesson in the genin years
   (`coachAfterLesson`, `game/sensei/coaching.ts`) the sensei judges last week's assignment
   (done: regard and a reward of their kind, `game/sensei/rewards.ts`: praise as bond, a step
   on their next signature, a D or C piece for their art, their favourite recipe or a meal on
   them, falling to the next they can give; not done: regard lost), may name a gift you haven't
   found (a sensei with the hidden-talent lens always looks, any other once you are close; the
   stat's talent becomes sensed), reads you aloud (`game/sensei/read.ts`: your thinnest layer
   of defence, from the fight's own layers; what beat you on a job since the last lesson, from
   the debrief's advice; your edge, led with by a specialty or talent lens) and sets the next
   assignment: the lens's stat (`lensStat`: weakest body or mind stat, the weaker stat of your
   thinnest defence, your best art, the team stat nobody on your team is good at, or your
   strongest untapped talent) to rise by a step that shrinks with its grade. While it is open
   the assignment is a `ModifierSpec` on the character (`assignmentSpec`: growth ×1.2 on that
   stat, but not on your best art, where the push isn't needed and the genius bench would run
   ahead). The slip shows the assignment and how far along it is in words. Save v41 adds
   `character.assignment` and `mentor.lastBeaten`.
5. **The curriculum.** The pack's `curriculum` (`content/curriculum.ts`, the shared beats in
   `shared/sensei/curriculum.ts`): drills, sparring, the jobs board, preparing tools, buying
   intel, eating, cooking, the pass, the library, control exercises and the exam, each in the
   sensei's words. `CURRICULUM_ORDER` (`game/sensei/curriculum.ts`) orders them by philosophy;
   `beatDue` offers the first unseen beat that makes sense yet (the prep after a first job, the
   library once the permit is signed, the exam halfway to a nomination), one a day, on the
   sensei's slip, and `heedSensei` marks it seen for a little regard. The pass, permit and
   exercise slips are still signed silently at the lesson; their beats explain them after.
   Validated: every beat exactly once.
6. **The opening test.** A scene after the chakra paper (`sensei-test`, with a `busyReason`):
   the pack's `senseiTests` (`content/senseiTests.ts`, shared in `shared/sensei/tests.ts`:
   bells, a night in the woods, a spar, an interview), two rounds of choices, each a way of
   going at it (together, alone, cunning, patient). It never fails you: the way their
   philosophy prefers earns regard, going with the team a little, going alone costs it with a
   teamwork sensei (`game/sensei/opening.ts`). A sensei with no test just meets you. Either way
   it ends with one question, shown everything (the curriculum) or not, and the day becomes a
   memory shared with the sensei and the team. Save v42: a save that has met its sensei skips
   both. It came after the chakra paper rather than before, so the paper stays the sensei's
   first act.
7. **Team days.** One a week (`teamDayOf`, `game/sensei/plan.ts`): the sensei's rituals in turn,
   on a hashed day, a meal or tea from evening and a challenge, debrief or camp from afternoon.
   `teamDay` (from the slip, at home) takes a slot: bond with each teammate (not the sensei,
   whose bond comes from lessons and talk; with it the bench's nomination ran two weeks early),
   regard, and the kind's own good (`game/sensei/teamDays.ts`: a meal feeds you, a challenge
   works the sensei's art, tea is bond with them, a debrief more regard, a camp stamina).
   Missed, it costs regard by grip like a meeting (outcomes keyed `t<day>`). **The sensei's
   pick** (`game/sensei/pick.ts`): each week one posting at home they would lead, hashed by the
   week, marked on its notice; taking it is remembered (`mentor.pickTaken`) and finishing it
   earns regard, one a week (`pickKept`). The focused player keeps team days too.
8. **Talk and story.** `SenseiWays.story` (`content/senseis.ts`): the wound in a line, four
   personal conversations told at bond stages one to four, in order, and an optional `arcId`.
   All ten senseis have their four beats (`packs/original/stories/`,
   `packs/naruto/people/stories/`, one file a sensei; the fan pack spreads them in its own
   builder so a release build drops them). The talk system already offers a friend's newest
   stage first, so the beats come up as you grow close; once the third (the wound) is heard,
   the person sheet shows what they carry. A conversation reply may leave a `worldMark`
   (validated like a job's); Gōran's last beat leaves `goran-old-debt`, which opens his arc,
   **The Broken Blade** (`packs/original/arcs/brokenBlade.ts`: up the pass to find Kurobane's
   camp, then back to settle the debt, mercy or not; C-rank, so Gōran leads whoever's sensei he
   is). The fan pack's senseis have their stories and no arc yet. Talk "by moment and manner"
   is the manner lines already in sessions, praise and the first meeting; no separate pool.
9. **The farewell.** At a genin's chūnin ceremony with a sensei (`farewellDue`,
   `game/sensei/farewell.ts`) the scene carries their parting words in their manner, and
   accepting the rank first keeps the farewell (`partWays`): the rest of their next signature
   at once (up to a dozen sessions' worth), or failing that what they like to give; bond; the
   memory "the day you made chūnin"; and the open assignment is done with. The rank then ends
   the genin years on its own (`underSensei`), so the plan, sessions, coaching and curriculum
   stop and the sensei is a teacher with no price.
10. **Generated senseis.** `SenseiProfile.ways` is optional. `waysOf` (`game/sensei/generate.ts`)
    is the one way the game reads a sensei's ways: the authored ones, or ways generated from the
    person's id. Seven archetypes (`content/senseiArchetypes.ts`: drillmaster, strategist,
    guardian, gourmand, prodigy, old hand, eccentric) fix what makes each kind (philosophy, lens,
    grip, formats, manner, posture, test, rituals, wound); the rest is rolled (cadence within the
    grip's range, slot, punctuality, loosening stage, gatekeeping, class regard, rewards they can
    actually give), and a distracted teacher never gets the hidden-talent lens. A test rolls two
    hundred and checks every one against `senseiWaysProblems`. Generated senseis have a wound and
    no story beats. Nothing generates jōnin yet; when other villages or replacements do, their
    senseis need no authored ways.

All ten steps are built.
