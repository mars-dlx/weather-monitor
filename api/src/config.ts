export const PORT = Number(process.env['PORT']) || 50000;

// Belgrade
export const DEFAULT_COORDINATES_LAT =
  process.env['DEFAULT_COORDINATES_LAT'] ?? '44.7866';
export const DEFAULT_COORDINATES_LON =
  process.env['DEFAULT_COORDINATES_LON'] ?? '20.4489';
export const DEFAULT_TIMEZONE =
  process.env['DEFAULT_TIMEZONE'] ?? 'Europe/Belgrade';
export const DEFAULT_TARGET_HOUR = process.env['DEFAULT_TARGET_HOUR'] ?? '14';

export const CACHE_TTL = Number(process.env['CACHE_TTL']) || 30 * 60 * 1000;
export const YR_NO_USER_EMAIL =
  process.env['YR_NO_USER_EMAIL'] ?? 'your-email@example.com';
export const YR_NO_API_URL =
  process.env['YR_NO_API_URL'] ??
  'https://api.met.no/weatherapi/locationforecast/2.0/';
