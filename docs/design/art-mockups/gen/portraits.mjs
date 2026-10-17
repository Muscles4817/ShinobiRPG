// Bust portraits, 120×150: cel-shaded flat colour under a woodblock key line, warm rim light.
const INK = '#1d1510';
const L = `stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"`;
const MIRROR = 'matrix(-1 0 0 1 120 0)';

const FACE = 'M41 56C41 40 49 31 60 31C71 31 79 40 79 56C79 68 75 79 68 86C65 89 62 90.5 60 90.5C58 90.5 55 89 52 86C45 79 41 68 41 56Z';
const FACE_SHADE = 'M69 33C76 38 79 46 79 56C79 68 75 79 68 86C65 89 62 90.5 60 90.5C64 86 69 78 71 68C73 58 73 44 69 33Z';
const EAR = 'M42 57C37 54.5 35.6 61 37.2 65.4C38.4 68.6 40.6 70 42.8 69Z';
const EYE_WHITE = 'M44.5 62.5Q50 58.8 56.5 61.6Q55.6 66.8 50.6 67.2Q46 67 44.5 62.5Z';

function eye(id, c) {
  const lid = c.lid
    ? `<path d="M43 58Q50 57 58 59.6L57.4 63Q50 61.4 44 63.6Z" fill="${c.skin}"/><path d="M44 63.4Q50 60.8 57.6 62.6" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<path d="M43.4 62.4Q50 57.6 57.6 61.2" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M43.6 62.3L41.6 60.4" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`;
  const liner = c.liner
    ? `<path d="M43.2 62.6Q41 61.4 39.6 59.2Q42.6 60.6 44.4 61.4Z" fill="${c.liner}"/>`
    : '';
  return `<path d="${EYE_WHITE}" fill="#fbf6ee"/>
<g clip-path="url(#${id}-eye)"><circle cx="50.8" cy="63.6" r="3.5" fill="url(#${id}-iris)"/><circle cx="50.8" cy="63.6" r="1.6" fill="${INK}"/><path d="M44 61H58V63Q50 61.6 44 63Z" fill="${INK}" opacity=".18"/></g>
<circle cx="52.1" cy="62.2" r="1" fill="#fff"/><circle cx="49.6" cy="65.2" r=".5" fill="#fff" opacity=".8"/>
<path d="M46.4 66.6Q50.5 67.9 54.6 66.3" stroke="${INK}" stroke-width=".6" opacity=".45" fill="none"/>
${lid}${liner}
<path d="${c.brow}" stroke="${c.browColour}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
}

function face(id, c) {
  return `<path d="${EAR}" fill="${c.skin}" ${L}/><path d="${EAR}" fill="${c.skin}" ${L} transform="${MIRROR}"/>
<path d="M39 60C38.4 63 39.4 66 41 67.4" stroke="${c.shade}" stroke-width="1" fill="none" transform="${MIRROR}"/>
<path d="${FACE}" fill="${c.skin}" ${L}/>
<g clip-path="url(#${id}-face)"><path d="${FACE_SHADE}" fill="${c.shade}" opacity=".55"/>${c.fringeShadow ? `<path d="${c.fringe}" fill="${c.shade}" opacity=".7" transform="translate(1.4 3.2)"/>` : ''}</g>
<path d="M72.5 37C77 42 79 49 79 56C79 68 75 79 68 86" stroke="${c.rim}" stroke-width="1.3" stroke-opacity=".8" fill="none" stroke-linecap="round"/>
<ellipse cx="48" cy="72.4" rx="3.6" ry="1.6" fill="#ff8a8a" opacity=".22"/><ellipse cx="72" cy="72.4" rx="3.6" ry="1.6" fill="#ff8a8a" opacity=".22"/>
${eye(id, c)}<g transform="${MIRROR}">${eye(id, { ...c, brow: c.brow })}</g>
${c.mask ? '' : `<path d="M61 66.4Q62.5 71.2 59.6 72" stroke="${c.shade}" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M59.4 68Q59 70 59.4 71" stroke="#fff" stroke-opacity=".5" stroke-width=".6" fill="none"/>
<path d="${c.mouth ?? 'M55.8 78.6Q60 80.2 64.2 78.4'}" stroke="${c.lip ?? '#6b2f28'}" stroke-width="1.25" fill="none" stroke-linecap="round"/><path d="M58 81.4Q60 82 62 81.4" stroke="${c.shade}" stroke-width=".8" fill="none" opacity=".7"/>`}
${c.scar ?? ''}`;
}

function frame(id, c, inner) {
  return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.label}">
<defs>
<radialGradient id="${id}-bg" cx=".7" cy=".75" r=".9"><stop offset="0" stop-color="${c.glow}"/><stop offset=".55" stop-color="${c.bgMid}"/><stop offset="1" stop-color="#120f19"/></radialGradient>
<radialGradient id="${id}-iris" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="${c.irisLight}"/><stop offset="1" stop-color="${c.iris}"/></radialGradient>
<linearGradient id="${id}-metal" x2="0" y2="1"><stop offset="0" stop-color="#eef0f6"/><stop offset=".55" stop-color="#a9adbd"/><stop offset="1" stop-color="#6a6f80"/></linearGradient>
<clipPath id="${id}-eye"><path d="${EYE_WHITE}"/></clipPath>
<clipPath id="${id}-face"><path d="${FACE}"/></clipPath>
<clipPath id="${id}-right"><rect x="64" width="60" height="150"/></clipPath>
</defs>
<rect width="120" height="150" fill="url(#${id}-bg)"/>
<circle cx="92" cy="40" r="26" fill="${c.glow}" opacity=".18"/>
<path d="M-4 128Q40 112 124 122" stroke="#000" stroke-opacity=".18" stroke-width="18" fill="none"/>
${inner}
</svg>`;
}

