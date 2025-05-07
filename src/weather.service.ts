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

const EMAIL = 'a8143@ya.ru';

const weatherServiceApi = new axios.Axios({
  baseURL: 'https://api.met.no/weatherapi/locationforecast/2.0/',
  headers: {
    'user-agent': `weather-monitor ${EMAIL}`,
  },
});

export class WeatherApiResponse {
  @ValidateNested()
  @Type(() => Properties)
  @Expose()
  properties!: Properties;
}

export class Properties {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSeriesEntry)
  @Expose()
  timeseries!: TimeSeriesEntry[];

  @Expose({ name: 'meta' })
  @Transform((obj) => obj.value.units.air_temperature, {
    toClassOnly: true,
  })
  @IsString()
  temperature_units!: TimeSeriesEntry[];
}

export class TimeSeriesEntry {
  @IsDate()
  @Transform(({ value }) => DateTime.fromISO(value))
  @Expose()
  time!: DateTime;

  @Expose({ name: 'data' })
  @Transform((obj) => obj.value.instant.details.air_temperature, {
    toClassOnly: true,
  })
  @IsNumber()
  temperature!: number;
}

export interface WeatherItem {
  time: DateTime;
  temperature: number;
}

export async function getWeatherByCoordinates(
  lat: string,
  lon: string,
  timezone: string,
  target_hour: number,
) {
  const response = await weatherServiceApi.get('compact', {
    params: { lat, lon },
  });

  // const errors = await validate(WeatherApiResponse, JSON.parse(response.data));
  const parsed = plainToInstance(
    WeatherApiResponse,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    JSON.parse(response.data as string),
    {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    },
  );

  const forecast = extractDailyTemperature(
    parsed.properties.timeseries,
    timezone,
    target_hour,
  );

  return {
    metadata: {
      location: { lat, lon },
      timezone,
      target_hour,
      temperature_units: parsed.properties.temperature_units,
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
      ({ time }) => time.isValid && time.setZone(timezone).hour === target_hour,
    )
    .map(({ time, temperature }) => ({
      time: time.setZone(timezone),
      temperature,
    }));
}
