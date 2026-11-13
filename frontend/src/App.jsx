import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Snowflake,
  Wind,
} from 'lucide-react';
import MusicPlayer from './components/MusicPlayer.jsx';
import Snowfall from './components/Snowfall.jsx';
import WinterScene from './components/WinterScene.jsx';
import { formatWindDirection, getCondition, getWinterHeadline } from './weather.js';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const FALLBACK_CITY = 'Mumbai';

async function requestJson(path) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('Could not reach the weather service. Check that the backend is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The weather service returned an unexpected response.');
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Something went wrong while loading the weather.');
  }
  return payload;
}

function formatPlace(location) {
  if (!location) return 'Somewhere in the world';
  const parts = [location.name, location.admin1, location.country].filter(Boolean);
  return [...new Set(parts)].join(', ');
}

function ConditionIcon({ kind, size = 21 }) {
  const props = { size, strokeWidth: 1.6, 'aria-hidden': true };
  if (kind === 'snow') return <CloudSnow {...props} />;
  if (kind === 'rain') return <CloudRain {...props} />;
  if (kind === 'fog') return <CloudFog {...props} />;
  if (kind === 'storm') return <CloudLightning {...props} />;
  if (kind === 'clear') return <CloudSun {...props} />;
  if (kind === 'cloud') return <Cloud {...props} />;
  return <CloudDrizzle {...props} />;
}

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Finding your little corner of the sky…');
  const locationRequested = useRef(false);
  
  const loadWeather = useCallback(async (latitude, longitude, fallbackPlace = null) => {
    const payload = await requestJson(`/api/weather?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`);
    const unresolvedName = !payload.location?.name || payload.location.name === 'Your location';
    const resolvedPayload = unresolvedName && fallbackPlace
      ? { ...payload, location: { ...payload.location, name: fallbackPlace.name, admin1: fallbackPlace.admin1 ?? payload.location?.admin1, country: fallbackPlace.country ?? payload.location?.country } }
      : payload;
    setWeather(resolvedPayload);
    setError('');
    setResults([]);
    setSearchMessage('');
    return resolvedPayload;
  }, []);

  const loadFallbackCity = useCallback(async (note = '') => {
    try {
      const geocoded = await requestJson(`/api/geocode?q=${encodeURIComponent(FALLBACK_CITY)}`);
      const place = geocoded.results?.[0];
      if (!place) throw new Error(`We couldn't find ${FALLBACK_CITY}.`);
      await loadWeather(place.latitude, place.longitude, place);
      setStatus(note || `Showing ${FALLBACK_CITY} while location access is unavailable.`);
    } catch (fallbackError) {
      setError(fallbackError.message);
      setStatus('The sky is taking a moment to appear.');
    } finally {
      setLoading(false);
    }
  }, [loadWeather]);

  useEffect(() => {
    if (locationRequested.current) return;
    locationRequested.current = true;

    if (!('geolocation' in navigator)) {
      loadFallbackCity(`Location isn't supported here — showing ${FALLBACK_CITY}.`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await loadWeather(coords.latitude, coords.longitude);
          setStatus('Using your current location.');
        } catch (locationError) {
          setError(locationError.message);
          await loadFallbackCity(`Couldn't load your location — showing ${FALLBACK_CITY}.`);
        } finally {
          setLoading(false);
        }
      },
      () => loadFallbackCity(`Location access is off — showing ${FALLBACK_CITY}.`),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 10 * 60 * 1000 },
    );
  }, [loadFallbackCity, loadWeather]);

  const condition = useMemo(() => weather ? getCondition(weather.current.weatherCode) : ['Waiting for the weather', 'cloud'], [weather]);
  const headline = useMemo(() => weather ? getWinterHeadline(weather.current.temperature) : null, [weather]);
  const placeLabel = formatPlace(weather?.location);

  async function handleSearch(event) {
    event.preventDefault();
    const searchTerm = query.trim();
    if (searchTerm.length < 2) {
      setSearchMessage('Type at least two letters to search.');
      setResults([]);
      return;
    }

    setSearching(true);
    setSearchMessage('Looking for that place…');
    setResults([]);
    try {
      const payload = await requestJson(`/api/geocode?q=${encodeURIComponent(searchTerm)}`);
      if (!payload.results?.length) {
        setSearchMessage(`No places found for “${searchTerm}”. Try another spelling.`);
      } else {
        setResults(payload.results);
        setSearchMessage(`${payload.results.length} places found`);
      }
    } catch (searchError) {
      setSearchMessage(searchError.message);
    } finally {
      setSearching(false);
    }
  }

  async function choosePlace(place) {
    setLoading(true);
    setError('');
    setStatus(`Following the snow to ${place.name}…`);
    setQuery('');
    setResults([]);
    setSearchMessage('');
    try {
      await loadWeather(place.latitude, place.longitude, place);
      setStatus('A fresh forecast, just for this place.');
    } catch (weatherError) {
      setError(weatherError.message);
      setStatus('We couldn’t reach that forecast.');
    } finally {
      setLoading(false);
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus(`Location isn't supported — showing ${FALLBACK_CITY}.`);
      return;
    }
    setLoading(true);
    setError('');
    setStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await loadWeather(coords.latitude, coords.longitude);
          setStatus('Using your current location.');
        } catch (locationError) {
          setError(locationError.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setStatus('Location access was not granted. Search for a city instead.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60 * 1000 },
    );
  }

  const current = weather?.current;
  const temperature = Number.isFinite(current?.temperature) ? Math.round(current.temperature) : null;
  const feelsLike = Number.isFinite(current?.feelsLike) ? Math.round(current.feelsLike) : null;

  return (
    <div className="app-shell">
      <Snowfall
        snowfall={current?.snowfall ?? 0}
        precipitation={current?.precipitation ?? 0}
        windSpeed={current?.windSpeed ?? 0}
        windDirection={current?.windDirection ?? 0}
        weatherCode={current?.weatherCode ?? 0}
      />
      <div className="ambient-glow" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#home" aria-label="Winter Is Coming home">
          <span className="brand-mark"><Snowflake size={20} strokeWidth={1.6} /></span>
          <span>WINTER <i>IS</i> COMING</span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> A WEATHER TALE</div>
      </header>

      <main id="home" className="main-content">
        <section className="search-area" aria-label="Find a place">
          <form className="search-form" onSubmit={handleSearch} role="search">
            <Search size={17} strokeWidth={1.7} aria-hidden="true" />
            <label className="visually-hidden" htmlFor="place-search">Search for a city or place</label>
            <input
              id="place-search"
              type="search"
              placeholder="Find a city or a quiet corner…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              aria-controls="place-results"
              aria-expanded={results.length > 0}
            />
            <button type="submit" className="search-submit" disabled={searching} aria-label="Search places">
              {searching ? <span className="small-loader" /> : 'Find'}
            </button>
          </form>
          <button className="location-button" type="button" onClick={useMyLocation} disabled={loading}>
            <Compass size={15} strokeWidth={1.7} /> <span>Use my location</span>
          </button>
          {(results.length > 0 || searchMessage) && (
            <div className="search-popover" id="place-results" aria-live="polite">
              {results.length > 0 ? results.map((place) => (
                <button className="place-result" type="button" key={`${place.id}-${place.latitude}-${place.longitude}`} onClick={() => choosePlace(place)}>
                  <MapPin size={15} aria-hidden="true" />
                  <span><strong>{place.name}</strong><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small></span>
                  <span className="result-arrow" aria-hidden="true">↗</span>
                </button>
              )) : <p className="search-message">{searchMessage}</p>}
            </div>
          )}
        </section>

        <section className="hero-stage" aria-label="Current weather">
          <div className="hero-copy">
            <div className="place-kicker">
              <span className="kicker-line" />
              <span>{weather ? 'THE SKY ABOVE' : 'A MOMENT WITH THE SKY'}</span>
            </div>
            <div className="place-name" aria-live="polite">{placeLabel}</div>

            <h1>
              Winter is<br />
              <span className="headline-phrase">{headline?.phrase || (loading ? 'arriving…' : 'waiting.')}</span>
            </h1>
            <p className="hero-description">
              {headline?.detail || (loading ? 'Gathering the clouds, the breeze, and a little wonder.' : 'The forecast will find its way here.')}
            </p>

            <div className="temperature-block" aria-live="polite" aria-atomic="true">
              <div className="temperature-value">{temperature === null ? '—' : temperature}<span>°C</span></div>
              <div className="temperature-context">
                <div className="condition-line"><ConditionIcon kind={condition[1]} size={23} /><strong>{condition[0]}</strong></div>
                <span>Feels like {feelsLike === null ? '—' : `${feelsLike}°C`}</span>
              </div>
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <Wind size={17} strokeWidth={1.5} aria-hidden="true" />
                <div><span className="detail-label">WIND</span><strong>{current ? `${Math.round(current.windSpeed)} km/h` : '—'}</strong><small>{current ? `${formatWindDirection(current.windDirection)} breeze` : 'Waiting'}</small></div>
              </div>
              <div className="detail-divider" />
              <div className="detail-item">
                <CloudSnow size={17} strokeWidth={1.5} aria-hidden="true" />
                <div><span className="detail-label">SNOWFALL</span><strong>{current ? `${Number(current.snowfall).toFixed(1)} cm` : '—'}</strong><small>Current hour</small></div>
              </div>
              <div className="detail-divider" />
              <div className="detail-item">
                <span className="humidity-icon" aria-hidden="true">◌</span>
                <div><span className="detail-label">HUMIDITY</span><strong>{current ? `${Math.round(current.humidity)}%` : '—'}</strong><small>In the air</small></div>
              </div>
            </div>

            <div className="weather-status" role="status" aria-live="polite">
              {loading ? <span className="status-pulse" /> : <span className="status-dot" />}
              <span>{status}</span>
            </div>
            {error && (
              <div className="error-state" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => { setLoading(true); loadFallbackCity(); }}><RefreshCw size={14} /> Try again</button>
              </div>
            )}
          </div>
          <WinterScene />
          <div className="scene-caption" aria-hidden="true">A QUIETER KIND OF FORECAST <span>✳</span></div>
        </section>

        <footer className="bottom-area">
          <div className="bottom-rule" />
          <MusicPlayer />
          <div className="footer-note">
            <span>MADE FOR SLOWER MOMENTS</span>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OPENSTREETMAP CONTRIBUTORS</a>
            <span>WEATHER DATA · OPEN-METEO</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
