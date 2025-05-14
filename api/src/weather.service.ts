import axios from 'axios';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, plainToInstance, Expose, Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { YR_NO_API_URL, YR_NO_USER_EMAIL } from './config';
import { InMemoryCache } from './cache/InMemoryCache';
import { interpolateLinear } from './math/interpolateLinear';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const weatherServiceApi = new axios.Axios({
  baseURL: YR_NO_API_URL,
  headers: {
    'user-agent': `weather-monitor: ${YR_NO_USER_EMAIL}`,
  },
});

export class TimeSeriesEntry {
  @IsDate()
  @Transform(({ value }) => DateTime.fromISO(value))
  @Expose()
  time!: DateTime;

  @Expose({ name: 'data' })
  @Transform((obj) => obj.obj?.data?.instant?.details?.air_temperature, {
    toClassOnly: true,
  })
  @IsNumber()
  temperature!: number;
}

export class Properties {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSeriesEntry)
  @Expose()
  timeseries!: TimeSeriesEntry[];

  @Expose({ name: 'meta' })
  @Transform((obj) => obj.obj?.meta?.units?.air_temperature, {
    toClassOnly: true,
  })
  @IsString()
  temperature_units?: string;
}

export class WeatherApiResponse {
  @ValidateNested()
  @Type(() => Properties)
  @Expose()
  properties!: Properties;
}

export interface WeatherItem {
  time: DateTime;
  temperature: number;
}

export interface Forecast {
  metadata: {
    location: { lat: string; lon: string };
    timezone: string;
    target_hour: number;
    temperature_units: string | null;
  };
  forecast: WeatherItem[];
}

const forecastCache = new InMemoryCache<WeatherApiResponse>();

function getCacheKey(lat: string, lon: string): string {
  const roundedLat = Math.round(parseFloat(lat) * 10) / 10;
  const roundedLon = Math.round(parseFloat(lon) * 10) / 10;
  return `${roundedLat}---${roundedLon}`;
}

export async function getForecastByCoordinates(
  lat: string,
  lon: string,
  timezone: string,
  target_hour: number,
): Promise<Forecast> {
  const cacheKey = getCacheKey(lat, lon);

  let parsedResponse = forecastCache.get(cacheKey);

  if (!parsedResponse) {
    console.log(`Requesting weather from yt.no for lat: ${lat} lon: ${lon}`);

    const response = await weatherServiceApi.get('compact', {
      params: { lat, lon },
    });

    const rawParsedResponse = plainToInstance(
      WeatherApiResponse,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      JSON.parse(response.data as string),
      {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      },
    );

    parsedResponse = {
      ...rawParsedResponse,
      properties: {
        ...rawParsedResponse.properties,
        timeseries: addMissedValues(rawParsedResponse.properties.timeseries),
      },
    };

    forecastCache.set(cacheKey, parsedResponse);
  } else {
    console.log(`Used cached value for lat: ${lat} lon: ${lon}`);
  }

  const forecast = extractDailyTemperature(
    parsedResponse.properties.timeseries,
    timezone,
    target_hour,
  );

  return {
    metadata: {
      location: { lat, lon },
      timezone,
      target_hour,
      temperature_units: parsedResponse.properties.temperature_units ?? null,
    },
    forecast,
  };
}

function extractDailyTemperature(
  timeseries: TimeSeriesEntry[],
  timezone: string,
  target_hour: number,
): WeatherItem[] {
  return timeseries
    .filter(
      (ts) => ts.time.isValid && ts.time.setZone(timezone).hour === target_hour,
    )
    .map(({ time, temperature }) => ({
      time: time.setZone(timezone),
      temperature,
    }));
}

function addMissedValues(timeseries: TimeSeriesEntry[]) {
  if (!timeseries.length) {
    return timeseries;
  }

  const result: TimeSeriesEntry[] = [];

  for (let i = 0; i < timeseries.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentTs = timeseries[i]!;
    result.push(currentTs);

    const nextTs = timeseries[i + 1];

    if (!nextTs) continue;

    const currentTsTimestamp = currentTs.time.toMillis();
    const nextTsTimestamp = nextTs.time.toMillis();

    if (nextTsTimestamp - currentTsTimestamp <= ONE_HOUR_IN_MS) continue;

    for (
      let missedTimestamp = currentTsTimestamp + ONE_HOUR_IN_MS;
      nextTsTimestamp - missedTimestamp >= ONE_HOUR_IN_MS;
      missedTimestamp += ONE_HOUR_IN_MS
    ) {
      const time = DateTime.fromMillis(missedTimestamp);
      const temperature = interpolateLinear(
        currentTs.time.hour,
        nextTs.time.hour,
        currentTs.temperature,
        nextTs.temperature,
        time.hour,
      );

      result.push({
        time,
        temperature: Math.round(temperature * 10) / 10,
      });
    }
  }

  return result;
}
