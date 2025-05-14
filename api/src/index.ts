import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { validateWeatherQuery } from './middlewares/validateWeatherQuery';
import { PORT } from './config';
import { getHealth } from './actions/getHealth';
import { getWeather } from './actions/getWeather';

const app = express();

const sendIndex = (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../../web/index.html'));
};

app
  .disable('x-powered-by')
  .use(cors())
  .use(express.json())
  .use(express.static(path.resolve(__dirname, '../../web/')))
  .get('/', sendIndex)
  .get('/api/weather', validateWeatherQuery, getWeather)
  .get('/api/health', getHealth);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
