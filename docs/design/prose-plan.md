# Prose plan: making the game read like one voice

A review of the game's descriptive text (fights, talk, missions and the road, village life and
the systems' feedback) and a plan to fix it without giving up generation or variety. It comes
from five passes: a play-through of the first hours, and one pass each over combat, talk,
missions and village/systems, reading real transcripts generated from seeds, not the source.

## The diagnosis

Two problems, one on top of the other. The lines themselves are written in a recognisably
machine voice (next section), and then they are put together without knowing each other. Fixing
only the assembly would leave a well-joined machine voice; fixing only the lines would leave
good sentences that still don't follow on. The plan does both.

## The machine voice: AI prose tells, measured

Sources: Wikipedia's field guide [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
(WikiProject AI Cleanup), EQ-Bench's [slop-score](https://github.com/sam-paech/slop-score)
(word, bigram and trigram lists measured as over-used by language models against a human
baseline, a "not X, but Y" detector, and per-model numbers including a human baseline), and the
UMD/DeepMind StoryScope finding that AI fiction gives itself away by structure more than words
(tidy single-track plots, over-explained themes, moralising). We extracted every prose string in
`src/` (about 9,500 strings, 100,000 words, tests and validation messages left out) and ran the
same measures over it, plus counters for the fiction tells those sources describe.

**The vocabulary is not the problem.** The game uses EQ-Bench's list of over-used words at about
1.5 per thousand words; their human baseline is 6.9 and the cleanest model 5.6. "Not X, but Y"
is rarer than in human writing (seven in the whole game). The usual word lists ("delve",
"tapestry", "testament") would pass this text. What remains of the word-level tells is a small
stock of atmosphere: whispers, flicker, glow, glint, firelight, lamplight, woodsmoke, shadows.

**The rhythm and the shape are the problem.** These are the tells the text does carry:

| Tell                                        | In the game                                                              | For scale                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Clipped, even sentences                     | mean 8.7 words, a quarter of all sentences four words or fewer           | EQ-Bench: human fiction 14.6, Claude 11.4                            |
| Everyone talks in one-liners                | 29% of spoken sentences are short impersonal declaratives                | "Twelve of us." "Every dusk, for years." "Which is worse."           |
| The button: a short last line on every beat | 550 strings end on a sentence of five words or fewer                     | "You lose. Slowly." "It is not uncomfortable." "Lee swears by them." |
| Epigram and reversal                        | wisdom in the shape of a saying, and the twist on its second half        | "It doesn't mind laughter. It minds forgetting." "My arm won."       |
| Gesture beats as punctuation                | 195 nods, grins, shrugs, smiles; 67 "says nothing", "a long time"        | a beat between every two lines of speech                             |
| Groups of three                             | 213 "A, B and C" lists                                                   | the field guide's "rule of three"                                    |
| Colons as the house connective              | 176 in story text                                                        | "One of the Demon Brothers: a clawed gauntlet, a shared chain…"      |
| One sentence skeleton                       | "Name does a thing. “Line,” Name says." 41 times; 95% of tags are "says" | the beat-quote-says rhythm the reviews kept hearing                  |
| The vague noun                              | "something" 126 times                                                    | "something in there whispers"                                        |
| Neat endings with a moral                   | the closing line tells you what it meant                                 | "They'll sleep better for that."                                     |

None of these is wrong once. Together they make every person sound like the same wry, laconic
narrator, every beat end on a punchline, and every paragraph the same length and pace, which is
exactly the "evenness of tone and sentence length" the field guide and the fiction editors name.
It also explains why the templating shows: a template is easiest to write as a self-contained
quip, so the quips multiplied.

**What we do about it** (a style guide, a lint and a rewrite pass, in the plan below):

- **Vary the length.** Let narration run: a sentence that carries two or three actions with
  "and", "while", "until", next to a short one. Target a mean nearer 13 and fewer than one in
  eight sentences of four words or fewer outside fights.
- **People talk like people.** Speech gets hesitation, half-sentences, questions back, small
  talk, wrong guesses and their own idiom; most lines are not quotable. A person's aphorism is
  rationed (a sensei may have one a scene; a genin rarely).
- **Drop the button.** End a beat on the action or the reply, not on a summing-up line. No
  closing moral.
- **Beats only where they mean something.** No gesture between every pair of lines; a nod is
  information, not punctuation. Budget "nods", "grins", "says nothing" across the game.
