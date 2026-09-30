const money = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const TYPE_BADGE = {
  pub:            { label: "Pub",            cls: "badge-pub" },
  restaurant:     { label: "Restaurant",     cls: "badge-restaurant" },
  function_space: { label: "Function Space", cls: "badge-function_space" },
};

const ALERT_META = {
  sales_drop:  { label: "Sales drop",       cls: "sales-drop" },
  void_spike:  { label: "Void / refund ↑",  cls: "void-spike" },
};

export default function Dashboard({ snap, onSelect }) {
  if (!snap)
    return (
      <div className="connecting">
        <div className="spinner" />
        Connecting to live feed…
      </div>
    );

  return (
    <div className="dashboard-grid">
      {/* Venue ranked list  */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-header headline">{money(snap.group_total)}</div>
            <h2>Group net sales today</h2>
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {snap.venues.length} venues
          </span>
        </div>
        <div className="card-body">
          <table className="venue-table">
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Venue</th>
                <th>Type</th>
                <th className="right">Net sales</th>
                <th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {snap.venues.map((v, i) => {
                const badge = TYPE_BADGE[v.venue_type] ?? { label: v.venue_type, cls: "" };
                return (
                  <tr
                    key={v.code}
                    className={v.alerts.length ? "has-alert" : ""}
                    onClick={() => onSelect(v.code)}
                  >
                    <td className="rank">{i + 1}</td>
                    <td className="venue-name">{v.name}</td>
                    <td>
                      <span className={`venue-type-badge ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="right sales-value">{money(v.sales_today)}</td>
                    <td>
                      {v.alerts.length > 0 && (
                        <div className="alert-list">
                          {v.alerts.map((a) => {
                            const m = ALERT_META[a] ?? { label: a, cls: "" };
                            return (
                              <span key={a} className={`alert-badge ${m.cls}`}>
                                ⚠ {m.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top items panel */}
      <div className="card">
        <div className="card-header">
          <h2>Top items — group</h2>
        </div>
        <div className="card-body">
          {snap.top_items.length === 0 ? (
            <div style={{ padding: "20px", color: "#9ca3af", fontSize: 13 }}>
              No sales yet today.
            </div>
          ) : (
            <ol className="items-list">
              {snap.top_items.map((t, i) => (
                <li key={t.item_name}>
                  <span className="item-rank">{i + 1}</span>
                  <span className="item-name">{t.item_name}</span>
                  <span className="item-qty">{t.qty}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
