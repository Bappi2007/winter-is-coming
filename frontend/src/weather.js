const CONDITIONS = {
  0: ['Clear sky', 'clear'],
  1: ['Mainly clear', 'clear'],
  2: ['Partly cloudy', 'cloud'],
  3: ['Overcast', 'cloud'],
  45: ['Fog', 'fog'],
  48: ['Depositing rime fog', 'fog'],
  51: ['Light drizzle', 'rain'],
  53: ['Drizzle', 'rain'],
  55: ['Dense drizzle', 'rain'],
  56: ['Freezing drizzle', 'rain'],
  57: ['Heavy freezing drizzle', 'rain'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Heavy freezing rain', 'rain'],
  71: ['Light snowfall', 'snow'],
  73: ['Snowfall', 'snow'],
  75: ['Heavy snowfall', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Rain showers', 'rain'],
  81: ['Rain showers', 'rain'],
  82: ['Violent rain showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm with hail', 'storm'],
  99: ['Thunderstorm with heavy hail', 'storm'],
};

export function getCondition(code) {
  return CONDITIONS[code] ?? ['Changing skies', 'cloud'];
}

export function getWinterHeadline(temperature) {
  if (temperature <= 4) return { phrase: 'here.', detail: 'The cold has settled in. Find your warmest layers.' };
  if (temperature <= 15) return { phrase: 'coming.', detail: 'A little more chill is finding its way into the air.' };
  return { phrase: 'on its way.', detail: 'For now, the air is holding on to a little warmth.' };
}

export function formatWindDirection(degrees) {
  if (!Number.isFinite(degrees)) return '';
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return points[Math.round(degrees / 45) % 8];
}