/** Shoulders, neck and clothing for each kind of fighter. */
function body(id, c) {
  const neck = `<path d="M52 80V101Q60 106 68 101V80Z" fill="${c.skin}" ${L}/><path d="M52 84Q60 95 68 84V93Q60 99 52 93Z" fill="${c.shade}" opacity=".8"/>`;
  if (c.outfit === 'genin')
    return `${neck}<path d="M8 151C10 124 28 110 49 104L60 112L71 104C92 110 110 124 112 151Z" fill="#263254" ${L}/>
<g clip-path="url(#${id}-right)"><path d="M8 151C10 124 28 110 49 104L60 112L71 104C92 110 110 124 112 151Z" fill="#141a30" opacity=".6"/></g>
<path d="M32 118Q30 134 33 151M88 118Q90 134 87 151" stroke="#3a4670" stroke-width="1.2" fill="none"/>
<path d="M26 122L96 151" stroke="#3b2a1e" stroke-width="6"/><path d="M26 122L96 151" stroke="#5a4030" stroke-width="2" stroke-dasharray="2 5"/>
<path d="M44 99Q60 110 76 99L79 109Q60 121 41 109Z" fill="#c8452f" ${L}/><path d="M60 113Q70 111 79 109L77 104Q70 110 60 112Z" fill="#8f2a1c"/>
<path d="M47 108Q40 124 45 142L54 140Q49 124 55 111Z" fill="#c8452f" ${L}/><path d="M50 116Q48 128 50 138" stroke="#8f2a1c" stroke-width="1.4" fill="none"/>
<path d="M78 101Q82 104 79 109" stroke="${c.rim}" stroke-opacity=".8" stroke-width="1.2" fill="none"/>`;
  if (c.outfit === 'sensei')
    return `${neck}<path d="M6 151C8 122 28 108 50 103L60 109L70 103C92 108 112 122 114 151Z" fill="#3a3a44" ${L}/>
<path d="M30 112C34 108 42 104 50 103L56 151H30Z" fill="#4c5a3a" ${L}/><path d="M90 112C86 108 78 104 70 103L64 151H90Z" fill="#4c5a3a" ${L}/>
<path d="M38 99Q60 93 82 99L84 110Q60 103 36 110Z" fill="#4c5a3a" ${L}/>
<g fill="#3d4a2e" ${L}><rect x="34" y="122" width="14" height="12" rx="1.5"/><rect x="72" y="122" width="14" height="12" rx="1.5"/><rect x="34" y="137" width="14" height="12" rx="1.5"/><rect x="72" y="137" width="14" height="12" rx="1.5"/></g>
<g clip-path="url(#${id}-right)"><path d="M6 151C8 122 28 108 50 103L60 109L70 103C92 108 112 122 114 151Z" fill="#000" opacity=".25"/></g>
<path d="M10 140C12 124 22 114 34 110" stroke="#c8452f" stroke-width="5" fill="none"/>
<path d="M84 99Q90 104 92 112" stroke="${c.rim}" stroke-opacity=".7" stroke-width="1.2" fill="none"/>`;
  return `${neck}<rect x="52" y="90" width="16" height="4.5" fill="#1a1422" ${L}/><rect x="56.5" y="89.6" width="7" height="5.2" rx="1" fill="url(#${id}-metal)" ${L}/>
<path d="M8 151C10 124 28 110 49 104L60 120L71 104C92 110 110 124 112 151Z" fill="#4a2e6a" ${L}/>
<path d="M49 104L60 120L71 104L67 103L60 113L53 103Z" fill="#efe3c8" ${L}/>
<path d="M44 106L64 151M76 106L58 136" stroke="#2d1b44" stroke-width="1.2" fill="none"/>
<g clip-path="url(#${id}-right)"><path d="M8 151C10 124 28 110 49 104L60 120L71 104C92 110 110 124 112 151Z" fill="#1a0f2a" opacity=".45"/></g>
<path d="M30 146Q60 140 90 146V151H30Z" fill="#7d2a3a" ${L}/>
<path d="M76 106Q92 112 102 126" stroke="${c.rim}" stroke-opacity=".7" stroke-width="1.2" fill="none"/>`;
}

