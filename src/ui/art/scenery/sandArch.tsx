import { r1, scatter } from './kit';
import { Campfire, SkyLights } from './lights';

/**
 * The outer sands: great dunes one behind another with their crests lit and their lee sides in
 * shadow, a stone arch the wind has worn through standing out of them, sand streaming off the
 * crests, bleached bones half buried, and a grey glitter far off where the tainted belt begins.
 */

const DUNES = [
  {
    d: 'M-10 170Q60 140 130 162Q190 150 260 166Q330 146 410 160V240H-10Z',
    fill: '#c99c66',
    shade: '#a87a4c',
  },
  {
    d: 'M-10 196Q80 164 170 192Q250 176 300 196Q360 178 410 190V240H-10Z',
    fill: '#d8aa70',
    shade: '#b0814f',
  },
  { d: 'M-10 224Q100 196 210 222Q300 204 410 220V240H-10Z', fill: '#e2b57a', shade: '#bb8a56' },
] as const;

const GLITTER = (() => {
  const next = scatter(181);
  return Array.from({ length: 24 }, () => ({ x: r1(next() * 400), y: r1(143 + next() * 6) }));
})();

function Arch() {
  return (
    <g>
      <path
        d="M260 190V148Q264 126 290 122Q318 120 326 142V190H314V154Q310 138 292 138Q276 140 272 158V190Z"
        fill="#9a6440"
      />
      <path d="M290 122Q318 120 326 142V190H316V148Q314 132 296 130Z" fill="#7a4a30" opacity=".6" />
    </g>
  );
}

export function SandArch({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[110, 50]} sun={[120, 56]} seed={181} starDepth={120} />
      <path d="M-10 152Q100 142 200 148Q300 142 410 148V240H-10Z" fill="#8f8a84" />
      <g fill="#e6eef8" opacity=".5">
        {GLITTER.map((g) => (
          <circle key={`${g.x}-${g.y}`} cx={g.x} cy={g.y} r=".7" />
        ))}
      </g>
      {DUNES.map((dune, i) => (
        <g key={dune.d}>
          <path d={dune.d} fill={dune.fill} />
          <path d={dune.d} fill={dune.shade} opacity=".35" transform="translate(30 6)" />
          {i === 1 && <Arch />}
        </g>
      ))}
      <path d="M-10 240V200Q60 176 150 196Q200 210 240 240Z" fill="#e8bd84" />
      <path d="M150 196Q200 210 240 240H120Q140 220 150 196Z" fill="#a67448" opacity=".55" />
      <path d="M250 240Q300 206 360 200Q390 198 410 204V240Z" fill="#dcae74" />
      <path d="M360 200Q330 214 320 240H250Q300 206 360 200Z" fill="#a67448" opacity=".45" />
      <g stroke="#f4dcb0" strokeOpacity=".5" fill="none">
        <path d="M130 162q14 -6 30 -4M260 166q16 -6 34 -6M170 192q12 -5 26 -4" />
      </g>
      <g fill="#efe6d4">
        <path d="M60 222q6 -4 12 0q-2 3 -6 3q-4 0 -6 -3z" />
        <path d="M76 224h10M80 220v8M88 225h8" stroke="#efe6d4" strokeWidth="1.4" />
      </g>
      <rect className="bd-dusk" width="400" height="240" />
      <Campfire uid={uid} at={[293, 190]} size={0.8} />
    </>
  );
}
