# After chūnin: the jōnin years and the road to kage

Working document for everything above chūnin: more ways to make chūnin, a jōnin rank worth
reaching, renown abroad, leading a team of your own, founding a clan, the politics of a village's
senior shinobi and the kage's seat. It is most of milestone 5's Kage branch, and it lays the
foundation the rogue branch shares (renown). Part 1 reviews what the game has today. Part 2
records what we agree. Part 3 is the design. Part 4 is the build plan. Part 5 records what was
built. Nothing here is binding until it is in Part 2.

---

## Part 1: The review

### What the ranks are today

1. **Genin to chūnin** is the chūnin exam alone (`systems/exams`, `game/exam/`): twice a year,
   entered with the sensei's nomination and a team of three; the mind test, the forest and the
   tournament; conduct weighed with results; a ceremony with the vest, a breakthrough
   (`PROMOTION_LIMITS`) and unlocks read from the data (`exam/unlocks.ts`). Spectators watch the
   finals. There is no other way to the rank.
2. **Chūnin to jōnin** is a nomination that arrives on its own (`notePromotions` in `dispatch`)
   once `joninGap` is null: 5 B- or A-rank jobs (`seniorMissionsCompleted`), a best art at B and
   80 reputation. The ceremony is the small one: accept only, a breakthrough, no person and no
   scene.
3. **Jōnin to kage** does not exist. `kage` is the last of `RANKS` and a label: the S band of
   `statTier`, a `teachingFactor`, the Tōrokage as an authored person (`original/people.ts`). The
   `standing.ts` header still promises "the road to Kage".
4. **The rogue path** does not exist. `world-plan.md` makes leaving without leave its first step;
   today the Travel tab only says why you can't.

### What a jōnin gets today

- Travel without leave (`game/leave.ts`), A-rank work alone as the senior record grows, more crew
  choices (`systems/missions/crew.ts`) and S-rank jobs (`rankForMission`).
- **The `original` pack has no S-rank jobs,** so the jōnin "What this opens" list is close to
  empty. The library has two tiers (`game/shelves.ts`: open shelves, restricted stacks for
  chūnin), so nothing new is read either.

### What is missing

- **Rank and renown are the same thing.** `Standing.reputation` is one number, earned at home and
  read by the jōnin nomination. Nothing knows whether anyone outside the village has heard of you.
- **Other senior shinobi do nothing.** Authored jōnin (`original/jonin.ts`: Kagerō, Haruto,
  Suzu, Bunta, Tamaki, Kōun) and clan heads (`clanHeads.ts`: Enji, Sayo, Daigo, Kazane) have
  stats, schedules and teaching, but no record, no ambitions and no allies. Only genin grow on
  their own (`game/people/regimen.ts`).
- **No one below you.** The sensei system (decision 27) is written from the student's side only.
- **Clans are pack data.** `ClanDef`s and clan techniques are authored; nothing a save makes can
  be a clan.
- **Pacing stops at jōnin.** A year is 112 days (`DAYS_PER_SEASON` 28, four seasons). The
  progression bench nominates a focused player jōnin on day 59, inside the first year. Nothing
  ages, retires or dies.

---

## Part 2: Decisions

Agreed.

1. **More routes to chūnin.** The exam stays the main road, and three others join it:
   - **A field promotion** for an outstanding result on a hard job, read from the run's ledger.
   - **A recommendation that ends an arc**: the kage (or the arc's patron) recommends you once
     an arc's last job leaves its world mark.
   - **A sensei's direct recommendation** for a genin their regard and judgement say is ready,
     without an exam (for late bloomers and those who keep missing the calendar).
2. **Rank is not renown.** A jōnin is the village's trust: a B-rank shinobi it sends alone.
   Most jōnin are nameless outside the village. Being **known** is a second axis, earned by
   deeds others see, and it is what makes someone a name, an idol, a candidate for kage.
3. **Jōnin is worth reaching.** It opens:
   - **A higher tier of scrolls** in the village's library.
   - **A team of your own**: leading a genin team, training people.
   - **The right to found a clan**, as a minimum: jōnin is necessary, never enough.
   - **Standing abroad** that can grow into renown.
4. **Jōnin are compared.** As a genin or chūnin you know your class, your rival and your
   team. As a jōnin you are measured against every senior shinobi of the village, above all
   the ones with big names: a pecking order.
5. **The kage's seat is political in peacetime and earned in war.** In peacetime you play the
   game: win over the people who choose. In wartime your record alone can carry you.
6. **Losing the race is still a good ending.** A respected elder, a clan head, a famous jōnin
   abroad, a teacher whose students became names: each is a life worth having lived.

Open.

7. **One life or a line?** Undecided. Recommendation in Part 3, "Time and the shape of a run".

---

## Part 3: The design

### Renown

- **`renown` is a slice of its own,** separate from `standing.reputation` (the village's regard,
  which stays as it is). It is kept **per region** of the pack's `atlas`, so you can be a name in
  the dune country and unknown on the coast.
- **Earned by deeds seen**, never by time: A- and S-rank jobs done abroad, a named foe beaten
  (an `EnemyDef` or person marked `notable`), exam finals fought before foreign guests, a job's
  outcome that spreads (a new `renown` effect beside `world` and `memory`). Your students' deeds
  lend you a share.
- **Read in words** (unheard of, a rumour, a name, a legend), never a number.
- **The bingo book.** Past a threshold in a region, you are listed there. It cuts both ways:
  foes there scout you before a fight (your standout stats are known), hunters come for the
  bounty as road events and encounters, and clients there ask for you by name
  (`village.clients` widened to regions) and pay more.
- **Shared with the rogue path.** A rogue is someone known and hunted. The same slice, read
  with the village's regard gone, is milestone 5's infamy.

### The jōnin rank, delivered properly

- **A nomination scene,** the kage's own words (`SettingText.promotions` gains a jōnin
  nomination), replacing the accept-only card. The marks stay `joninGap`'s.
