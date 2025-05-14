# Weather Monitor

Weather Monitor is a lightweight service built with TypeScript and Express that fetches and exposes daily weather data for Belgrade (or any coordinates) via a REST API. It uses the official [yr.no](https://api.met.no/) API to provide accurate temperature forecasts around 14:00 local time.

## Features

- 📍 Default support for Belgrade, Serbia
- 🌍 Custom location support via latitude/longitude
- 🕑 Temperature forecast for ~14:00 local time or any specified hour
- ⚡ Caching to prevent excessive API usage
- 🧰 REST API with Web interface
- 🐳 Docker-ready for easy deployment

## Technologies

- TypeScript
- Node.js
- Express.js
- Luxon
- Axios
- Vite + React (for optional Web UI)
- Docker

---

## Getting Started

### Prerequisites

- Node.js 22 LTS Recomended
- Docker (optional, for containerized setup)

### Installation

```bash
git clone https://github.com/your-username/weather-monitor.git
cd weather-monitor
npm install
````

### Run in Development Mode

```bash
cp .env.example .env
npm run dev
```

### Build and Start (Production)

```bash
npm run build
npm start
```

---

## Web UI

To launch the browser UI:

```bash
npm run web:dev
```

To build it for production:

```bash
npm run web:build
```

Preview the production build:

```bash
npm run web:preview
```

---

### Run with Docker

```bash
docker build -t weather-monitor .
docker run -p 50000:50000 --env-file .env weather-monitor
```
---

## API Reference

### `GET /api/weather`

Returns a forecast of daily temperatures around a specified hour (default is 14:00) for a given location.

#### Query Parameters

| Parameter     | Type   | Required | Description                                                     |
| ------------- | ------ | -------- | --------------------------------------------------------------- |
| `lat`         | string | No       | Latitude (e.g., `"44.7866"`), defaults to Belgrade              |
| `lon`         | string | No       | Longitude (e.g., `"20.4489"`), defaults to Belgrade             |
| `timezone`    | string | No       | IANA timezone (e.g., `"Europe/Belgrade"`), defaults to Belgrade |
| `target_hour` | string | No       | Hour of day to target (e.g., `"14"`), 24h format                |

#### Response Format

```ts
interface Forecast {
  metadata: {
    location: { lat: string; lon: string };
    timezone: string;
    target_hour: number;
    temperature_units: string; // e.g., "celsius"
  };
  forecast: WeatherItem[];
}

interface WeatherItem {
  time: DateTime;         // ISO 8601 datetime string
  temperature: number;    // Temperature at the given time
}
```

#### Response Example

```json
{
  "metadata": {
    "location": {
      "lat": "44.7866",
      "lon": "20.4489"
    },
    "timezone": "Europe/Belgrade",
    "target_hour": 14,
    "temperature_units": "celsius"
  },
  "forecast": [
    {
      "time": "2025-05-08T14:00:00+02:00",
      "temperature": 19.3
    },
    {
      "time": "2025-05-09T14:00:00+02:00",
      "temperature": 21.1
    }
  ]
}
```

---

## Environment Variables

| Variable                  | Default                                                 | Description                           |
| ------------------------- | ------------------------------------------------------- | ------------------------------------- |
| `PORT`                    | `50000`                                                 | Port the server will listen on        |
| `DEFAULT_COORDINATES_LAT` | `44.7866`                                               | Default latitude (Belgrade)           |
| `DEFAULT_COORDINATES_LON` | `20.4489`                                               | Default longitude (Belgrade)          |
| `DEFAULT_TIMEZONE`        | `Europe/Belgrade`                                       | Timezone to interpret `targetHour`    |
| `DEFAULT_TARGET_HOUR`     | `14`                                                    | Time of day for forecast (24h format) |
| `CACHE_TTL`               | `1800000`                                               | Cache lifetime in milliseconds        |
| `YR_NO_USER_EMAIL`        | [your-email@example.com](mailto:your-email@example.com) | Required by yr.no API                 |
| `YR_NO_API_URL`           | `https://api.met.no/weatherapi/locationforecast/2.0/`   | Yr.no endpoint                        |


---

## License

MIT © MarS\_DLX
