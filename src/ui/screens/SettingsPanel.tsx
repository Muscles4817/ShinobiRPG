import {
  animationSetting,
  mapStyleOptions,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

interface SettingsPanelProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/**
 * The settings on the Shinobi tab: the switch for everyday animations (eating, training,
 * sleeping…) and how the Travel map is inked.
 */
export function SettingsPanel({ ctx, state, perform }: SettingsPanelProps) {
  const setting = animationSetting(state, ctx);
  return (
    <section className="settings" aria-label="Settings">
      <h3 className="settings-heading">Settings</h3>
      <button
        type="button"
        className={setting.on ? 'style-option on' : 'style-option'}
        aria-pressed={setting.on}
        disabled={setting.blocker !== null}
        onClick={() => {
          perform(setting.action);
        }}
      >
        <b>Animations {setting.on ? 'on' : 'off'}</b>
        <small>
          {setting.on
            ? 'Small moments for eating, cooking, training, studying, healing and sleep.'
            : 'The screen holds still. Tap to bring the small moments back.'}
        </small>
      </button>
      <MapStylePicker ctx={ctx} state={state} perform={perform} />
    </section>
  );
}

/** The three ways to ink the Travel map; the one in use is marked. */
function MapStylePicker({ ctx, state, perform }: SettingsPanelProps) {
  return (
    <div className="map-styles" role="group" aria-label="Map style">
      <h4 className="settings-subheading">Map style</h4>
      {mapStyleOptions(state, ctx).map((o) => (
        <button
          key={o.style}
          type="button"
          className={o.on ? 'style-option on' : 'style-option'}
          aria-pressed={o.on}
          disabled={o.blocker !== null && !o.on}
          onClick={() => {
            if (o.blocker === null) perform(o.action);
          }}
        >
          <b>{o.name}</b>
          <small>{o.blurb}</small>
        </button>
      ))}
    </div>
  );
}
