// Builds faces.html: a cast drawn from the parametric face kit, moods, avatars and the parts sheet.
import { writeFileSync } from 'node:fs';

import { BROWS, EARS, EXPRESSIONS, EYES, FACES, NOSES, portrait } from './faces.mjs';

const out = process.argv[2];

const CAST = [
  { name: 'Kaito', role: 'Genin, the player', face: 'oval', eyes: 'almond', brows: 'straight', nose: 'button', ears: 'small', expression: 'grin', build: 'average', hair_style: 'spiky', hair: '#7a3b22', skin: '#f2c9a0', iris: '#2f6a8a', irisLight: '#8fd0e8', outfit: '#263254', glow: '#e9864a', bg: '#4a2a3a', rim: '#ffb46a', headband: true },
  { name: 'Suzume', role: 'Rival kunoichi', face: 'heart', eyes: 'upturned', brows: 'thin', nose: 'snub', ears: 'small', expression: 'smirk', build: 'slight', hair_style: 'buns', hair: '#241a33', hairShade: '#140e1e', skin: '#f6d6bc', iris: '#6a2a4a', irisLight: '#ff8ab0', outfit: '#4a2e6a', glow: '#8a5ad0', bg: '#2c2040', rim: '#c9a0ff', lip: '#a83a4a', earring: true },
  { name: 'Genkurō', role: 'Old sensei', face: 'long', eyes: 'hooded', brows: 'bushy', nose: 'hooked', ears: 'lobed', expression: 'stern', build: 'broad', hair_style: 'topknot', hair: '#a8a4b0', browColour: '#d8d4dc', beardColour: '#c8c4cc', skin: '#e2b48a', iris: '#4a3a2a', irisLight: '#a08060', outfit: '#4c5a3a', glow: '#d9a441', bg: '#2e2a3a', rim: '#ffcf8a', age: 2, facialHair: 'beard', scar: '<path d="M70 55L76 71" stroke="#9a5a44" stroke-width="1.5" stroke-linecap="round"/>' },
  { name: 'Tetsu', role: 'Genin, the heavy hitter', face: 'round', eyes: 'narrow', brows: 'thick', nose: 'broad', ears: 'protruding', expression: 'smile', build: 'broad', hair_style: 'cropped', hair: '#1c1814', skin: '#a8714a', iris: '#3a2418', irisLight: '#8a5a30', outfit: '#6a3a24', glow: '#e08a4c', bg: '#3a2420', rim: '#ffb46a', spacing: 10 },
  { name: 'Hotaru', role: 'Medic in training', face: 'oval', eyes: 'round', brows: 'arched', nose: 'button', ears: 'small', expression: 'worried', build: 'slight', hair_style: 'bob', hair: '#9a4a2a', hairShade: '#6a2a14', skin: '#f6dcc4', iris: '#3f7a4a', irisLight: '#a8e0a0', outfit: '#3f6a5a', glow: '#57c7b8', bg: '#1f3a3a', rim: '#bff0e8', freckles: true },
  { name: 'Daigo', role: 'Jōnin, gate guard', face: 'square', eyes: 'narrow', brows: 'angled', nose: 'straight', ears: 'large', expression: 'stern', build: 'broad', hair_style: 'shaved', hair: '#1a1410', skin: '#6e4630', iris: '#2a1a10', irisLight: '#7a5030', outfit: '#3a3a44', glow: '#c0392b', bg: '#2a1a1e', rim: '#ff9a7a', facialHair: 'stubble', beardColour: '#1a1410', age: 1, scar: '<path d="M44 58L52 66M45 64L50 59" stroke="#4a2a1e" stroke-width="1.2" stroke-linecap="round"/>' },
  { name: 'Old Bunta', role: 'Noodle cook', face: 'round', eyes: 'downturned', brows: 'thick', nose: 'broad', ears: 'lobed', expression: 'grin', build: 'broad', hair_style: 'shaved', hair: '#8a8478', browColour: '#e8e4dc', beardColour: '#e8e4dc', skin: '#d9a074', iris: '#4a3020', irisLight: '#9a7050', outfit: '#efe3c8', glow: '#f0a050', bg: '#3a2a1e', rim: '#ffd29a', age: 2, facialHair: 'moustache' },
  { name: 'Ayame', role: 'Informant', face: 'angular', eyes: 'upturned', brows: 'thin', nose: 'long', ears: 'small', expression: 'smirk', build: 'slight', hair_style: 'long', hair: '#141018', skin: '#c99064', iris: '#5a3a1a', irisLight: '#e0a050', outfit: '#7d2a3a', glow: '#c0392b', bg: '#2a1620', rim: '#ffb4a0', lip: '#8a2a3a', mole: [66, 79], earring: true },
  { name: 'Ren', role: 'Genin, quiet one', face: 'long', eyes: 'downturned', brows: 'straight', nose: 'long', ears: 'large', expression: 'worried', build: 'slight', hair_style: 'shaggy', hair: '#4a4038', skin: '#f0c49c', iris: '#4a5a6a', irisLight: '#a0b8cc', outfit: '#2f4a5a', glow: '#6fb0ff', bg: '#1e2a3a', rim: '#bcd8ff' },
  { name: 'Homura', role: 'Genin, hothead', face: 'square', eyes: 'round', brows: 'angled', nose: 'snub', ears: 'protruding', expression: 'shout', build: 'average', hair_style: 'spiky', hair: '#b8321c', hairShade: '#7a1e10', skin: '#e8b088', iris: '#8a3a1a', irisLight: '#ffb060', outfit: '#3a2a20', glow: '#ff6a2a', bg: '#3a1a14', rim: '#ffc08a', headband: true },
  { name: 'Lady Kikyō', role: 'Village elder', face: 'heart', eyes: 'hooded', brows: 'arched', nose: 'straight', ears: 'lobed', expression: 'calm', build: 'slight', hair_style: 'long', hair: '#e8e4ec', browColour: '#cfc8d6', skin: '#f2d4bc', iris: '#5a4a6a', irisLight: '#b8a8d0', outfit: '#5a2a4a', glow: '#a46cf2', bg: '#2a1e34', rim: '#e0c8ff', age: 2, earring: true },
  { name: 'Mother Ume', role: 'Grocer', face: 'round', eyes: 'almond', brows: 'arched', nose: 'button', ears: 'lobed', expression: 'smile', build: 'average', hair_style: 'topknot', hair: '#6a6470', skin: '#8a5a3a', iris: '#2a1a10', irisLight: '#7a5030', outfit: '#8a6a2a', glow: '#d9a441', bg: '#2e2418', rim: '#ffd29a', age: 1, earring: true },
];

