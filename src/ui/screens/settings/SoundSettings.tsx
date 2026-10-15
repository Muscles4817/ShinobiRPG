import { MAX_VOLUME, VOLUME_STEP, clampVolume, type AudioSettings, type Sound } from '@/game';

import { useSound } from '../../audio/SoundProvider';

interface VolumeProps {
  readonly label: string;
  readonly blurb: string;
  readonly value: number;
  readonly disabled: boolean;
  readonly onChange: (volume: number) => void;
}

function volumeWord(volume: number): string {
  return volume === 0 ? 'Silent' : `${volume}%`;
}

function Volume({ label, blurb, value, disabled, onChange }: VolumeProps) {
  return (
    <label className="volume">
      <span className="volume-head">
        <b>{label}</b>
        <output>{volumeWord(value)}</output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={0}
        max={MAX_VOLUME}
        step={VOLUME_STEP}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(clampVolume(Number(event.target.value)));
        }}
      />
      <small>{blurb}</small>
    </label>
  );
}

/** The sound to hear when a level is set, so you know what you chose. */
const SAMPLE: Sound = 'bond';

/** The master switch and the two volumes. They belong to this device, not to a save. */
export function SoundSettings() {
  const { settings, change, play } = useSound();
  const set = (next: Partial<AudioSettings>) => {
    change({ ...settings, ...next });
  };
  return (
    <section className="settings" aria-label="Sound">
      <h3 className="settings-heading">Sound</h3>
      <button
        type="button"
        className={settings.sound ? 'style-option on' : 'style-option'}
        aria-pressed={settings.sound}
        onClick={() => {
          set({ sound: !settings.sound });
        }}
      >
        <b>Sound {settings.sound ? 'on' : 'off'}</b>
        <small>
          {settings.sound
            ? 'Koto, flute and drums: music for where you are, and a sound for what you do.'
            : 'The game is silent. Tap to bring the sound back.'}
        </small>
      </button>
      <Volume
        label="Effects"
        blurb="Taps, everyday moments and the blows of a fight."
        value={settings.effectsVolume}
        disabled={!settings.sound}
        onChange={(effectsVolume) => {
          set({ effectsVolume });
          play(SAMPLE);
        }}
      />
      <Volume
        label="Music"
        blurb="Loops for the village by day and night, festivals, the road and fights."
        value={settings.musicVolume}
        disabled={!settings.sound}
        onChange={(musicVolume) => {
          set({ musicVolume });
        }}
      />
      <p className="muted small">Kept on this device, for every save.</p>
    </section>
  );
}
