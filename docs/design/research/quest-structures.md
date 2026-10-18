# Quest structures: what Naruto and The Witcher 3 do, and what our tools can say

This is the second pass on the research in `naruto-arcs.md` and `witcher3-quests.md`. Both files
were checked against the real pages in October 2026: Narutopedia and the Witcher wiki through their
MediaWiki APIs, and Wikipedia. Their method notes say exactly what was opened. The first pass
gathered what happens in each story. This pass pulls out the **devices**, meaning the shapes a story
takes that could be lifted out and told again in our settings with our own people. For each device
it gives:

- **Source:** where it comes from, as the checked notes have it.
- **Shape:** the abstract pattern, with the setting stripped out.
- **Our tools:** whether the story tools (`src/systems/missions`, CLAUDE.md decisions 23–25) can
  say it today, can say it with a tool added in this pass, or would need one we haven't built.
- **Used in:** the arc that uses it, if one does (see the last section).

## What the tools could say before this pass

- **Stages:** narrative, check (penalty, abort or forward), leg (days on a road; a `region`
  brings road events), combat, encounter (recon, then an approach, which may be talk; the pay
  depends on the way past), decision (options with a tone and a `when`), camp, and ending (the
  first that fits).
- **Conditions:** `has`, `lacks`, `thread`, `crew`, `remembers` (a world mark, snapshotted when
  the job starts), `all` and `any`.
- **Effects:** mark, thread, bond, harm, energy, pay, world (a village mark) and memory.
- **Per job:** twists (a hidden mark rolled at the start), a charge with a trust thread, text
  variants, and `needsWorldMark` for follow-up jobs posted later.
- **Arcs:** acts in Harmon's circle. All of an act's jobs had to be done before the next act
  opened. An act may have a `baseLocationId` (orders, not leave), and a job may have `endsAt`.
- **The game around them:** encounter pay by job kind, crews assigned by rank and danger, and
  the field-promotion and arc-recommendation routes.

## What this pass added

Two tools, built because the arcs below needed them. Both have tests, and the second needed no
change to the save.

