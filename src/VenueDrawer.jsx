import { useEffect, useState } from "react";

const money = (n) =>
  Number(n).toLocaleString(undefined, { style: "currency", currency: "USD" });

// Drill-down: reads pre-aggregated rows, so it's a tiny query. Refreshes every 5s while open.
export default function VenueDrawer({ code, token, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    const load = () =>
      fetch(`/api/venues/${code}/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then((r) => r.json())
        .then((d) => alive && setData(d))
        .catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [code, token]);

  return (
    <>
      {/* Clicking overlay closes the drawer */}
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-header">
          <div>
            <h2>{data ? data.name : code}</h2>
            {data && <p>Venue detail — refreshes every 5 s</p>}
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {!data ? (
            <div className="drawer-loading">
              <div className="spinner" />
              Loading…
            </div>
          ) : (
            <>
              <p className="drawer-section-title">Hourly trade today</p>
              {data.hourly.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 13 }}>No transactions yet.</p>
              ) : (
                <table className="hourly-table">
                  <thead>
                    <tr>
                      <th>Hour</th>
                      <th className="right">Net sales</th>
                      <th className="right">Txns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hourly.map((h) => (
                      <tr key={h.hour}>
                        <td>{new Date(h.hour).getHours()}:00</td>
                        <td className="right net-sales">{money(h.net_sales)}</td>
                        <td className="right">{h.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <p className="drawer-section-title" style={{ marginTop: 24 }}>
                What's selling today
              </p>
              {data.top_items.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 13 }}>No items yet.</p>
              ) : (
                <ol className="drawer-items-list">
                  {data.top_items.map((t, i) => (
                    <li key={t.item_name}>
                      <span className="drawer-item-rank">{i + 1}</span>
                      <span className="drawer-item-name">{t.item_name}</span>
                      <span className="drawer-item-qty">{t.qty}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
