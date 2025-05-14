import type { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';

export function validateWeatherQuery(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { lat, lon, target_hour, timezone } = req.query;

  if (typeof lat === 'string') {
    const numberLat = Number(lat);
    if (isNaN(numberLat) || numberLat < -90 || numberLat > 90) {
      res.status(400).json({ error: 'Invalid lat' });
      return;
    }
  } else {
    res.status(400).json({ error: 'Invalid lat' });
  }

  if (typeof lon === 'string') {
    const numberLon = Number(lon);
    if (isNaN(numberLon) || numberLon < -180 || numberLon > 180) {
      res.status(400).json({ error: 'Invalid lon' });
      return;
    }
  } else {
    res.status(400).json({ error: 'Invalid lon' });
  }

  if (typeof target_hour === 'string') {
    const numberTargetHour = Number(target_hour);
    if (
      isNaN(numberTargetHour) ||
      numberTargetHour < 0 ||
      numberTargetHour > 23
    ) {
      res.status(400).json({ error: 'Invalid target_hour' });
      return;
    }
  } else {
    res.status(400).json({ error: 'Invalid target_hour' });
  }

  if (typeof timezone === 'string') {
    if (!DateTime.local().setZone(timezone).isValid) {
      res.status(400).json({ error: 'Invalid timezone' });
      return;
    }
  } else {
    res.status(400).json({ error: 'Invalid timezone' });
  }

  next();
}