1. **Village tallies** (`{ kind: 'tally', tally, by }` effect; `{ tally, atLeast }` and
   `{ tally, below }` conditions). These are counters the village keeps across jobs
   (`GameState.village.tallies`, save v54). Like `remembers`, a condition reads them as they
   stood when the job began (`MissionRun.tallied`). Validation checks that every tally a job
   reads is one some job counts. They cover three devices:
   - a record of mercy used later as an argument (Skellige's Most Wanted);
   - a hidden score kept from small moments (Ciri's ending);
   - thoroughness across several jobs earning the better ending (A Towerful of Mice, with
     clues spread over leads).
2. **How an act is passed** (`ArcAct.pass`):
   - `all`: every job, the old rule and still the default.
   - `any`: **leads**. Any one job opens the next act. The rest stay open as extra digging until
     a job of a later act is done, so a player who digs further before acting is rewarded, and
     one who rushes loses the chance.
   - `one`: a **fork**. Taking one job closes the others.

   The board's arc card says which rule applies ("Any one of these moves the story on…",
   "Choose one…") and lists leads still open from an earlier act. The rule lives in `actPassed`
   and `arcJobOpen` (`systems/missions/arcs.ts`).

**Considered and not built**, because no arc yet needs them:

- **Act deadlines.** An act would close after some days with a "too late" world mark (the
  Witcher's side quests that expire). This needs the day each act opened kept in the save. The
  nearest thing today is a `one` fork where one road is "let it go".
- **A crew member staying behind** (the relay in Sasuke Recovery, where each member holds one
  foe and the rest run on). The crew is fixed for the whole job, so this needs crew changes
  mid-run and a fight each one is left in. It's the biggest of these, and should wait until an
  arc is written around it.
- **A negated `remembers`.** No condition reads "the village does _not_ remember X". Writing the
  brewer's ghost showed the workaround: order the stages so the conditional one comes first, and
  have the plain one check that the fight already happened (`lacks: 'fought-past'`).

**One gotcha found while writing.** A job's `remembers` is a snapshot from its start, so a world
mark the job sets itself isn't visible to its own later stages. Set a run mark (`mark`) alongside
the `world` mark and read that within the job. The Lantern Thief already does this.

A second, for fan packs: name the jobs in a naruto arc's acts by literal id. `JOB.id` reads
survive tree-shaking and kept the jobs' text in the release build until `check:release` caught it.

**After review.** Three reviews (a game developer, a storyteller and a UI/UX pass) led to
three more rule changes:

- **Lasting effects wait for success.** World marks, tallies and memories are held on the run
  and kept only when the job is done, so a failed and retaken job can't count anything twice
  or leave a mark from a road it didn't finish.
- **Follow-ups can be told once.** A job may be `once` (never posted again after it is done)
  and `closedBy` a world mark (no longer posted once the story has moved past it). A job that
  counts a tally must be one of these, or an arc's, so mercy can't be farmed off the board.
- **A fork closes when one road is finished.** A fork job that is failed leaves all the roads
  open, so the card says so.

A second pass, after that, carried the rules to where the player decides, and gave the
choices costs:

- **The board says it.** The arc card shows the act's rule as an ink stamp (岐 one road only,
  手 any lead will do), its jobs open their notices, and leads of the act before stay listed
  ("Still to look into", done ones struck through) with what closes them. A job's notice says
  what finishing it closes: a fork's other roads, or the leads not followed.
- **Closed choices say why.** A decision option gated by a tally or a mark may carry an
  `unseen` reason; it shows closed with that reason instead of vanishing, so a choice never
  shrinks to one button without a word. The first such option shows.
- **Clues are stamped.** An outcome marked `noted` (a clue found) gets a 記 stamp in the
  debrief, so you can judge whether to follow another lead. Mercy stays unannounced.
- **Choices cost.** Keeping faith with the ferrymen is paid at their price and repaid on the
  landing; sparing Ushio costs pay; the brewer's bribe is called in if you name her; hauling
  in the wrong man takes a clue away; the silk fork pays most for taking her home and least
  for the truth; uniting the Waves costs the tycoon's ledger. Arc endings now go round as
  rumours.

## Devices from Naruto

| Device                                      | Source                                                                                                                                                                                                                                    | Shape                                                                                                                                            | Our tools                                                                                                                                | Used in                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| The under-ranked job                        | Land of Waves: Tazuna lied so the village would take it cheap; Kakashi judges it B-rank or higher, the wiki's list says "actually an A-rank". The Missions page notes a client who downplays the danger frees the ninja from the contract | A notice that lies about the danger; the confession comes after the first fight, and the crew chooses to stay or to make the client pay properly | Today: a cheap first job, a decision on the confession leaving a world mark, and the next act's pay moved by `pay` when it is remembered | Chain at Kiri Ford                                             |
| The hidden real test                        | Bell test (the rule is a trap; feeding Naruto passes; Kakashi had never passed a team); the chūnin exam's tenth question (taking it, at the risk of staying genin forever, is the answer)                                                 | The stated rules aren't the test. The grade reads what you did when the rules and your comrades pulled different ways                            | Today: decisions leaving world marks, and an ending in a later job that reads them                                                       | The Unwritten Rule                                             |
| Each member holds one foe                   | Sasuke Recovery: teammates stay behind one by one; the mission fails                                                                                                                                                                      | A chase where the crew shrinks at each stage                                                                                                     | Not built: needs crew changes mid-run                                                                                                    | —                                                              |
| An event that is cover for a plot           | The chūnin exams and Konoha Crush (the Fourth Kazekage agreed to the invasion to win back his funding; Orochimaru killed him and wore his face)                                                                                           | A public occasion you're busy with, while the real move happens behind it                                                                        | Today, with an exam or festival scene; best written into the exam stages                                                                 | —                                                              |
| The pawn betrayed by their employer         | Gatō came to kill Zabuza rather than pay him; Orochimaru and the Sand; Mizuki                                                                                                                                                             | The hired antagonist's employer turns on them after they lose, and the player may stand with the former enemy                                    | Today: an act whose job opens with the betrayal, and a decision to fight beside the beaten foe                                           | Chain at Kiri Ford                                             |
| The sympathetic antagonist, loyal by choice | Haku; Ranmaru (who becomes Sanshō's apprentice); Guren (who killed Yūkimaru's mother and is forgiven)                                                                                                                                     | A foe who fights for someone, not for a cause, and can be spared or taken in                                                                     | Today: a decision after the fight; a later job asks what becomes of them                                                                 | Chain at Kiri Ford (Ren)                                       |
| The wager with a stake                      | Tsunade's necklace against all the money in Naruto's wallet                                                                                                                                                                               | A bet you set up whose stake is the client's faith                                                                                               | Today, as a decision and a check; not used yet                                                                                           | —                                                              |
| The rival offer to the client               | Orochimaru gives Tsunade a week to accept his offer                                                                                                                                                                                       | Someone else bids for the client's choice, with a deadline                                                                                       | Partly: a deadline needs act deadlines (not built)                                                                                       | —                                                              |
| A failed mission that changes people        | Sasuke Recovery; Bikōchū (Tsunade's last allowed attempt); Rice Fields                                                                                                                                                                    | Failure moves the story on and leaves marks rather than ending it                                                                                | Today: `onFailure: 'forward'` and failure endings that leave world marks                                                                 | Silk Merchant's Daughter (a dismissed case still ends the arc) |
| A double agent on your own team             | Sai at Tenchi Bridge: an alliance offered to Orochimaru for Danzō, and a hidden order to kill Sasuke                                                                                                                                      | A crew member's loyalty is rolled and surfaces mid-job                                                                                           | Today: a twist mark rolled at the start, read by a decision late in the job                                                              | Kōun's Three Favours (the heist helper)                        |
| The charge isn't who they seem              | Land of Snow (Sandayū hired Team 7 to bring the princess home); Idate (the rude stranger is their runner); Gantetsu (let himself be caught as bait, raising orphans)                                                                      | Who you protect or chase turns out to be someone else, which reframes the job                                                                    | Today: text variants and a reveal stage; the charge's trust thread                                                                       | Silk Merchant's Daughter                                       |
| The rescuer who caused the harm             | Yakumo: her own second self, Ido, set the fire; Kurenai sealed her power on the Third's orders                                                                                                                                            | The person asking for help is the source of the trouble                                                                                          | Today, as with "the client is the villain" below                                                                                         | —                                                              |
| Revenge laid in advance on home ground      | Shikamaru rigged the ground before luring Hidan; Kakashi volunteered so Team 10 could go                                                                                                                                                  | Prepare the ground in one job, and spring it in the next                                                                                         | Today: a world mark from a preparation job, read by the fight job's `when` (and a `ground`)                                              | —                                                              |
| The road anthology                          | Paradise Life on a Boat: a voyage told as side stories                                                                                                                                                                                    | A long trip told as small, separate episodes                                                                                                     | Today: road events by region and camps on legs                                                                                           | —                                                              |
| The recurring D-rank                        | Tora, sent after again and again                                                                                                                                                                                                          | A chore that keeps coming back, with the people around it changing                                                                               | Today: a standing or often-posted job with text variants by world mark                                                                   | —                                                              |
| A promise that drives later arcs            | Naruto's promise to Sakura, kept after the failure                                                                                                                                                                                        | A spoken promise left as a world mark that later arcs read                                                                                       | Today: `world` on a decision, `remembers` later                                                                                          | —                                                              |

## Devices from The Witcher 3

| Device                                                                       | Source                                                                                                                              | Shape                                                                                  | Our tools                                                                                                       | Used in                                                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| The client is the villain; investigation turns the premise round             | Family Matters: the Baron says the women vanished, the clues show they fled him                                                     | The client's story is the first lie; clues across the job (or the arc) turn it round   | Today: checks that leave marks, and decisions that read them                                                    | Brewer's Ghost; Silk Merchant's Daughter                                    |
| The monster is a victim                                                      | Devil by the Well; Jenny o' the Woods (summoned with a burnt letter and blood); the griffin whose mate a patrol killed in her sleep | The thing you were hired to kill was wronged; knowing why gives a second way to end it | Today: a decision available only with the right marks, which skips the fight stage                              | Brewer's Ghost; Kōun's Three Favours (the bridge)                           |
| No right answer                                                              | Whispering Hillock / Return to Crookback Bog: free the spirit and Downwarren dies, or don't and the orphans are taken               | Each option saves one group and costs another                                          | Today: decisions with world marks; the trade-off is in the writing                                              | Silk Merchant's Daughter (three roads, each with a cost)                    |
| A delayed consequence a later choice can't undo                              | The Hillock choice plays out in Return to Crookback Bog; Keira's choice in A Final Kindness                                         | Choose now; the result lands in a later job, too late to change                        | Today: `world` marks read by `remembers`, or a follow-up job with `needsWorldMark`                              | Brewer's Ghost (the Weeping Well, Oharu's Cask)                             |
| A chain of favours to reach the informant                                    | Ladies of the Wood: orphans, then Johnny, then the voice, then the Crones                                                           | Each favour opens the next person                                                      | Today: acts in sequence                                                                                         | —                                                                           |
| A price revealed after the deal                                              | The Crones' price: the ealdorman's left ear                                                                                         | Agree first, learn the cost later                                                      | Today: a decision, then a stage gated on its mark                                                               | Brewer's Ghost (the brewer's "double, if it's quick")                       |
| An unreliable witness, a replay tool, and the better ending for the thorough | A Towerful of Mice: refusing her is the better ending, but only offered if the lamp was used on an optional haunting                | Doing more than you must earns an option at the end                                    | **Tallies + leads**: clues counted across lead jobs, and the ending option needs enough                         | Brewer's Ghost                                                              |
| A red herring that punishes haste                                            | Carnal Sins: kill Nathaniel without hearing him out, and the real killer is never found                                             | The obvious suspect the client points at; acting on it closes a better path            | Today: a lead job whose hasty option leaves a world mark that makes the end harder                              | Brewer's Ghost (the gravedigger); Silk Merchant's Daughter (the bandits)    |
| The "monster" as cover for people                                            | Woodland Beast: necrophages fed on the dead the elves left. The "wounds made after death" wording isn't on the page                 | What looks like a beast's work is people's, with a beast blamed                        | Today                                                                                                           | —                                                                           |
| A contract that can end without a kill, where mercy costs pay                | Missing Miners: the troll, once beaten, talks; the village pays less if he's spared                                                 | Mercy is possible and costs money                                                      | Today: encounter talk pays a surrender share; decisions use `pay`                                               | Chain at Kiri Ford (sparing Ushio)                                          |
| A record of mercy used as the argument later                                 | Skellige's Most Wanted: proof needs mercy shown to two different kinds of monster                                                   | Mercy shown anywhere is counted, and a later confrontation reads the count             | **Tallies** (`mercy`, counted by the Lantern Thief's vouch, the bluff, the brewer's ghost and the weeping well) | Chain at Kiri Ford (the hearing)                                            |
| An election decided by earlier help                                          | Skellige succession: the crown goes to whichever sibling Geralt helps at the feast                                                  | Who wins depends on whom you helped before                                             | Today with world marks; across many jobs, a tally per candidate                                                 | —                                                                           |
| A hidden score from small moments                                            | Ciri's ending: five moments, counted for and against                                                                                | Small choices across a story add up to a verdict nobody announces                      | **Tallies**                                                                                                     | Kōun's Three Favours (`koun-grace`)                                         |
| Three leads open at once                                                     | Get Junior: three leads in any order; following any to its end fails the others                                                     | Several ways in; taking one may close the rest                                         | **Act passes**: `one` (the Witcher's rule) or `any` (leads stay open until you move on)                         | Brewer's Ghost (`any`); Silk Merchant's Daughter (`any`, then a `one` fork) |
| A side quest that expires                                                    | The Gangs of Novigrad fails once Geralt meets Radovid                                                                               | An offer that closes when the main story moves on                                      | Partly: `any` leads close when the next act's job is done. Deadlines in days aren't built                       | Brewer's Ghost                                                              |
| Working both sides reveals a third party                                     | Wine Wars: two vineyards' feud; Count Crespi behind the sabotage                                                                    | Hired by both sides of a quarrel, you see what neither can                             | Today: an `all` act of one job per side, then an act that reads both sides' clues                               | Two Sides of the Water                                                      |
| A price that depends on whether someone you helped lived                     | Fake Papers: if Albin died and Geralt admits it, the merchant refuses                                                               | A later deal reads an earlier outcome                                                  | Today: `remembers`                                                                                              | —                                                                           |
| A contract that's a trap, leading to a pact                                  | Evil's Soft First Touches: Olgierd knew the toad was the Ofieri prince; O'Dimm frees Geralt for an open-ended debt                  | The job was set up to catch you, and getting out costs a debt                          | Today: a twist or reveal, and a world mark for the debt                                                         | —                                                                           |
| A list of tasks with a hidden last item, each in a different genre           | Olgierd's three wishes: two named together, the third held back until both are done                                                 | The board shows two jobs; the act with the third stays hidden until they're done       | Today: two jobs in one act, the third in the next (the arc card shows only the current act)                     | Kōun's Three Favours                                                        |
| A heist crew whose loyalties surface mid-job                                 | Open Sesame: the safecracker you choose changes a later obstacle and which brother he backs                                         | Pick the crew, then a rolled loyalty surfaces on the way out                           | Today: a decision setting a mark, and a twist read later                                                        | Kōun's Three Favours                                                        |
| Optional earlier knowledge enables the good ending                           | The O'Dimm wager needs the Shakeslock visit; Syanna's best ending needs the ribbon, the governess's journal and more                | Something found only by looking closely early on opens the best ending                 | Today: a check whose success leaves a world mark that the last act's option reads                               | Kōun's Three Favours (Tsugumi's letter)                                     |
| A villain planted early in a helpful moment                                  | O'Dimm at White Orchard refuses a reward "one day he may need Geralt's help"                                                        | A stranger helps you early; pay it off much later                                      | Today: a world mark from a small job; a later arc reads it                                                      | —                                                                           |
| An ally whose charity hides predation                                        | Orianna feeds on the orphans she shelters                                                                                           | The kind patron is the predator                                                        | Today                                                                                                           | —                                                                           |
| A fork that looks like method but decides the ending                         | Blood and Wine's route choice                                                                                                       | Two ways to do the same job, each leading to a different end                           | **Act passes**: `one`                                                                                           | Silk Merchant's Daughter                                                    |
| The bound object that matters at the end                                     | Jenny's letter; the doll in Return to Crookback Bog (the wrong one kills Anna)                                                      | An object found earlier decides how the end goes                                       | Today: world marks                                                                                              | Kōun's Three Favours (the letter); Brewer's Ghost (the hairpin)             |

