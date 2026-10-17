import { writeFileSync } from 'node:fs';
import { portrait } from './portraits.mjs';
import { ICONS, bamboo, coast, dunes, fight, mountain } from './scenes.mjs';
import { village } from './village.mjs';

const out = process.argv[2];

// Today's backdrop, copied from src/ui/art/Backdrop.tsx (lantern-rooftops) over its evening sky.
const lamps = [[34, 100], [78, 110], [122, 104], [170, 96], [214, 98], [262, 102]]
  .map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="10" rx="3" fill="#ffb45e"/>`).join('');
const current = `<svg viewBox="0 0 300 210" preserveAspectRatio="xMidYMax slice" style="background:linear-gradient(180deg,#241d48 0%,#7a3a5c 55%,#e08a4c 100%)" role="img" aria-label="The current backdrop">
<circle cx="232" cy="58" r="14" fill="#ffe9c2" opacity=".75"/><path d="M0 150 L45 122 L95 140 L150 112 L205 136 L255 118 L300 140 V210 H0Z" fill="#100d1d" opacity=".55"/>
<path d="M0 210V168h16l12-11 12 11h12v-9l-7-5h36l-7 5v9h14l15-15 15 15h9v-14l-9-6h44l-9 6v8h18l12-10 12 10h18v-10l-7-6h38l-7 6v10h22V210Z" fill="#0b0912"/>
<path d="M0 92 Q75 124 150 96 T300 100" stroke="#5a3a3a" stroke-width="1.2" fill="none"/>${lamps}</svg>`;

const place = (icon, name, line, badge = '') => `<div class="place"><div class="place-icon">${ICONS[icon]}</div><div><div class="place-name">${name}${badge ? `<span class="stamp">${badge}</span>` : ''}</div><div class="place-line">${line}</div></div></div>`;

const dock = (active) => `<nav class="dock">${[['里', 'Here'], ['旅', 'Travel'], ['術', 'Jutsu'], ['縁', 'Bonds'], ['忍', 'Shinobi'], ['記', 'Record']]
  .map(([k, l]) => `<span class="${l === active ? 'on' : ''}"><b>${k}</b>${l}</span>`).join('')}</nav>`;

const meters = `<div class="meters"><span><i style="--c:var(--health);--v:86%"></i>Health</span><span><i style="--c:var(--chakra);--v:64%"></i>Chakra</span><span><i style="--c:var(--energy);--v:48%"></i>Energy</span></div>`;

const hub = `<div class="phone"><div class="screen hub">
<div class="hero">${village('hv', { bough: 'right', moon: [150, 214] })}
<header class="hud"><div class="seal">灯</div><div><h3>Tōrōgakure</h3><p>Evening of the twelfth, spring</p></div></header></div>
<div class="below">${meters}
<h4>In the village</h4>
<div class="places">
${place('Lantern', 'Lantern Tower', 'The hall posts jobs until the last bell.', 'New')}
${place('Ramen', 'Hoshi’s noodle stand', 'Steam on the corner, a seat free at the end.')}
${place('Onsen', 'Yuzu bathhouse', 'Warm through before the day ends.')}
</div></div>
<div class="ticker">The lantern-keeper is hanging the festival strings early this year.</div>
${dock('Here')}</div></div>`;

const card = (art, name, line, colour, rank) => `<div class="tcard" style="--d:var(--${colour})"><div class="tcard-art">${art}</div><div class="tcard-body"><b>${name}</b><span>${line}</span></div><em>${rank}</em></div>`;
const flareArt = `<svg viewBox="0 0 60 60"><defs><radialGradient id="fa-g" cx=".4" cy=".7"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffc04a"/><stop offset="1" stop-color="#e2532e"/></radialGradient></defs><path d="M30 6C38 18 48 24 46 38C44 50 36 54 30 54C22 54 14 48 14 38C14 30 20 26 22 18C26 24 26 28 30 30C32 22 30 14 30 6Z" fill="url(#fa-g)" stroke="#1d1510" stroke-width="1.6"/><path d="M30 34C34 40 36 44 34 48C32 51 28 51 26 48C24 44 28 40 30 34Z" fill="#fff6c8"/></svg>`;
const palmArt = `<svg viewBox="0 0 60 60"><path d="M18 52V30C18 26 24 26 24 30V14C24 10 30 10 30 14V12C30 8 36 8 36 12V16C36 12 42 12 42 16V36C42 46 36 52 28 52Z" fill="#f2c9a0" stroke="#1d1510" stroke-width="1.6"/><path d="M8 20l6 4M6 32l8 0M10 44l6-4" stroke="#e5643f" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const veilArt = `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="#2c2040" stroke="#1d1510" stroke-width="1.6"/><path d="M14 30Q30 14 46 30Q30 46 14 30Z" fill="#efe3c8" stroke="#1d1510" stroke-width="1.4"/><circle cx="30" cy="30" r="6" fill="#a46cf2"/><circle cx="30" cy="30" r="2.4" fill="#1d1510"/><path d="M8 14q8 4 6 12M52 46q-8-4-6-12" stroke="#a46cf2" stroke-width="2" fill="none"/></svg>`;

const fightScreen = `<div class="phone"><div class="screen fight">
<div class="stage">${fight('fs', portrait('genin', 'fga'), portrait('rival', 'fgb'))}
<div class="bars left"><b>You</b><div class="bar"><i style="--c:var(--health);--v:72%"></i></div><div class="bar thin"><i style="--c:var(--chakra);--v:40%"></i></div></div>
<div class="bars right"><b>Suzume</b><div class="bar"><i style="--c:var(--health);--v:38%"></i></div><div class="bar thin"><i style="--c:var(--chakra);--v:66%"></i></div></div>
</div>
<div class="below">
<div class="log"><p>You draw the lantern’s heat into your palms and let it go.</p><p class="hit">Suzume is caught at the edge of the flare. <span class="chip harm">−24</span></p></div>
<h4>Your plan up close</h4>
<div class="cards">
${card(flareArt, 'Lantern Flare', 'Fire, wide. Hard to slip.', 'ninjutsu', 'D')}
${card(palmArt, 'Ember Palm', 'Two quick blows.', 'taijutsu', 'E')}
${card(veilArt, 'Paper Veil', 'They lose sight of you.', 'genjutsu', 'E')}
</div>
<button class="go">Watch the exchange</button>
</div></div></div>`;

const bonds = `<div class="phone"><div class="screen sheet">
<div class="sheet-top"><div class="big-portrait">${portrait('sensei', 'bs')}</div>
<div class="who"><h3>Akane Tsukiyo</h3><p>Your sensei. Jōnin, ninjutsu.</p><div class="dots"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div><p class="small">Trusted. One more stage opens their story of the burned lantern.</p></div></div>
<div class="paper">
<h4>What they’ve seen of you</h4>
<p>“Your guard drops whenever you throw. Fix that before the exam.”</p>
<h4>This week</h4><div class="week"><span class="tag" style="--d:var(--ninjutsu)">Lesson at the training ground, morning</span><span class="tag" style="--d:var(--taijutsu)">Raise your speed one step</span><span class="tag" style="--d:var(--genjutsu)">Team day: the river job</span></div>
<h4>Your team</h4>
<div class="team">
<div class="mini">${portrait('genin', 'bt1')}<b>You</b></div>
<div class="mini">${portrait('rival', 'bt2')}<b>Suzume</b></div>
</div></div>
${dock('Bonds')}</div></div>`;

const scenes = [
  ['The coast at dawn', coast('sc')],
  ['The mountain shrine at dusk', mountain('sm')],
  ['The bamboo grove in mist', bamboo('sb')],
  ['The dune town at noon', dunes('sd')],
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lantern Village Art</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Shippori+Mincho:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--page:#efe6d2;--page-ink:#2a2118;--page-muted:#6f6149;--page-line:#d6c8a8;
--bg:#14121b;--surface:#1e1b28;--raise:#282435;--line:#353046;--ink:#efe9f6;--story:#e9e0cc;--muted:#a39ab4;--lantern:#f0a050;--gold:#ffd27a;
--health:#ff7b6b;--chakra:#6fb0ff;--energy:#ffd27a;--harm:#ff6f61;--good:#7fd6a0;--paper:#efe3c8;--paper-ink:#2a2118;--seal:#c0392b;
--taijutsu:#e5643f;--ninjutsu:#4f8fe8;--genjutsu:#a46cf2;
--story-font:'Shippori Mincho',Georgia,serif;--ui-font:'Atkinson Hyperlegible',system-ui,sans-serif;--radius:4px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--page:#0f0d15;--page-ink:#efe9f6;--page-muted:#a39ab4;--page-line:#2a2636}}
:root[data-theme="dark"]{--page:#0f0d15;--page-ink:#efe9f6;--page-muted:#a39ab4;--page-line:#2a2636}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--page-ink);font-family:var(--ui-font);line-height:1.5}
main{max-width:1240px;margin:0 auto;padding:40px 16px 80px}
h1,h2{font-family:var(--story-font);font-weight:700;margin:0}
h1{font-size:clamp(28px,5vw,44px);line-height:1.15}
h2{font-size:24px;margin:56px 0 6px}
.lede{max-width:660px;color:var(--page-muted);font-size:17px;margin:12px 0 0}
.sub{color:var(--page-muted);margin:0 0 20px;max-width:660px}
.phones{display:flex;gap:28px;flex-wrap:wrap;justify-content:center}
.phone{width:390px;max-width:100%;flex:0 1 390px}
.phone figcaption{font-family:var(--story-font);text-align:center;margin-top:10px;color:var(--page-muted)}
.screen{position:relative;height:844px;border-radius:44px;overflow:hidden;background:var(--bg);color:var(--ink);border:10px solid #07060a;box-shadow:0 24px 60px rgb(0 0 0/.35)}
.screen svg{display:block;width:100%;height:auto}
.hero{position:relative}
.hud{position:absolute;top:40px;left:16px;right:16px;display:flex;gap:12px;align-items:center}
.screen svg svg{width:88px;height:110px}
.hub .hero{height:430px;overflow:hidden}.hub .hero>svg{height:430px}
.hud h3{font-family:var(--story-font);font-size:28px;margin:0;text-shadow:0 2px 12px rgb(0 0 0/.6)}
.hud p{margin:0;color:var(--story);font-size:14px;text-shadow:0 1px 6px rgb(0 0 0/.8)}
.seal{width:40px;height:40px;border:2px solid var(--seal);color:var(--seal);display:grid;place-items:center;font-family:var(--story-font);font-size:22px;transform:rotate(-6deg);background:rgb(239 227 200/.92);border-radius:3px}
.below{padding:0 16px;position:relative}
.hub .hero{margin-bottom:-28px}
.meters{display:flex;gap:10px;font-size:12px;color:var(--muted)}
.meters span,.bars .bar{flex:1}
.meters i,.bar i{display:block;height:6px;border-radius:1px;background:linear-gradient(90deg,var(--c) var(--v),rgb(255 255 255/.08) var(--v));margin-bottom:3px}
h4{font-family:var(--story-font);font-size:17px;margin:14px 0 8px;color:var(--story);font-weight:700}
.places{display:grid;gap:8px}
.place{display:flex;gap:12px;align-items:center;padding:8px 10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)}
.place-icon{width:44px;height:44px;flex:none;background:var(--raise);border-radius:3px;padding:3px}
.place-name{font-weight:700;font-size:15px;display:flex;gap:8px;align-items:center}
.place-line{font-size:13px;color:var(--muted)}
.stamp{font-family:var(--story-font);font-size:11px;color:var(--seal);border:1.5px solid var(--seal);padding:0 5px;transform:rotate(-4deg);font-weight:700}
.ticker{position:absolute;left:0;right:0;bottom:70px;padding:9px 16px;font-family:var(--story-font);font-size:14px;color:var(--story);background:linear-gradient(0deg,var(--bg),rgb(20 18 27/.85))}
.dock{position:absolute;left:0;right:0;bottom:0;height:70px;display:flex;background:#2a1c14;border-top:1px solid #4f3420;padding-bottom:6px}
.dock span{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:#c9b08a}
.dock b{font-family:var(--story-font);font-size:20px;font-weight:700;line-height:1.1}
.dock .on{color:var(--gold)}
.dock .on b{text-shadow:0 0 12px rgb(255 180 90/.7)}
.stage{position:relative}
.bars{position:absolute;top:46px;width:150px;font-size:13px}
.bars.left{left:16px}.bars.right{right:16px;text-align:right}
.bar{background:rgb(0 0 0/.35);padding:2px;border-radius:2px;margin-top:4px}
.bar i{height:8px;margin:0}.bar.thin i{height:4px}
.log{font-family:var(--story-font);font-size:15px;color:var(--story);padding-top:10px}
.log p{margin:0 0 6px}
.chip{font-family:var(--ui-font);font-size:12px;font-weight:700;padding:1px 6px;border-radius:2px;margin-left:4px}
.chip.harm{background:rgb(255 111 97/.16);color:var(--harm)}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.tcard{position:relative;background:var(--paper);color:var(--paper-ink);border-radius:var(--radius);border-top:4px solid var(--d);padding:6px 6px 8px;min-height:150px}
.tcard-art{background:#1e1b28;border-radius:3px;padding:6px;aspect-ratio:1}
.tcard-body b{display:block;font-family:var(--story-font);font-size:14px;margin-top:6px;line-height:1.2}
.tcard-body span{font-size:11.5px;color:#6f6149;line-height:1.3;display:block}
.tcard em{position:absolute;top:10px;right:10px;font-style:normal;font-family:var(--story-font);font-weight:700;color:#efe3c8;font-size:13px;background:var(--d);width:22px;height:22px;display:grid;place-items:center;border-radius:2px}
.go{margin-top:12px;width:100%;height:48px;border:0;border-radius:var(--radius);background:var(--lantern);color:#1b120a;font:700 16px var(--ui-font)}
.sheet{background:radial-gradient(120% 60% at 70% 0%,#3a2a20,var(--bg) 70%)}
.sheet-top{display:flex;gap:14px;padding:52px 16px 12px;align-items:flex-end}
.big-portrait{width:150px;flex:none;border:3px solid #4f3420;border-radius:3px;overflow:hidden;box-shadow:0 10px 30px rgb(0 0 0/.5)}
.who h3{font-family:var(--story-font);font-size:24px;margin:0;line-height:1.15}
.who p{margin:4px 0;color:var(--story);font-size:14px}.who .small{font-size:12.5px;color:var(--muted)}
.dots{display:flex;gap:5px;margin:8px 0}.dots i{width:12px;height:12px;border:1.5px solid var(--lantern);transform:rotate(45deg)}.dots .on{background:var(--lantern)}
.paper{margin:8px 16px;background:var(--paper);color:var(--paper-ink);padding:6px 16px 16px;border-radius:var(--radius)}
.paper h4{color:var(--paper-ink)}.paper p{font-family:var(--story-font);margin:0}
.week{display:grid;gap:6px}.tag{font-size:13.5px;padding:6px 10px;border:1px solid #d6c8a8;border-top:3px solid var(--d);border-radius:3px;background:#f6ecd6}
.team{display:flex;gap:10px}.mini{width:96px;text-align:center;font-size:13px}.mini svg{border-radius:3px;border:2px solid #4f3420}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:820px;margin:0 auto}
.compare figure,.gallery figure{margin:0}
.compare svg,.gallery svg{display:block;width:100%;height:auto;border-radius:var(--radius);aspect-ratio:3/4}

figcaption{font-size:14px;color:var(--page-muted);margin-top:6px}
.gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.gallery svg{aspect-ratio:auto}
.portraits{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;max-width:820px}
.portraits svg{display:block;width:100%;border-radius:var(--radius)}
.icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:12px}
.icons figure{margin:0;text-align:center}
.icons div{background:#1e1b28;border:1px solid #353046;border-radius:var(--radius);padding:12px;aspect-ratio:1}
.icons .tiny{display:flex;gap:6px;justify-content:center;margin-top:6px}
.notes{max-width:760px;display:grid;gap:12px}
.notes p{margin:0}
.notes b{font-family:var(--story-font)}
@media (max-width:640px){.compare,.gallery{grid-template-columns:1fr}.screen{height:auto;min-height:780px;border-width:6px;border-radius:32px}}
</style></head><body><main>
<h1>Lantern Village art direction</h1>
<p class="lede">Mockups for a richer 2D look on phones. Everything here is still inline SVG and CSS gradients: no image files, so it works offline, stays small, and every drawing can still be generated from data the way the game draws portraits and backdrops today.</p>

<h2>Before and after</h2>
<p class="sub">The same village backdrop. Today it is three flat silhouettes; the proposal paints it in layers: sky, moon and cloud, far hills in haze, the Lantern Tower, valley mist, lit townhouses, lantern strings, and a sakura bough in front.</p>
<div class="compare"><figure>${current}<figcaption>Today: lantern rooftops</figcaption></figure><figure class="after">${village('cv')}<figcaption>Proposed: Tōrōgakure at evening</figcaption></figure></div>

<h2>On the phone</h2>
<p class="sub">Three screens at 390px: the village you arrive in, a fight mid-exchange, and a sensei’s sheet. The art sits behind the interface; the existing tokens, fonts and paper surfaces stay.</p>
<div class="phones">
<figure class="phone">${hub.replace(/^<div class="phone">|<\/div>$/g, '')}<figcaption>Here: the village hub</figcaption></figure>
<figure class="phone">${fightScreen.replace(/^<div class="phone">|<\/div>$/g, '')}<figcaption>A fight: the cedar clearing</figcaption></figure>
<figure class="phone">${bonds.replace(/^<div class="phone">|<\/div>$/g, '')}<figcaption>Bonds: a sensei’s sheet</figcaption></figure>
</div>

<h2>Portraits</h2>
<p class="sub">The woodblock key line stays, but faces get proper eyes (iris gradient, catchlights, lids), cel shadows under the fringe and jaw, a warm rim light from the lanterns, and outfits by role. Each part is still a swappable layer, so <code>Appearance</code> can drive them.</p>
<div class="portraits">${['genin', 'sensei', 'rival'].map((k) => `<figure>${portrait(k, 'pp' + k)}<figcaption>${{ genin: 'Genin: spiky hair, forehead plate, scarf', sensei: 'Sensei: topknot, scar, half-lidded calm', rival: 'Rival: hime bangs, buns, kimono collar' }[k]}</figcaption></figure>`).join('')}</div>

<h2>Places in the wider country</h2>
<p class="sub">Each land gets its own palette and light, so travelling feels like arriving somewhere.</p>
<div class="gallery">${scenes.map(([n, s]) => `<figure>${s}<figcaption>${n}</figcaption></figure>`).join('')}</div>

<h2>Icons</h2>
<p class="sub">Two-tone drawings in the same ink line as the portraits, readable at 24px and rich at 48px. Shown on the lacquer tile used for place cards, with the small sizes below.</p>
<div class="icons">${Object.entries(ICONS).map(([n, s]) => `<figure><div>${s}</div><div class="tiny" style="background:none;border:0;padding:0;aspect-ratio:auto"><span style="width:24px;display:block">${s}</span><span style="width:32px;display:block">${s}</span></div><figcaption>${n}</figcaption></figure>`).join('')}</div>

<h2>Keeping it fast on a phone</h2>
<div class="notes">
<p><b>Glow without blur.</b> Every lantern glow, halo and fire burst is a radial gradient. No <code>feGaussianBlur</code> or <code>feTurbulence</code>, which are the filters that make mobile Safari stutter.</p>
<p><b>Generated, not hand-placed.</b> Ridgelines, stars, blossoms, bamboo and roof tiles come from a seeded generator, the same way the game already draws from its seed. A backdrop is a few kilobytes of code rather than a large asset.</p>
<p><b>Layers you can move.</b> Each scene is built back to front (sky, far hills, middle ground, street, foreground), so the hub can drift its layers a few pixels on scroll or tilt, and the sky can still change by time of day through the existing <code>.sky[data-slot]</code> classes.</p>
<p><b>Same rules as the UI.</b> Colours come from the token palette, numbers stay in chips, labels are sentence case, and there are no image files, so it all still works offline.</p>
</div>
</main></body></html>`;

writeFileSync(out, html);
console.log(`${(html.length / 1024).toFixed(0)} KB`);
