import { useEffect, useState } from "react";

// Owns the WebSocket lifecycle: connect, auto-reconnect with backoff, clean up on unmount.
// Ops users leave this page open for hours, so reconnect + cleanup matter.
export function useDashboardSocket(token, onAuthFail) {
  const [snap, setSnap] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    let ws, timer, retry = 0, stopped = false;
    const connect = () => {
      const proto = location.protocol === "https:" ? "wss" : "ws";
      ws = new WebSocket(`${proto}://${location.host}/ws/dashboard/?token=${token}`);
      ws.onopen = () => { retry = 0; setStatus("live"); };
      ws.onmessage = (e) => setSnap(JSON.parse(e.data));
      ws.onclose = (e) => {
        if (stopped) return;
        if (e.code === 4401) return onAuthFail(); // bad/expired token
        setStatus("reconnecting");
        timer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 15000));
      };
    };
    connect();
    return () => { stopped = true; clearTimeout(timer); ws && ws.close(); };
  }, [token, onAuthFail]);

  return { snap, status };
}