### What CD Projekt Red said, and how much of it is checked

The Witcher notes sort these claims by how well they're sourced. The writing here follows
the checked ones closely and treats the rest as craft advice.

- **Checked** (Wikipedia):
  - characters were given personalities "to contrast the fetch-quest system";
  - choices were written to be morally ambiguous;
  - a quest's story is mapped to a pacing graph of tension per beat;
  - the Baron quest began as one sentence;
  - forgiving the Baron was added so players could make up their own minds, and Geralt shouldn't
    always find a perfect solution.
- **Unchecked**, because the press pages couldn't be opened:
  - "no fetch quests", with a hook, tease or twist in every small job;
  - "never an obvious right answer";
  - "hold back information";
  - "about 40-minute beats".

Our versions of these:

- Every job has a hook or a turn, even a D-rank.
- Every arc ending costs something on each road.
- The truth comes out through checks and leads, not a speech.
- An act is one sitting: two to four stages and a decision.

## The arcs written from this

All six are in the code, validated, and played through by dispatching actions in
`src/game/originalArcs.test.ts` and `src/game/narutoArcs.test.ts`.

### Original pack

- **The Chain at Kiri Ford** (`packs/original/arcs/fordChain*.ts`, four acts, middle ones based
  in Kiri Ford). Tobei posts a cheap escort job, and the "bullies" turn out to work for a hired
  missing-nin (the under-ranked job). Ushio and his ward Ren fight you on the bluff; you spare
  them or bind them for the Watch (counted as mercy). The baron Oki won't pay a beaten blade and
  sends pirates; Ushio may fight beside you and fall on the landing steps (the pawn betrayed).
  Suzu decides Ren's fate, and if the village counts mercy from you at least twice, your record
  is the argument (Skellige's Most Wanted).
- **The Brewer's Ghost** (`brewerGhost*.ts`, three acts, in the village). Gensai wants the ghost
  gone quickly and quietly, and doubles the pay (a price after the deal). Three leads open at
  once (`any`): the well, the old brewer, and the gravedigger he blames (a red herring that makes
  her angrier). Each true clue raises a tally, and only with two can you call her by her name on
  the night (thoroughness rewarded). Exposing him costs the pay. Laying her quietly brings the
  **Weeping Well** later (`needsWorldMark`); exposing him brings **Oharu's Cask** (delayed
  consequence).
