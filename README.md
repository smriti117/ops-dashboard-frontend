# Ops Dashboard — Frontend

React frontend for the hospitality group ops dashboard. Connects to the backend over WebSocket for live updates and renders group-wide trade data across 40 venues in real time.

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Vanilla CSS (`src/index.css`) |
| Real-time | Native browser `WebSocket` API |
| HTTP | Native `fetch` API |
| No UI library | No Tailwind, no MUI, no component library |

---

## Project Structure

```
frontend/
├── index.html              # Entry point — loads Inter font, mounts React
├── vite.config.js          # Dev server + proxy config
├── package.json
└── src/
    ├── main.jsx            # React root mount
    ├── index.css           # All styles — design tokens, layout, components
    ├── App.jsx             # Root component — login gate + authenticated shell
    ├── Dashboard.jsx       # Main view — ranked venue table + top items panel
    ├── VenueDrawer.jsx     # Slide-in panel — hourly trade + items for one venue
    └── useDashboardSocket.js  # Custom hook — WebSocket lifecycle management
```

---

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend running on `http://localhost:8000` (see `backend/README.md`)

### Install and run

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

Login with: `ops` / `ops12345` (created by `seed_demo` on the backend)

---

## How It Works

### Authentication flow

1. User enters credentials on the login screen
2. `POST /api/auth/login/` returns a token
3. Token is stored in `localStorage`
4. All subsequent requests include `Authorization: Token <token>`
5. The WebSocket connection passes the token as a query parameter: `?token=<token>`
6. If the server closes the WebSocket with code `4401`, the user is logged out

### Real-time data flow

```
Backend WebSocket (ws://localhost:8000/ws/dashboard/)
        │
        │  pushes fresh snapshot every 2 seconds
        ▼
useDashboardSocket (custom hook)
        │
        │  setSnap(data)
        ▼
Dashboard component re-renders
        │
        ├── Venue ranked table (sorted by net sales, high → low)
        ├── Alert badges on rows with issues
        └── Top items panel (group-wide)
```

### Venue drill-down

Clicking any venue row opens `VenueDrawer`, which:
- Fetches `GET /api/venues/<code>/` immediately on open
- Polls every **5 seconds** while open (simple REST, not WebSocket)
- Shows hourly trade breakdown and top selling items for today
- Closes on the ✕ button or clicking the background overlay

---

## Components

### `App.jsx`

Root component. Manages the login/authenticated split:
- If no token in `localStorage` → render `<Login />`
- If token exists → render `<Authed />` with the topbar and main content
- Logout clears `localStorage` and resets state

### `Dashboard.jsx`

The main panel. Receives `snap` (snapshot data) as a prop and renders:
- **Group total** — sum of net sales across all venues today
- **Venue table** — ranked list with venue type badge and alert badges per row
- **Top items panel** — 10 most-sold items across the group today

Alert types shown:
| Badge | Meaning |
|---|---|
| `⚠ Sales drop` | Last hour < 50% of recent hourly average |
| `⚠ Void / refund ↑` | Void + refund rate > 15% of transactions |

Venue type colour coding:
| Badge | Type |
|---|---|
| Purple | Pub |
| Green | Restaurant |
| Blue | Function Space |

### `VenueDrawer.jsx`

Slide-in side panel for per-venue detail. Renders:
- Hourly net sales and transaction count for every hour traded today
- Top 10 selling items by quantity at that venue

Cleans up the polling interval and marks itself as dead on unmount so no state updates fire after close.

### `useDashboardSocket.js`

Custom hook that owns the full WebSocket lifecycle:

```js
const { snap, status } = useDashboardSocket(token, onAuthFail);
```

- `snap` — latest snapshot object from the server (`null` while connecting)
- `status` — `"connecting"` | `"live"` | `"reconnecting"`

**Reconnect logic:** exponential backoff — retries at 1s, 2s, 4s, 8s, 15s, 15s, … Resets on successful connection. Ops users leave this tab open for hours, so silent disconnects must be recovered automatically.

**Auth failure:** if the server closes with code `4401` (bad/expired token), `onAuthFail()` is called instead of reconnecting — this logs the user out.

**Cleanup:** the hook closes the WebSocket and cancels any pending reconnect timer when the component unmounts.

---

## Dev Proxy

`vite.config.js` proxies API and WebSocket calls to the backend so there is no CORS configuration needed:

```js
server: {
  proxy: {
    "/api": "http://localhost:8000",
    "/ws":  { target: "ws://localhost:8000", ws: true }
  }
}
```

In production, your web server (nginx, etc.) would handle this proxying instead.

---

## Build for Production

```bash
npm run build
```

Output goes to `frontend/dist/`. Serve it with any static file server or configure nginx to serve `dist/` and proxy `/api` and `/ws` to the Django backend.
