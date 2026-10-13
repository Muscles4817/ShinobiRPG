import { animationSetting, type GameAction, type GameContext, type GameState } from '@/game';

interface AnimationToggleProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/** The switch for everyday animations (eating, training, sleeping…) and the screen's motion. */
export function AnimationToggle({ ctx, state, perform }: AnimationToggleProps) {
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
    </section>
  );
}
