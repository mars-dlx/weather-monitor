import { DateTime } from 'luxon';
import { useState, useCallback } from 'react';
import type { ForecastParams } from '../App';

export interface Forecast {
  metadata: {
    location: { lat: string; lon: string };
    timezone: string;
    target_hour: number;
    temperature_units: string;
  };
  forecast: WeatherItem[];
}

export interface WeatherItem {
  time: DateTime;
  temperature: number;
}

export function useForecast() {
  const [data, setData] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchForecast = useCallback(async (params: ForecastParams) => {
    if (
      !Object.values(params).every((p) => typeof p === 'string' && p.length)
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({ ...params }).toString();
      const res = await fetch(`/weather?${query}`);

      if (!res.ok) {
        throw new Error('Request failed: ' + (await res.json()).error);
      }

      const json = await res.json();
      json.forecast = json.forecast.map(
        ({ time, ...rest }: WeatherItem & { time: string }): WeatherItem => ({
          time: DateTime.fromISO(time),
          ...rest,
        }),
      );

      setData(json);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchForecast };
}