- **Kōun's Three Favours** (`kounFavours*.ts`, three acts). He asks three favours and names two.
  The first is a comedy (dance at a wedding in his place). The second is a heist with a crew you
  pick, whose loyalty is a rolled twist. The third, hidden until those are done, is a ghost story
  at the east bridge. Graces counted along the way (`koun-grace`) and a letter you find only by
  looking closely at the sword open the kinder answers. Kōun recommends you for chūnin at the
  end.

### Naruto pack

- **Two Sides of the Water** (`packs/naruto/arcs/twoSides*.ts`, the Land of Waves). The builders
  and the fishermen each hire you against the other (an `all` act). Only clues from both sides
  let you bring the town to face the tycoon's man together (Wine Wars).
- **The Silk Merchant's Daughter** (`silkDaughter*.ts`, Shukuba, then the Fire Temple). A
  merchant says bandits took his daughter; she fled him (the Bloody Baron). Her room and the
  bandits he blames are leads (`any`). At the temple she tells the truth. Then comes a `one`
  fork of three jobs: bring her home (paid, and darker unless you found enough to shame him
  before witnesses), tell him she drowned (paid less), or take her to the magistrate in Tanzaku,
  where what you found makes the case.
- **The Unwritten Rule** (`unwrittenRule.ts`). Ibiki's interview ends on a last question you may
  refuse (the tenth question). Then a sealed message is carried under three orders, and a staged
  kidnapping on the road makes you break one to save someone (the bell test). The verdict passes
  you for breaking the order, and fails you for keeping every rule and walking on.

## Devices still waiting for an arc

The wager with a stake, the rival offer with a deadline (needs act deadlines), revenge laid in
advance, the road anthology, the villain planted early, the predatory patron, the election, and
the relay (needs a crew member staying behind). The jōnin and kage plan's politics step
(`docs/design/jonin-kage-plan.md`, Part 4) is the natural home for the election and the rival
offer.
