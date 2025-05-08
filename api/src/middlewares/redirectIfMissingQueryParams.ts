import type { NextFunction, Request, Response } from 'express';
import {
  DEFAULT_COORDINATES_LAT,
  DEFAULT_COORDINATES_LON,
  DEFAULT_TARGET_HOUR,
  DEFAULT_TIMEZONE,
} from '../config';

export function redirectIfMissingQueryParams(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { lat, lon, timezone, target_hour } = req.query;

  const isMissing = !lat || !lon || !timezone || !target_hour;

  if (!isMissing) return next();

  const defaultParams = new URLSearchParams({
    lat: typeof lat === 'string' ? lat : DEFAULT_COORDINATES_LAT,
    lon: typeof lon === 'string' ? lon : DEFAULT_COORDINATES_LON,
    timezone: typeof timezone === 'string' ? timezone : DEFAULT_TIMEZONE,
    target_hour:
      typeof target_hour === 'string' ? target_hour : DEFAULT_TARGET_HOUR,
  });

  return res.redirect(`/weather?${defaultParams.toString()}`);
}
