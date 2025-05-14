import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.css';
import { useForecast } from './hooks/useForecast';
import { useAPIVersion } from './hooks/useAPIVersion';
import webVersion from '../../version.json';

const DEFAULT_PARAMS: ForecastParams = {
  lat: '44.7866',
  lon: '20.4489',
  timezone: 'Europe/Belgrade',
  target_hour: '14',
} as const;

export interface ForecastParams {
  lat: string;
  lon: string;
  timezone: string;
  target_hour: string;
}

function formatTimestamp(unixTimestamp: string | null): string {
  if (!unixTimestamp) {
    return 'none';
  }

  const date = new Date(Number(unixTimestamp) * 1000);
  return date.toLocaleString();
}

function getForecastParams(searchParams: URLSearchParams): ForecastParams {
  return {
    lat: searchParams.get('lat') ?? '',
    lon: searchParams.get('lon') ?? '',
    timezone: searchParams.get('timezone') ?? '',
    target_hour: searchParams.get('target_hour') ?? '',
  };
}

export default function App() {
  const apiVersion = useAPIVersion();

  const [searchParams, setSearchParams] = useSearchParams({
    ...DEFAULT_PARAMS,
  });

  const [form, setForm] = useState(getForecastParams(searchParams));
  const { data, loading, error, fetchForecast } = useForecast();

  const handleSubmit = () => {
    setSearchParams({ ...form });
    void fetchForecast(form);
  };

  return (
    <main className="main">
      <div className="form-row">
        <label htmlFor="lat">Latitude:</label>
        <input
          id="lat"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label htmlFor="lon">Longitude:</label>
        <input
          id="lon"
          value={form.lon}
          onChange={(e) => setForm({ ...form, lon: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label htmlFor="timezone">Timezone:</label>
        <input
          id="timezone"
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label htmlFor="target_hour">Target Hour:</label>
        <input
          id="target_hour"
          value={form.target_hour}
          onChange={(e) => setForm({ ...form, target_hour: e.target.value })}
        />
      </div>
      <button type="button" onClick={handleSubmit}>
        Fetch Forecast
      </button>

      {loading && <p>Loading...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error.message}</p>}
      {!loading && !error && data && (
        <div className="forecast-container">
          {data && (
            <section className="forecast-table">
              <div className="table-header">
                <div className="table-cell">Local Time</div>
                <div className="table-cell">{data.metadata.timezone}</div>
                <div className="table-cell">
                  T ({data.metadata.temperature_units})
                </div>
              </div>
              {data.forecast.map((entry, index) => {
                const targetTime = entry.time.setZone(data.metadata.timezone);

                return (
                  // eslint-disable-next-line react-x/no-array-index-key
                  <div className="table-row" key={index}>
                    <div className="table-cell">
                      {entry.time.toLocal().toFormat('f')}
                    </div>
                    <div className="table-cell">{targetTime.toFormat('f')}</div>
                    <div className="table-cell">{entry.temperature}</div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      )}
      <div className="footer-version">
        <div className="version-block">
          <strong>Web</strong> version: {webVersion.version}, built:{' '}
          {formatTimestamp(webVersion.build_date)}
        </div>
        <div className="version-block">
          <strong>API</strong> version: {apiVersion?.version ?? 'loading...'},
          built: {formatTimestamp(apiVersion?.build_date ?? null)}
        </div>
      </div>
    </main>
  );
}
