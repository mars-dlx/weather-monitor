import 'reflect-metadata';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import path from 'path';
import { URLSearchParams } from 'url';
import { getWeatherByCoordinates } from './weather.service';

const DEFAULT_COORDINATES = { lat: '44.7866', lon: '20.4489' } as const; // Belgrade
const DEFAULT_TIMEZONE = 'Europe/Belgrade';
const DEFAULT_TARGET_HOUR = '14';

dotenv.config();
const app = express();

// const sendIndex = (req: express.Request, res: express.Response) => {
//   res.sendFile(path.join(__dirname, '../../static/index.html'));
// };

app.disable('x-powered-by').use(cors()).use(express.json());
// .use(express.static(path.join(__dirname, '../../static')))
// .get('/', sendIndex)

export function validateWeatherQuery(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { lat, lon, target_hour, timezone } = req.query;

  const checkNumberParam = (p: (typeof req.query)[string]) =>
    p !== undefined && (typeof p !== 'string' || isNaN(Number(p)));

  if (checkNumberParam(lat)) {
    res.status(400).json({ error: 'Invalid lat' });
    return;
  }

  if (checkNumberParam(lon)) {
    res.status(400).json({ error: 'Invalid lon' });
    return;
  }

  if (checkNumberParam(target_hour)) {
    res.status(400).json({ error: 'Invalid target_hour' });
    return;
  }

  if (timezone !== undefined && typeof timezone !== 'string') {
    res.status(400).json({ error: 'Invalid timezone' });
    return;
  }

  next();
}

export function redirectIfMissingQueryParams(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { lat, lon, timezone, target_hour } = req.query;

  const isMissing = !lat || !lon || !timezone || !target_hour;

  if (!isMissing) return next();

  const defaultParams = new URLSearchParams({
    /* eslint-disable @typescript-eslint/no-base-to-string */
    lat: lat ? String(lat) : DEFAULT_COORDINATES.lat,
    lon: lon ? String(lon) : DEFAULT_COORDINATES.lon,
    timezone: timezone ? String(timezone) : DEFAULT_TIMEZONE,
    target_hour: target_hour ? String(target_hour) : DEFAULT_TARGET_HOUR,
    /* eslint-enable @typescript-eslint/no-base-to-string */
  });

  return res.redirect(`/weather?${defaultParams.toString()}`);
}

app.get(
  '/weather',
  validateWeatherQuery,
  redirectIfMissingQueryParams,
  async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const { lat, lon, timezone, target_hour } = req.query as {
      lat: string;
      lon: string;
      timezone: string;
      target_hour: string;
    };

    try {
      const forecast = await getWeatherByCoordinates(
        lat,
        lon,
        timezone,
        parseInt(target_hour, 10),
      );

      res.json(forecast);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving weather data' });
    }
  },
);

const PORT = process.env.PORT || 50000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
