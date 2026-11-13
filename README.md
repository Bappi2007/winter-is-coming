# Winter Is Coming ❄️

A responsive, winter-atmosphere weather web app. The project is deliberately split into two independent applications:

- `backend/` — Node.js 18+, Express, ES modules. Proxies Open-Meteo forecast/geocoding and OpenStreetMap Nominatim reverse geocoding.
- `frontend/` — React + Vite. Renders the weather experience, location search, animated snowfall, hand-built SVG scene, and an opt-in local audio player.

No API key is required. No copyrighted audio is included.

## Features

- Requests browser geolocation. When permission is unavailable or denied, it loads **Mumbai, India** as the fallback and keeps city search available.
- Searches place names with Open-Meteo Geocoding and reverse-geocodes coordinates with Nominatim.
- Shows current temperature, feels-like temperature, weather condition, wind, snowfall (centimeters), and humidity.
- Changes the headline based on temperature: `here` (≤ 4°C), `coming` (5–15°C), or `on its way` (> 15°C).
- Snowfall canvas density responds to snowfall/precipitation and drift responds to wind speed/direction.
- Includes a hand-crafted SVG landscape; the lantern is its single deliberate decorative flicker.
- Plays a user-selected local audio file only after a user clicks Play. The Spotify link opens a search for “Snowman” by Sia; Spotify playback is handled by Spotify.
- Includes keyboard focus styling, accessible labels/status messages, responsive layouts, and `prefers-reduced-motion` support.
- Backend responses are cached in memory for 10 minutes. Nominatim requests are serialized with at least 1.1 seconds between uncached requests.

## Requirements

- Node.js 18 or newer
- npm 9 or newer (npm bundled with a current Node.js release is fine)
- A modern browser; allow location access for local development if you want the app to use your current coordinates

## 1. Configure and run the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API starts at `http://localhost:4000` by default.

Backend environment variables (`backend/.env`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | Express server port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Exact allowed frontend origin(s). Multiple origins may be comma-separated. |
| `NOMINATIM_REVERSE_URL` | `https://nominatim.openstreetmap.org/reverse` | Reverse-geocoding endpoint; can be switched to another compatible provider. |
| `NOMINATIM_USER_AGENT` | `WinterIsComing/1.0 (weather web app)` | Identifies the reverse-geocoding client. |
| `NOMINATIM_CONTACT` | empty | Optional contact address sent in the `From` header. |

Keep the value in `CLIENT_ORIGIN` aligned with the actual deployed frontend origin. Do not use `*` for production.

## 2. Configure and run the frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

Frontend environment variables (`frontend/.env`):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000` | Base URL of the separately running Express API |

The frontend and backend have their own package files, dependency trees, environment files, and run commands. They are not a monorepo workspace and can be deployed independently.

## API reference

All successful responses are JSON. Errors use this shape:

```json
{
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "A readable explanation of the problem."
  }
}
```

### `GET /api/health`

Returns service status and a timestamp.

### `GET /api/weather?lat={latitude}&lon={longitude}`

Validates latitude (`-90` to `90`) and longitude (`-180` to `180`), fetches Open-Meteo current conditions, and best-effort reverse-geocodes the coordinates through Nominatim.

Example:

```bash
curl "http://localhost:4000/api/weather?lat=19.0760&lon=72.8777"
```

### `GET /api/geocode?q={place}`

Accepts a trimmed place query between 2 and 100 characters and returns up to eight Open-Meteo geocoding matches.

Example:

```bash
curl "http://localhost:4000/api/geocode?q=Mumbai"
```

## Music and copyright

The app does not contain, download, or stream Sia’s recording. Select a legally obtained local audio file with **Add file** to play it in the browser, or open the Spotify search link to listen through Spotify. Playback is never started automatically.

## Data providers

- Weather forecast and city search: [Open-Meteo](https://open-meteo.com/)
- Reverse geocoding and place labels: [OpenStreetMap Nominatim](https://nominatim.org/)
- Place-data attribution: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

The backend caches requests for 10 minutes. The public Nominatim service has a strict [usage policy](https://operations.osmfoundation.org/policies/nominatim/): a maximum of one request per second per application, an identifying User-Agent or Referer, attribution, and no autocomplete/search-as-you-type against Nominatim. This app uses Open-Meteo for city search, caches reverse lookups, serializes uncached Nominatim calls at a minimum 1.1-second interval, and displays OpenStreetMap attribution in the footer. Review the policy before deployment; for higher traffic, switch to a suitable hosted provider or your own Nominatim instance.

## Production build

Build the frontend independently:

```bash
cd frontend
npm run build
npm run preview
```

Deploy the generated `frontend/dist/` directory to a static host and deploy `backend/` as a Node service. Set `VITE_API_BASE_URL` at frontend build time and set `CLIENT_ORIGIN` on the backend to the exact deployed frontend origin.

## Tests

The backend includes Node's built-in test runner for cache expiry behavior and duplicate-request coalescing:

```bash
cd backend
npm test
```
