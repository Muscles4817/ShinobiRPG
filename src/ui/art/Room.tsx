import type { TimeSlot } from '@/game';

const WINDOW_SKY: Readonly<Record<TimeSlot, string>> = {
  morning: '#e8b483',
  afternoon: '#8fbfe6',
  evening: '#c4664a',
  night: '#1d1840',
};

/** Your room, drawn flat. The window shows the time of day. */
export function Room({ slot }: { readonly slot: TimeSlot }) {
  const night = slot === 'night' || slot === 'evening';
  return (
    <svg
      className="room-art"
      viewBox="0 0 300 250"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="300" height="250" fill="#2a2032" />
      <rect y="168" width="300" height="82" fill="#4a3424" />
      <path d="M0 190h300M0 214h300M0 238h300" stroke="#3a2818" strokeWidth="2" />
      <rect
        x="186"
        y="34"
        width="84"
        height="74"
        rx="3"
        fill={WINDOW_SKY[slot]}
        stroke="#5a3c25"
        strokeWidth="5"
      />
      <path d="M228 34v74M186 71h84" stroke="#5a3c25" strokeWidth="3" />
      <circle cx="250" cy="54" r="9" fill={night ? '#ffe9c2' : '#fff4d6'} />
      {night && <rect className="lamp" x="205" y="84" width="6" height="8" rx="2" />}
      <rect x="20" y="40" width="70" height="26" fill="#3a2a1c" />
      <rect x="38" y="22" width="34" height="18" fill="#5a3c25" />
      <circle cx="55" cy="31" r="5" fill="#ffb45e" opacity=".8" />
      <rect x="16" y="176" width="150" height="40" rx="6" fill="#d9cbb0" />
      <rect x="16" y="176" width="44" height="40" rx="6" fill="#efe6d2" />
      <rect x="60" y="180" width="102" height="34" rx="4" fill="#5a6fa8" />
      <rect x="186" y="186" width="70" height="10" rx="2" fill="#6b4a2e" />
      <rect x="192" y="196" width="6" height="22" fill="#5a3c25" />
      <rect x="244" y="196" width="6" height="22" fill="#5a3c25" />
      <path d="M206 186v-12a8 8 0 0 1 16 0v12" fill="#2a2a2a" />
      <rect x="252" y="138" width="40" height="34" rx="3" fill="#6b4a2e" />
      <rect x="252" y="150" width="40" height="3" fill="#3a2818" />
      <rect x="268" y="146" width="8" height="8" rx="1" fill="#c9a24a" />
    </svg>
  );
}