const card = (p, i) => `<figure class="person">${portrait(p, `c${i}`)}<figcaption><b>${p.name}</b>${p.role}</figcaption></figure>`;

const kaito = CAST[0];
const moods = ['calm', 'smile', 'grin', 'smirk', 'stern', 'worried', 'shout'];

const avatars = CAST.map((p, i) => `<span class="avatar" title="${p.name}">${portrait({ ...p, frame: '30 24 60 60' }, `a${i}`)}</span>`).join('');

const base = { name: 'Base', face: 'oval', eyes: 'almond', brows: 'straight', nose: 'straight', ears: 'small', expression: 'calm', build: 'average', hair_style: 'cropped', hair: '#3a2a22', skin: '#f0c49c', iris: '#5a3a24', irisLight: '#c08a50', outfit: '#3a4466', glow: '#e9864a', bg: '#3a2a3a', rim: '#ffb46a' };
const ROWS = [
  ['Face shape', 'face', Object.keys(FACES)],
  ['Neck and build', 'build', ['slight', 'average', 'broad']],
  ['Eye shape', 'eyes', Object.keys(EYES)],
  ['Brows', 'brows', Object.keys(BROWS)],
  ['Nose', 'nose', Object.keys(NOSES)],
  ['Ears', 'ears', Object.keys(EARS)],
  ['Expression', 'expression', Object.keys(EXPRESSIONS)],
  ['Age and facial hair', null, [['young', {}], ['lined', { age: 1 }], ['old', { age: 2, hair: '#9a96a0' }], ['stubble', { facialHair: 'stubble' }], ['moustache', { facialHair: 'moustache' }], ['goatee', { facialHair: 'goatee' }], ['beard', { facialHair: 'beard' }]]],
];
let n = 0;
const sheet = ROWS.map(([label, key, values]) => `<h3>${label}</h3><div class="row">${values
  .map((v) => {
    const [name, patch] = key ? [v, { [key]: v }] : v;
    return `<figure>${portrait({ ...base, ...patch }, `s${n++}`)}<figcaption>${name}</figcaption></figure>`;
  })
  .join('')}</div>`).join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shinobi Faces</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Shippori+Mincho:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--page:#efe6d2;--ink:#2a2118;--muted:#6f6149;--card:#f6eedc;--line:#d6c8a8;--story:'Shippori Mincho',Georgia,serif;--ui:'Atkinson Hyperlegible',system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--page:#0f0d15;--ink:#efe9f6;--muted:#a39ab4;--card:#1a1722;--line:#2a2636}}