- **Colons belong to the UI.** In story text use a sentence or a comma.
- **Threes only when there are three things.**
- **Name the thing.** Replace "something" where the writer knows what it is.
- **Fresh atmosphere.** Retire the stock words (whispers, flicker, glint, firelight) to a
  budget and describe what this place has that others don't.

The prose lint (F3) measures all of these over the goldens and over content, with budgets, so a
rewrite can be seen to move them and a new line can't quietly bring them back.

## How lines are put together

Each line is chosen alone, by a hash, knowing nothing about the line before it, who is speaking,
or what just happened. Six causes account for nearly every complaint about assembly.

1. **Nobody has pronouns.** Generated people and template lines say "they"; authored lines say
   "he". In one scene Gōran "rolls their shoulders" and then "rolls up his sleeve". It is the
   single most visible seam, and it is everywhere a template meets an authored line.
2. **There is no realiser.** Text is assembled with string concatenation and flat
   `replace(/{slot}/)`: no articles ("Storehouse Wraith squares up"), no lists ("Bandit Thug and
   Bandit Thug"), no number agreement ("In 1 days"), no place forms ("at Training Grounds"), no
   capitals after a slot, straight quotes in places. Each slip is small; together they say
   "machine".
3. **Picks have no memory.** `pickLine` hashes the seed and a key, so the same line comes back
   whenever the key does: "Kaito searches, but finds no one" three exchanges running; "Again.
   Tomorrow, better." after every session; the same anecdote from the same friend. Variety
   exists in the banks; it is spent badly.
4. **Templates see nouns, not situations.** A conversation template gets a specialty word and
   says it ("It's taijutsu. Form is the whole thing."), so Asuka, Goro and Gōran say the same
   sentence with one word swapped. Fight lines do not know how hard a blow landed ("rips into…
   −7"); replies do not know whether the tone landed well or badly; encounter flavour does not
   know which job it is in; coaching does not know what was said yesterday.
5. **Things are said two or three times.** The journal repeats the card; the slip repeats the
   quote; a failed check is the stage text, the ledger and the debrief line; a guarded hit is a
   "Guarded" chip and "through a guard" and "a raised guard takes the worst of it".
6. **Rules text leaks into the story.** "Four walls: no room to back away, and a wide technique
   hits everyone." sits in the fight log; "Fights are planned, then watched… set your cards"
   is a sensei talking like a tooltip; chips show "+0.01" and "+0".

And one structural one: **scenes do not connect.** The curriculum explains drills after you
have drilled; a rumour goes round for a job you have done; an opener ignores where you are
and how well you know them; check outcomes do not agree with the stage that follows ("at
dawn" in the evening; "How many: Unknown").

### What already works, and is the model

- The academy break-in: authored, specific, reacting to what you did.
- Gōran's authored story beats ("His blade, my arm. My arm won." / "I'd have dodged." / "You'd
  have tried."): short, a voice, a joke that lands because it answers the line before.
- Small authored flavour: Haruno's melons ("Only the ripe ones. Every night. It knows."), the
  troupe's Master Tsuru, the glass trader's accent.

The goal is not to replace generation with hand-writing; it is to give generated text what the
authored text has: a speaker, a situation, and the line before it.

## Foundations (shared, done first)

Every section below leans on these. They are small, and each fixes problems in all four areas
at once.

### F1. A realiser (`src/game/prose/`)

One module that turns structured references into words, used by every place that fills a slot:

- **People:** `PersonRef` → name, pronouns (`they/he/she`, chosen per person in content and
  rolled for generated people, stored on the person), possessives, reflexives; first mention
  by name, later by pronoun within a paragraph; the player is always "you". The player's
  character already has `pronouns`; this extends the same `Pronouns` type to `PersonDef`
  and to generated people.
- **Things:** articles and number for foes and items ("a bandit", "two bandits", "the
  wraith"), proper names left bare; lists ("a thug, an archer and their dog").
- **Places:** a `PlaceDef` gets `at`/`to`/`in` forms ("at the training ground"), so no
  mid-sentence capital.
- **Counts and time:** "in a day / in two days", never numerals in story text.
- **Typography:** curly quotes, sentence capitals after a slot, one space, no double stops.

Slots become typed (`{them}`, `{their}`, `{foe:a}`, `{place:at}`), and `TOPIC_SLOTS` and the
sensei pool's slots declare their types, so validation catches a slot used in the wrong form.

### F2. Picks with memory

`pickLine(bank, key, memory)` avoids the last few lines drawn from that bank (kept per scene
for fights and missions, and in a small `said` slice on the save for people and the sensei),
still hashing the seed so the game stays deterministic. Banks gain optional `when` tags
(first time, again, after a miss, at night, close friend) so a pick prefers lines that fit.

### F3. Golden transcripts and a prose lint

- **Goldens:** a script renders fixed seeds through a fight, a day, a conversation set, a
  mission and a first-hours run into `src/test/prose/*.txt` snapshots, so every prose change
  shows up as a readable diff in review.
- **Lint** (a test over the goldens and over content): no numerals in story text, no straight
  quotes, no "their" next to a pronoun-bearing name's "his", no capital after a mid-sentence
  slot, no line repeated within N lines of itself, banned stock phrases over a budget ("says
  nothing", "nods once", "almost smiles"), no "!" outside shouted speech, chips never `+0`
  or with decimals.
- **Style measures** (reported, with budgets that tighten as the rewrite passes land): mean
  sentence length and the share of four-word sentences, the share of speech that is short
  impersonal one-liners, beats ending on a button, gesture beats, "A, B and C" lists, colons in
  story text, "something", and the stock atmosphere words, by area. The extractor and the
  EQ-Bench word lists live in `scripts/prose/` so the numbers in this plan can be rerun.

These are the measure for every phase below: a phase is done when its goldens read well and
its lint rules pass.

## Combat

**What is wrong.** About ninety `say()` sites write lines directly from the engine
(`engines/plan/state.ts`), picked by hash with no memory (`voice.ts`). Verbs do not scale with
the damage dealt, the guard clause appears in nearly every hit, a third of lines end in "!",
nothing marks a knockout or the end of a fight (`round.ts`), the ground's rules text and the
plan prompt appear in the log, and the realiser errors (articles, "closes to close range",
" and "-joined foe names) are densest here.

**Plan.**

1. **Clean the log.** Rules and ground text move to the plan screen; one guard mention per hit
   (the chip, or a phrase when it mattered); "!" only for shouts; realiser for names; fix
   "closes to close range" and the like. Player is "you" throughout.
2. **Weight words by outcome.** Each hit line is chosen from banks keyed by severity (graze,
   solid, heavy, crushing; by share of health), by art and by element: "−7" reads "catches",
   "−30" reads "slams". Misses keyed by why (slipped, guarded, out of reach).
3. **Endings.** A fall line for each combatant who drops, a closing beat for the fight (won,
   lost, fled, spared), and a one-paragraph summary on the result card read from the fight's
   events ("You lost the first round to its illusions, found it in the second, and went down
   in the third").
4. **Events, then words.** The engine emits structured events (attack, hit, slip, guard,
   step, condition, fall) instead of strings; a small narrator reads a turn's events and joins
   them ("You close in and drive a heel into the wraith; it was waiting, and the blow only
   glances off."), collapsing repeats ("You search again; still nothing." rather than three
   fresh searches). This is the big one, done after 1–3 prove the banks.
5. **Context banks.** Lines aware of the ground (a room, a lake), the round (opening, late,
   desperate), the relationship (a sensei's spar, a rival) and the foe kind (a spirit does not
   "strike").

## Talk (conversations, the sensei, coaching)

**What is wrong.** Templates see only topic nouns (`talk.ts`), pick the first trait's topic,
fill one value per slot (the same anecdote, the same drill), and the reply is one line
whatever the tone did (`peopleScenes.ts`). Coaching and the read-back are concatenations
(`coaching.ts`, `read.ts`), the farewell five lines in a row, sessions end on the same
sign-off, the curriculum is shared and ignores the sensei's voice. Pool senseis are filled with
no pronouns or place forms (`pool/story.ts`).

**Plan.**

1. **Quick fixes:** pronouns via F1 for every person; stock-phrase budget; drop session
   sign-offs to a bank with memory; curriculum lines through the sensei's `voice`.
2. **Topics rotate.** Choose the topic by what has not been said to you (`said` slice), across
   all of a person's traits, specialty and clan; never the same anecdote twice in a season.
3. **Replies by how it landed.** Each choice gets warm, flat and cool replies, picked by the
   bond delta, so a tease that annoys reads as annoyance.
4. **Coaching as one speech.** The lesson, the assignment's verdict, the read and the talent
   hint become one paragraph composed from parts with joins ("…and another thing"), in the
   sensei's voice, saying each fact once.
5. **Several values per slot.** Topics give lists (drills, sayings, memories) drawn without
   repeat, and a speaker's personal fill where content has one.
6. **Voice profiles.** A person's traits pick a register (blunt, warm, wry, formal) that
   chooses among phrasings of the same template line, so Goro and Gōran stop saying the same
   sentence.

## Missions and the road

**What is wrong.** A check has one outcome line (`checks.ts`), and its failure doubles as the
ledger; foes are named from the catalogue; encounter flavour is per template (one bandit camp
text in 21 of 70 stages; one parley, one recon); voices ignore what happened; camp lines are
fixed; fills cannot see the crew ("your sensei… hers"); road events claim costs that did not
happen ("It cost the light"); legs are not directional and nobody arrives; the debrief reads
the ledger back line for line.

**Plan.**

1. **Goldens and lint** for three jobs (a chore, the escort template, an arc job).
2. **Realiser and foe naming:** foes by kind with articles and counts ("two bandits and an
   archer"); fills see the crew through F1.
3. **Ledger apart from story.** Ledger lines become short and factual, never the failure text
   again; road events record what actually changed.
4. **Journeys that go somewhere:** legs say the direction and the land, the last leg arrives
   ("Kiri Ford's lamps across the water by dusk").
5. **Outcomes per approach:** a check's result line is keyed by the approach taken and
   success, so sneaking and talking fail differently, and the next stage reads the mark.
6. **Flavour pools:** encounter templates get banks by job and ground, drawn without repeat
   across a save.
7. **Voices v2 and camp:** crew lines keyed by the event (after a fight, after a choice they
   disliked), camp activities with variants by crew and weather.
8. **Debrief as prose:** a short narrated paragraph from the ledger (with the pay chips kept
   beside it), then the crew's last words.

## Village life and the systems' feedback

**What is wrong.** One fixed string per action (training shows the card's blurb; sleep, dice
and forage are fixed); chips with decimals and `+0`; a round's names listed twice
(`tavern.ts`); the sensei's settle lines, notice order and place forms (`settle.ts`); day hooks
("sets march"); day-end titles reading like rows ("Past halfway to Chūnin C", "Other"); the
file read-back contradicting itself (`fileReadBack.ts`); the ceremony's unlock triad;
"Stat: a first read"; rumours pinned past their job.

**Plan.**

1. **Chip hygiene and realiser basics** (F1, F3): no decimals or zeros in chips, place forms,
   counts.
2. **Read-back dedupe:** the file's read-back says each trait once and reconciles notes that
   pull against each other ("quick, but tires fast").
3. **Action lines with memory:** every daily action (drill, nap, sleep, forage, fish, dice)
   draws from a bank with F2, and a done line differs from a first one.
4. **Merge repeated entries:** the journal stops echoing the card; one entry per event.
5. **Context variants:** lines keyed by time of day, weather, season, festival, hunger.
6. **Day-end as a diary:** the sheet's headline a sentence about the day, not a list of
   bars; ladder titles in words.
7. **Ceremony, first reads and rumours:** the unlocks read as what the rank means; "a first
   read" phrased per stat; a rumour drops once its job is done and rotates by day.

## Scenes that connect (across all sections)

- The curriculum fires on triggers (before the first drill, not after).
- Openers gated by place and bond stage (no "can I tell you something" at a festival from a
  stranger).
- Generated facts agree with prose (time of day, counts), checked by the lint.
- Things the game asks of you are prompted where they happen (the team day).

## Order

1. Foundations F1–F3 (one PR; the goldens land first so the rest is reviewable as diffs).
2. Combat 1–3 and Talk 1 (the most-read text, and the pronoun fix everywhere).
3. Missions 2–4 and Village 1–4.
4. Talk 2–4, Missions 5–6, Village 5–7.
5. Combat 4–5 (the event layer), Talk 5–6, Missions 7–8, the connecting rules.
6. **Style passes**, one area per PR, alongside the steps above rather than after them: rewrite
   the content against the style guide (the machine voice section), most-read first: the
   sensei's lines and curriculum, conversation templates and topics, encounter flavour and
   voices, mission text, then descriptions. Each pass shows its style measures before and after.

Each step is its own PR with its goldens in the diff. No save-shape change until F2's `said`
slice (a migration) and pronouns on generated people (a migration rolling them from the seed).

## Done means

A reviewer can read a golden first-hours transcript end to end without spotting a seam:
everyone has the right pronoun, no line repeats within a scene, nothing is said twice, story
text has no numbers or rules, and two different people never say the same sentence; and the
style measures sit near human fiction: sentences that vary, speech that isn't a string of
quips, and beats that end on what happened rather than on a punchline.