function hairBack(id, c) {
  return `<path d="${c.back}" fill="${c.hair}" ${L}/>
<g clip-path="url(#${id}-right)"><path d="${c.back}" fill="${c.hairShade}" opacity=".55"/></g>
<path d="${c.back}" fill="none" stroke="${c.rim}" stroke-opacity=".55" stroke-width="1.4" clip-path="url(#${id}-right)"/>`;
}

function hairFront(c) {
  return `<path d="${c.fringe}" fill="${c.hair}" ${L}/>
<path d="${c.shine}" stroke="${c.hairLight}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".75"/>`;
}

const GENIN = {
  label: 'A genin of the Lantern village',
  skin: '#f2c9a0', shade: '#d39a78', rim: '#ffb46a',
  hair: '#7a3b22', hairShade: '#3f1c10', hairLight: '#e08a4e',
  iris: '#2f6a8a', irisLight: '#8fd0e8', browColour: '#4a2414',
  glow: '#e9864a', bgMid: '#4a2a3a',
  brow: 'M44.5 53Q50.5 50 57 52', fringeShadow: true, outfit: 'genin',
  back: 'M36 66L28 52L37 50L30 32L42 36L42 18L53 28L60 10L67 27L79 16L79 34L91 30L84 46L93 52L84 66Z',
  fringe: 'M39 58C37 42 45 28 60 27C75 28 83 42 81 58L78 50L76 57L72 45L68 55L64 43L60 53L55 42L52 54L47 45L45 56L42 49Z',
  shine: 'M46 33Q52 29 58 29M63 29Q68 30 72 33',
};

