import { Camel, Palm, WellSweep } from './desertLife';
import { r1, scatter } from './kit';
import { SkyLights, paint } from './lights';

/**
 * The salt flats: a white plain to the edge of the world, cracked into plates, the sky shining
 * back from its wet patches, a far line of dunes, and the caravan camp behind its wall of salt
 * blocks with its tents, its camels and the last palm over the last sweet well.
 */

const HORIZON = 156;

const PLATES = (() => {
  const next = scatter(91);
  const lines: string[] = [];
  for (let row = 0; row < 7; row += 1) {
    const y = HORIZON + 6 + row * row * 1.9 + row * 3;
    const span = 18 + row * 9;
    for (let x = -10 + next() * span; x < 410; x += span * (0.8 + next() * 0.5)) {
      const h = 3 + row * 1.6;
      lines.push(
        `M${r1(x)} ${r1(y)}l${r1(span * 0.25)} ${r1(h * 0.4)}l${r1(span * 0.5)} ${r1(-h * 0.2)}`,
      );
    }
  }
  return lines.join('');
})();

const BLOCKS = Array.from({ length: 9 }, (_, i) => ({ x: 236 + i * 12, y: 186 - (i % 2) * 2 }));

export function SaltFlats({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-salt`} x2="0" y2="1">
          <stop offset="0" stopColor="#f1ece2" />
          <stop offset="1" stopColor="#d6cbb8" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[96, 54]} sun={[96, 50]} seed={91} starDepth={130} />
      <path
        d={`M0 ${HORIZON}C60 146 120 148 180 152C240 156 320 144 400 150V${HORIZON + 2}H0Z`}
        fill="#d8a86e"
        opacity=".7"
      />
      <rect y={HORIZON} width="400" height={240 - HORIZON} fill={paint(uid, 'salt')} />
      <g fill="#9cc3df" opacity=".35">
        <ellipse cx="90" cy="196" rx="70" ry="6" />
        <ellipse cx="140" cy="222" rx="90" ry="7" />
        <ellipse cx="340" cy="210" rx="50" ry="4" />
      </g>
      <path d={PLATES} stroke="#a89880" strokeOpacity=".55" strokeWidth=".8" fill="none" />
      <path
        d="M60 240C120 226 170 214 214 202"
        stroke="#a89880"
        strokeOpacity=".5"
        strokeDasharray="2 5"
        strokeWidth="2"
        fill="none"
      />
      <g transform="translate(-90 -48) scale(1.25)">
        <g fill="#8a6a4a">
          <path d="M262 186L280 166L298 186Z" />
          <path d="M296 186L310 170L324 186Z" opacity=".85" />
        </g>
        <g fill="#e8dfd0" stroke="#b8a888" strokeWidth=".6">
          {BLOCKS.map((b) => (
            <rect key={b.x} x={b.x} y={b.y} width="11" height="7" />
          ))}
        </g>
        <rect className="bd-lamp" x="276" y="178" width="6" height="8" fill={paint(uid, 'shoji')} />
        <circle className="bd-lit" cx="279" cy="182" r="16" fill={paint(uid, 'glow')} />
        <Palm at={[220, 188]} h={40} lean={-6} />
        <WellSweep at={[206, 188]} />
        <Camel at={[340, 196]} scale={0.9} />
        <Camel at={[366, 200]} scale={0.8} />
      </g>
      <g fill="#ece4d6" stroke="#b0a084" strokeWidth=".7">
        <path d="M24 240V226H52V240Z" />
        <path d="M30 226V214H48V226Z" />
        <path d="M35 214V206H44V214Z" />
      </g>
      <rect className="bd-dusk" width="400" height="240" />
    </>
  );
}
