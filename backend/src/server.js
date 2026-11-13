import 'dotenv/config';
import express from 'express';
import { getForecast, searchPlaces } from './services/openMeteo.js';
import { reverseGeocode } from './services/nominatim.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: {
        code: 'ORIGIN_NOT_ALLOWED',
        message: 'This origin is not allowed to access the weather service.',
      },
    });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'winter-is-coming-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/geocode', async (req, res, next) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (query.length < 2 || query.length > 100) {
    return res.status(400).json({
      error: {
        code: 'INVALID_QUERY',
        message: 'Enter a city or place name between 2 and 100 characters.',
      },
    });
  }

  try {
    const results = await searchPlaces(query);
    res.json({ query, results });
  } catch (error) {
    next(error);
  }
});

function parseCoordinate(value, minimum, maximum) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const normalized = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number >= minimum && number <= maximum ? number : null;
}

app.get('/api/weather', async (req, res, next) => {
  const latitude = parseCoordinate(req.query.lat, -90, 90);
  const longitude = parseCoordinate(req.query.lon, -180, 180);

  if (latitude === null || longitude === null) {
    return res.status(400).json({
      error: {
        code: 'INVALID_COORDINATES',
        message: 'Provide valid latitude and longitude values (lat: -90 to 90, lon: -180 to 180).',
      },
    });
  }

  try {
    const forecastPromise = getForecast(latitude, longitude);
    // Nominatim is best-effort: weather remains usable if reverse geocoding is unavailable.
    const placePromise = reverseGeocode(latitude, longitude).catch(() => null);
    const [forecast, place] = await Promise.all([forecastPromise, placePromise]);
    const current = forecast.current;

    res.json({
      location: {
        name: place?.name || 'Your location',
        admin1: place?.admin1 ?? null,
        country: place?.country ?? null,
        displayName: place?.displayName ?? null,
        latitude: forecast.latitude,
        longitude: forecast.longitude,
      },
      current: {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        isDay: Boolean(current.is_day),
        precipitation: current.precipitation ?? 0,
        snowfall: current.snowfall ?? 0,
        weatherCode: current.weather_code,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        time: current.time,
      },
      units: forecast.current_units ?? {},
      timezone: forecast.timezone,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `No route found for ${req.method} ${req.path}.`,
    },
  });
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = status >= 500 && !error.code
    ? 'Something went wrong. Please try again.'
    : error.message;

  if (status >= 500) console.error(`[${code}]`, error.message);
  res.status(status).json({ error: { code, message } });
});

app.listen(port, () => {
  console.log(`Winter Is Coming API listening on http://localhost:${port}`);
  console.log(`Allowed frontend origin(s): ${allowedOrigins.join(', ')}`);
});