:root[data-theme="dark"]{--page:#0f0d15;--ink:#efe9f6;--muted:#a39ab4;--card:#1a1722;--line:#2a2636}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--ink);font-family:var(--ui);line-height:1.5}
main{max-width:1180px;margin:0 auto;padding:40px 16px 80px}
h1,h2,h3{font-family:var(--story);margin:0}
h1{font-size:clamp(28px,5vw,42px);line-height:1.15}
h2{font-size:24px;margin:52px 0 6px}
h3{font-size:17px;margin:22px 0 8px}
.lede,.sub{color:var(--muted);max-width:680px}
.lede{font-size:17px;margin:12px 0 0}.sub{margin:0 0 18px}
figure{margin:0}
svg{display:block;width:100%;height:auto;border-radius:4px}
.cast{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:18px}
.person figcaption{font-size:13px;color:var(--muted);margin-top:6px}
.person b{display:block;font-family:var(--story);font-size:16px;color:var(--ink)}
.moods,.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}
.row figcaption,.moods figcaption{font-size:12.5px;color:var(--muted);margin-top:4px}
.avatars{display:flex;flex-wrap:wrap;gap:10px;padding:16px;background:#1e1b28;border-radius:4px}
.avatar{width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid #353046;display:block}
.avatar svg{border-radius:0}
.plan{max-width:760px;display:grid;gap:10px}
.plan p{margin:0}
code{font-size:.92em}
</style></head><body><main>
<h1>Faces that belong to someone</h1>
<p class="lede">Today a portrait is one face with a hairstyle and colours changed, so everyone reads as the same person. Here every face is put together from parts: face shape, neck and build, eye shape, brows, nose, ears and expression, with age lines, facial hair and marks on top. Twelve parts with five to seven choices each give hundreds of thousands of faces before any colour changes.</p>

<h2>A cast</h2>
<p class="sub">Twelve people from the same kit. Cover the hair and they still differ: Tetsu's round face and wide-set narrow eyes, Genkurō's long jaw and hooked nose, Ayame's angular cheekbones and upturned eyes.</p>
<div class="cast">${CAST.map(card).join('')}</div>

<h2>One person, many moods</h2>
<p class="sub">An expression moves the mouth together with the brows, the lower lids and the cheeks, so a smile shows in the eyes too. The game could pick the mood from the scene: a grin after a win, worry on the road, a shout mid-fight.</p>
<div class="moods">${moods.map((m, i) => `<figure>${portrait({ ...kaito, expression: m }, `m${i}`)}<figcaption>${m}</figcaption></figure>`).join('')}</div>

<h2>At avatar size</h2>
<p class="sub">The hub's "Who's here" row shows people at about 40px. Face shape, skin, brows and expression still tell them apart there.</p>
<div class="avatars">${avatars}</div>

<h2>The parts</h2>
<p class="sub">Each row changes one part on the same plain face.</p>
${sheet}

<h2>How it would reach the game</h2>
<div class="plan">
<p><b>New appearance fields.</b> <code>Appearance</code> gains <code>face</code>, <code>build</code>, <code>eyes</code>, <code>brows</code>, <code>nose</code>, <code>ears</code>, <code>mouth</code>, <code>age</code>, <code>facialHair</code> and <code>marks</code>, each a string-literal union like <code>hairStyle</code>.</p>
<p><b>Nobody is left with the default face.</b> Where a person's data leaves a part out, it is read from a hash of their id. Every authored person and every generated genin gets a distinct, stable face without editing content, and an old save keeps the face it always had. Authored characters can still pin any part.</p>
<p><b>Creation gets the parts as choices.</b> The character file adds face, eyes, nose, brows and ears pickers beside hair and colours.</p>
<p><b>Mood follows the moment.</b> A view model names an expression for each place a face appears (a bond scene, a debrief, a fight token), and the portrait draws it.</p>
</div>
</main></body></html>`;

writeFileSync(out, html);
console.log(`${(html.length / 1024).toFixed(0)} KB`);