- **The sealed archive.** A third library tier: A-rank standard techniques, jōnin only. The
  technique rules keep it honest: a technique two ranks above your grade is impossible, and a
  jōnin has B in their best art, so A is exactly what a new jōnin can just reach. An **S-rank
  forbidden shelf** opens only on the kage's permission (a slip, like the library permit).
- **S-rank jobs in `original`**, a handful, so the board changes with the rank.

### Leading a team

The sensei system, from the other side.

- **You choose your ways** at the start: philosophy, lens, grip, cadence, formats, feedback,
  rewards and the rest of `SenseiWays`. `senseiWaysProblems` keeps the choice coherent.
- **Three genin from a new year** (`people/generator.ts`, `yearClans.ts`) are assigned to you
  after their graduation. You see their academy files as a sensei would: grades, a read of
  their talent, their honours.
- **Your week runs theirs.** A lesson is the teacher rule pointed outwards (your grade over
  theirs × your rank and quirk), and your cadence and formats decide how often. Their regard
  for you is the mirror of `GameState.mentor`.
- **You nominate them for the exam,** and their results reach your record and your renown. A
  team that makes chūnin together is a memory for all four of you.
- **Their story is short and theirs**: four conversations by bond stage, from the shared talk
  templates, and a farewell when they make chūnin.

### Founding a clan

- **Jōnin is the minimum.** The others to settle (Part 4 asks): renown somewhere, a technique
  or school of your own (a signature variant from technique mastery, or a combination), a
  compound (bought or granted) and the kage's or council's blessing.
- **A founded clan lives in the save,** not the pack: a `ClanDef` of the same shape stored like
  generated people (decision 13), so every view reads it alike.
- **What a clan does** depends on the one-life question below. In one life: a name, a compound
  with a training place of its own, members recruited from generated shinobi who train in your
  arts, and a seat at the clan heads' table in politics.

### The senior shinobi and their records

- **Every senior shinobi keeps a record**: jobs done, renown by region, students raised and
  backers won. It is caught up lazily per day by hashing the seed (like `peopleGrown` and the
  board), never the Rng.
- **Authored and generated alike.** Authored jōnin and clan heads get ambitions in their
  `PersonDef` (a candidate for kage or not, whom they back, what they want); generated jōnin are
  drawn to fill the village's senior ranks to the baseline in `progression-plan.md` (about
  twenty).
- **The pecking order** is a view (`views/seniority.ts`): only names appear on it, ranked by
  standing with those who choose. It opens when you make jōnin.

### Politics

- **Through people, never a support meter.** Those who choose a kage are people: the elders
  (new authored people), the clan heads, the outgoing kage and the hall's chief. Each has
  tastes (traits), a bond with you and a **stance** (who they back now).
- **Winning them over** uses what exists: tone in conversation (`Tone`, trait tastes), favours
  done (`favour` replies), jobs taken for them (clients), dinners and drinks. A **debt** is the
  new piece: a favour you owe, called in at a bad time.
- **Rivals act too.** Candidates court the same people, and a backer can move. What changed is
  told in rumours and at the tavern counter, as gossip is today.

### The kage's seat

- **Succession needs a cause:** the kage retires (age or illness, on the calendar), falls (a
  war or an arc) or steps down after a scandal. Until a cause comes, there is no seat.
- **Peacetime:** the council meets in a scene. Candidates are named, each backer speaks for
  one, and the seat goes to whoever holds most of them. Renown abroad is weighed as the village's
  standing in the world.
- **Wartime** is an arc of its own: battles fought, foes beaten, people brought home. At its
  end the village acclaims whoever carried it, and backers count for little.
- **The endings that aren't the seat** (decision 6): an elder's seat on the council, the head
  of your clan, a legend abroad, a famous teacher, the kage's right hand. Each is a closing scene
  read from what you built.

### Time and the shape of a run

- **The pacing must stretch.** Jōnin by day 59 suits a game that stops there. With all of this
  after it, a run from genin to the seat should take years: jōnin around the end of the third
  year, the seat no earlier than the eighth or tenth. The jōnin marks, the senior record and the
  bench are retuned together.
