import "./index.css";
import { useCallback, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import VenueDrawer from "./VenueDrawer.jsx";
import { useDashboardSocket } from "./useDashboardSocket.js";

function Login({ onToken }) {
  const [u, setU] = useState("ops");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      if (r.ok) onToken((await r.json()).token);
      else setErr("Invalid credentials — please try again.");
    } catch {
      setErr("Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Ops Dashboard</h1>
        <p>Sign in to view live group trade</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="ops"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div className="login-error">{err}</div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Authed({ token, onLogout }) {
  const { snap, status } = useDashboardSocket(token, onLogout);
  const [selected, setSelected] = useState(null);

  return (
    <>
      <header className="topbar">
        <span className="topbar-brand">
          Ops<span>Dashboard</span>
        </span>
        <div className="topbar-right">
          <div className="status-badge">
            <span className={`status-dot${status !== "live" ? " reconnecting" : ""}`} />
            {status === "live" ? "Live" : status}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="main-content">
        <Dashboard snap={snap} onSelect={setSelected} />
      </main>
      {selected && (
        <VenueDrawer code={selected} token={token} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  if (!token)
    return (
      <Login
        onToken={(t) => {
          localStorage.setItem("token", t);
          setToken(t);
        }}
      />
    );
  return <Authed token={token} onLogout={logout} />;
}