const SENSEI = {
  label: 'A sensei, scarred and patient',
  skin: '#e2b48a', shade: '#b9845e', rim: '#ffcf8a',
  hair: '#26222e', hairShade: '#0e0c12', hairLight: '#7a7690',
  iris: '#4a3a2a', irisLight: '#b08a5a', browColour: '#1a161e',
  glow: '#d9a441', bgMid: '#2e2a3a',
  brow: 'M44.5 54.6Q50.5 52.8 57 54', lid: true, fringeShadow: true, outfit: 'sensei',
  mouth: 'M56.4 79.2Q60 79.6 63.6 78.8',
  back: 'M37 70C33 50 40 29 60 28C80 29 87 50 83 70L80 98C78 108 70 110 68 102L74 70Z',
  fringe: 'M40 60C38 42 46 30 60 29C74 30 82 42 80 60C79 52 77 46 73 42C72 48 70 52 66 54C66 48 64 43 60 40C56 46 50 50 42 54C41 56 40 58 40 60Z',
  shine: 'M48 34Q55 30 62 31M70 36Q74 40 76 46',
  scar: `<path d="M53 69L67 63" stroke="#9a5a44" stroke-width="1.6" stroke-linecap="round"/><path d="M53 69L67 63" stroke="#f0c8a8" stroke-width=".5" stroke-linecap="round"/>`,
  extra: `<path d="M66 33C70 38 72 44 72.5 50M62 31C66 36 67 40 67 44" stroke="#9a96a8" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  extraBehind: `<ellipse cx="60" cy="24" rx="8" ry="6" fill="#26222e" stroke="${INK}" stroke-width="1.1"/><path d="M53 28.5Q60 30.5 67 28.5" stroke="#c8452f" stroke-width="2.2" fill="none"/>`,
};

const RIVAL = {
  label: 'A rival kunoichi',
  skin: '#f6d6bc', shade: '#d8a48c', rim: '#c9a0ff',
  hair: '#241a33', hairShade: '#0c0812', hairLight: '#8a6ab8',
  iris: '#6a2a4a', irisLight: '#ff8ab0', browColour: '#1a1224', liner: '#c0392b',
  glow: '#8a5ad0', bgMid: '#2c2040', lip: '#a83a4a',
  brow: 'M45 53.6Q51 51.4 57 54.2', fringeShadow: true, outfit: 'rival',
  back: 'M38 66C33 44 42 29 60 28C78 29 87 44 82 66L80 104L72 102L76 64H44L48 102L40 104Z',
  fringe: 'M40 58C38 42 46 31 60 31C74 31 82 42 80 58L78 56L76 50L73 55L70 49L66 54L62 49L58 54L54 49L50 54L47 50L44 56L42 52Z',
  shine: 'M47 35Q53 32 59 32M64 32Q70 33 74 37',
  extra: `<circle cx="40" cy="30" r="9.5" fill="#241a33" stroke="${INK}" stroke-width="1.1"/><circle cx="80" cy="30" r="9.5" fill="#241a33" stroke="${INK}" stroke-width="1.1"/><path d="M35 26Q40 23 45 26M75 26Q80 23 85 26" stroke="#8a6ab8" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M44 36L48 32M76 36L72 32" stroke="#c0392b" stroke-width="2.4"/><circle cx="37.6" cy="70" r="1.6" fill="#ffd27a" stroke="${INK}" stroke-width=".5"/>`,
  extraBack: true,
};

function headband(id) {
  return `<path d="M39.5 46Q60 40 80.5 46L80.5 52.5Q60 46.5 39.5 52.5Z" fill="#2b3a66" ${L}/>
<rect x="49" y="41.8" width="22" height="9.8" rx="1.6" fill="url(#${id}-metal)" ${L}/>
<g stroke="#4a5060" stroke-width=".9" fill="none"><ellipse cx="60" cy="46.7" rx="2.6" ry="3.1"/><path d="M57.4 46.7H62.6M60 42.9V43.6M60 49.8V50.5"/></g>`;
}

function headbandTails() {
  return `<path d="M80 47Q94 44 106 52Q96 49 82 52Z" fill="#2b3a66" ${L}/><path d="M80 50Q92 52 100 62Q90 56 81 54Z" fill="#22305a" ${L}/>`;
}

export function portrait(kind, id) {
  const c = { genin: GENIN, sensei: SENSEI, rival: RIVAL }[kind];
  const back = c.extraBack ? `${c.extra}${hairBack(id, c)}` : hairBack(id, c);
  const top = c.extraBack ? '' : (c.extra ?? '');
  const band = kind === 'genin' ? headband(id) : '';
  const tails = kind === 'genin' ? headbandTails() : '';
  const torso = `<g transform="translate(60 -3) scale(.92 1) translate(-60 0)">${body(id, c)}</g>`;
  return frame(id, c, `${tails}${c.extraBehind ?? ''}${back}${torso}${face(id, c)}${hairFront(c)}${band}${top}`);
}
