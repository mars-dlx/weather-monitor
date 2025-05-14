import type { Request, Response } from 'express';
import { getForecastByCoordinates } from '../weather.service';
import {
  DEFAULT_COORDINATES_LAT,
  DEFAULT_COORDINATES_LON,
  DEFAULT_TARGET_HOUR,
  DEFAULT_TIMEZONE,
} from '../config';

export async function getWeather(req: Request, res: Response) {
  const {
    lat = DEFAULT_COORDINATES_LAT,
    lon = DEFAULT_COORDINATES_LON,
    timezone = DEFAULT_TIMEZONE,
    target_hour = DEFAULT_TARGET_HOUR,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  } = req.query as {
    lat?: string;
    lon?: string;
    timezone?: string;
    target_hour?: string;
  };

  try {
    const forecast = await getForecastByCoordinates(
      lat,
      lon,
      timezone,
      parseInt(target_hour, 10),
    );

    res.json(forecast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving weather data' });
  }
}
