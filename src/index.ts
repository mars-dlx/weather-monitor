import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { getForecastByCoordinates } from './weather.service';
import { validateWeatherQuery } from './middlewares/validateWeatherQuery';
import { redirectIfMissingQueryParams } from './middlewares/redirectIfMissingQueryParams';
import { PORT } from './config';

const app = express();

const sendIndex = (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/web/index.html'));
};

app
  .disable('x-powered-by')
  .use(cors())
  .use(express.json())
  .use(express.static(path.join(__dirname, '../dist/web/')))
  .get('/', sendIndex)
  .get(
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
        const forecast = await getForecastByCoordinates(
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