- **Recommendation for decision 7: one life, built to allow a line.** Characters get an age and
  the kage retires on the calendar; a run ends in an ending scene (above), not a death. Nothing
  is built for heirs yet, but nothing closes them off: clans live in the save and endings are
  derived from state, so an heir could later start from one. Revisit once a full life plays well.

---

## Part 4: Build plan

Each step ships on its own and keeps `npm run check` green.

1. **More routes to chūnin.** The field promotion, the arc's recommendation and the sensei's
   recommendation, each a `ceremony` with its cause. Tests: each route promotes once, the exam
   is still offered, the farewell still comes.
2. **The jōnin rank, delivered.** The nomination scene, the sealed archive and the forbidden
   shelf's permit, S-rank jobs in `original`. Save migration for the library tier if it adds
   state.
3. **Renown and the bingo book.** The `renown` slice and migration, the `renown` outcome effect,
   notable foes, the words, listing, scouting by foes, hunters, clients abroad.
4. **Pacing.** Retune the jōnin marks and the bench for the longer life; add age.
5. **Leading a team.** Choosing your ways, the assignment scene, lessons outwards, their regard,
   nominating them, their farewell.
6. **The senior shinobi.** Records, ambitions, generated jōnin to the baseline, the pecking
   order view.
7. **Politics.** Elders, stances, debts, rivals acting, rumours of it.
8. **The peacetime succession** and the endings that aren't the seat.
9. **Clans,** once their requirements are agreed.
10. **War,** an arc of its own, after the rest plays well.

Questions to settle before the steps that need them:

- Step 3: which deeds are seen in which regions, and how fast renown fades, if at all?
- Step 9: the clan's requirements beyond jōnin, and what a clan gives its members.
- Decision 7: one life or a line.

---

## Part 5: What was built

**Step 1: more routes to chūnin** (`game/exam/routes.ts`, save v45).

- Every ceremony keeps the `route` that earned it (`exam`, `nomination`, `field`, `arc`,
  `sensei`; `exam/state.ts`), and the ceremony's speech follows it (`views/promotion.ts`): the
  rank's own words after the exam or a nomination, otherwise `SettingText.promotionRoutes` (the
  field and the sensei, in each pack's `exam.ts`) or the arc's own `recommends.words`. The v45
  migration gives a ceremony already waiting the route it could only have had.
- All three need a genin who is **ready** (`readinessGap`, the sensei's own test: a stat at C,
  three at D), with no ceremony waiting and no exam under way.
- **A field promotion** (`afterFieldWork`, from `afterStage`): a job graded clean that no genin is
  sent on lightly, B-rank or harder, or with a deadly or elite foe. Decided: the debrief grade
  and the job's danger, not a ledger line.
- **An arc's recommendation** (`arcRecommendation`, checked with the jōnin nomination in
  `notePromotions`, which now takes the context): an arc with `recommends` (a person and their
  words, validated in `validateStory`) once all its acts are done. Derived from state, so it also
  comes later to a genin who finished the arc before they were ready. In `original`, Salt in the
  Lanterns: the Tōrokage, holding the harbourmaster's second letter.
- **A sensei's recommendation** (`afterLessonRecommendation`, after the weekly lesson): more than
  a year as a genin (`SENSEI_RECOMMENDATION_DAYS`), regard at 80 or more (past what turning up
  earns), the nomination itself met, and no exam announced: a sensei puts you forward for an
  exam days away instead. A sensei whose gatekeeping `nominates: 'late'` never does.
- The pacing bench's focused player now accepts a promotion when one waits; it never sat the
  exam, so it is raised on its sensei's word in the second year. The benches still hold.

**Step 2: the jōnin rank, delivered.**

- **The nomination ceremony** is the full scene now (the `small` scale is gone), and reads your
  record back as chips (`nominationRecord` in `views/promotion.ts`): the B- and A-rank jobs, your
  best art's grade and your reputation. The words stay the pack's `promotions.jonin`.
- **The sealed archive** (`game/permits.ts`: `SEALED_SHELF_RANK` A, `SEALED_RANK` jōnin): the
  library may now hold rank A (`validateSources`: C–A), and A is jōnin only. The library view
  counts sealed scrolls apart from the restricted stacks and the page folds them behind their
  own lattice; the jōnin ceremony's unlocks name it. In `original`, five new plain A-rank
  techniques, one per art (`techniques/sealedArchive.ts`). The pack's existing A-rank techniques
  are all someone's signature, so they stay with their teachers.
- **S-rank jobs in `original`**: an `s-hunt` template (`jobs/templates/joninS.ts`: a hard trail,
  then a jōnin-grade rogue and a second, no fleeing and no slipping past) with three fills (The
  Hollow Lantern, The Warlord's Blade, The Salt Widow), each against a new elite rogue
  (`jobs/eliteEnemies.ts`). The crew rules already send S-rank work to a jōnin with a chūnin
  squad and never to a chūnin.
- **Not built: the forbidden S shelf.** Every standard S-rank technique in `original` is a
  signature, so a forbidden shelf would have nothing on it but new legend-grade techniques. It
  waits for the kage's story (steps 7 and 8), where the kage's permission is a scene.
