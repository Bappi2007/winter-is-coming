import { cachedRequest } from './cache.js';
import { fetchJson, UpstreamError } from './http.js';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function getForecast(latitude, longitude) {
  const lat = Number(latitude.toFixed(4));
  const lon = Number(longitude.toFixed(4));
  const key = `forecast:${lat}:${lon}`;

  return cachedRequest(key, async () => {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'snowfall',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      timezone: 'auto',
      forecast_days: '1',
    });

    const data = await fetchJson(`${FORECAST_URL}?${params}`, {}, 'Open-Meteo forecast');
    if (!data?.current || typeof data.current.temperature_2m !== 'number') {
      throw new UpstreamError('Weather data was incomplete. Please try another location.', 502, 'WEATHER_DATA_INCOMPLETE');
    }

    return data;
  });
}

export async function searchPlaces(query) {
  const key = `geocode:${query.toLocaleLowerCase()}`;

  return cachedRequest(key, async () => {
    const params = new URLSearchParams({
      name: query,
      count: '8',
      language: 'en',
      format: 'json',
    });
    const data = await fetchJson(`${GEOCODING_URL}?${params}`, {}, 'Open-Meteo geocoding');

    return (Array.isArray(data?.results) ? data.results : []).map((place) => ({
      id: place.id,
      name: place.name,
      admin1: place.admin1 ?? null,
      country: place.country ?? null,
      countryCode: place.country_code ?? null,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone ?? null,
      population: place.population ?? null,
    }));
  });
}
