import type { CombatOption } from '@/game';

type Pick = (option: CombatOption) => void;

/**
 * Who plans this round (`docs/design/combat-ai-plan.md` Part 9): one switch over the same plan.
 * Your list, plan then edit, or orders; at orders, the order you give and the cards the mind
 * must never reach for; and the plan's one-press actions (ask for a plan, hand the list back).
 */

function Levels({
  levels,
  onPick,
}: {
  readonly levels: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  return (
    <div className="who-levels" role="radiogroup" aria-label="Who plans this round">
      {levels.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.selected === true}
          className={`who-level${o.selected ? ' on' : ''}`}
          onClick={() => {
            if (!o.selected) onPick(o);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Orders({
  orders,
  onPick,
}: {
  readonly orders: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  const current = orders.find((o) => o.selected) ?? orders[0];
  if (!current) return null;
  return (
    <label className="plan-setting who-order">
      <span>Your order</span>
      <select
        aria-label="Your order"
        value={current.id}
        onChange={(event) => {
          const chosen = orders.find((o) => o.id === event.target.value);
          if (chosen) onPick(chosen);
        }}
      >
        {orders.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <small>{current.detail}</small>
    </label>
  );
}

function Forbids({
  forbids,
  onPick,
}: {
  readonly forbids: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  const forbidden = forbids.filter((o) => o.selected).length;
  return (
    <details className="who-forbid">
      <summary>{forbidden > 0 ? `Never use (${String(forbidden)})` : 'Never use'}</summary>
      <div className="who-chips">
        {forbids.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`who-chip${o.selected ? ' on' : ''}`}
            aria-pressed={o.selected === true}
            onClick={() => {
              onPick(o);
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export function WhoPlans({
  options,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  const levels = options.filter((o) => o.planning === 'level');
  if (levels.length === 0) return null;
  const level = levels.find((o) => o.selected);
  const orders = options.filter((o) => o.planning === 'order');
  const forbids = options.filter((o) => o.planning === 'forbid');
  const asks = options.filter((o) => o.planning === 'ask');
  return (
    <section className="who-plans" aria-label="Who plans this round">
      <h3 className="plan-heading">Who plans this round</h3>
      <Levels levels={levels} onPick={onPick} />
      {level && <p className="muted small">{level.detail}</p>}
      {orders.length > 0 && <Orders orders={orders} onPick={onPick} />}
      {forbids.length > 0 && <Forbids forbids={forbids} onPick={onPick} />}
      {asks.length > 0 && (
        <div className="who-asks">
          {asks.map((o) => (
            <button
              key={o.id}
              type="button"
              className="btn ghost small"
              title={o.detail}
              onClick={() => {
                onPick(o);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
