# Shinobi RPG

A text-based shinobi life RPG you can play offline on your phone.

You are a freshly graduated Genin in a world where the elements answer to those who listen and
the dead do not always rest. Train, eat, pay your rent, study techniques and take missions.
You make friends, join a team under a sensei, and later milestones add travel, elements and spirits, and the choice between going
rogue and rising to Kage.

## Playing

```bash
npm install
npm run dev        # http://localhost:5173
```

**On your phone:** the game is published to GitHub Pages at
**https://muscles4817.github.io/ShinobiRPG/** every time CI passes on `main`
(`.github/workflows/deploy.yml`). Open it in your phone's browser and use
**Add to Home Screen** (Safari: Share → Add to Home Screen; Chrome: ⋮ → Install app).
It then runs as an app and works fully offline; progress autosaves on the device.
New versions download automatically the next time you open it with a connection.

One-time setup: in the repo go to **Settings → Pages → Build and deployment → Source** and
choose **GitHub Actions**.

## What's in it

- **Your character is a file you break into.** The night before graduation you sneak into the
  Academy and read your own record: family and clan (with bloodlines such as the Byakugan or a
  dormant Sharingan), report-card grades across taijutsu, ninjutsu, genjutsu, kenjutsu and
  fūinjutsu, chakra nature, personality traits, a special talent and your dream. Each choice
  shows exactly what it changes.
- **Two worlds.** _Hidden Leaf_ uses Naruto names (a fan pack for personal play);
  _Land of Embers_ is the game's own setting. Choose when you start a new life.
- **The village is home.** Each village has its own backdrop and sky that follows the time of
  day, and places to visit: Mission Hall, Training Grounds, Market, Academy, Home, Hospital.
- **Every place works differently.** A drill board for training, food stalls, your rented room
  (pay rent or get locked out), a notice board of jobs, a rack of technique scrolls.
- **Missions play as a story** with real odds on every choice; fights use a hand of technique
  cards. Results come as cards: fight results, mission debriefs, hospital bills.
- **People live in the village.** The morning after graduation your team is read out: two
  generated classmates, and a choice between the two jōnin who suit you best. Canon (or
  original) characters keep daily schedules; the village screen shows who's where.
- **Bonds.** Talk to anyone who's around once a day. Pick a reply by its tone; their traits
  decide whether it lands. Get closer to learn what they're like and what they like to hear.
- **Your team in action.** C-rank team missions bring your teammates into every fight beside
  you. Once a week your sensei gives a lesson at the training ground, and once you're friends
  they teach you their signature technique. Spar with any genin who's around: win or lose,
  you learn from them and nobody ends up in hospital.
- **Travel** lists the other villages (coming soon).

## Releases

`npm run build` includes every pack. For anything public, use `npm run build:release`, which
leaves fan packs out entirely (`npm run check:release` verifies it). Note that the GitHub
Pages deploy uses the normal build, so it includes the fan pack.

## Development

See **[CLAUDE.md](./CLAUDE.md)** for the architecture, module boundaries and code-quality rules.

```bash
npm run check      # typecheck + lint + format + architecture + tests + build (what CI runs)
```
