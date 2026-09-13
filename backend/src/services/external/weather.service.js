import { prisma } from '../../config/prisma.js'
import env from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { CITIES } from './cities.js'

// OpenWeatherMap current-weather ingestion. Disabled unless OPENWEATHER_API_KEY is set.
export async function syncWeather() {
  const key = env.apiKeys.openWeather
  if (!key) {
    logger.warn('weather.job: OPENWEATHER_API_KEY not set — skipping')
    return { synced: 0, reason: 'missing key' }
  }

  let synced = 0
  for (const c of CITIES) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${c.lat}&lon=${c.lng}&appid=${key}&units=metric`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()

      await prisma.weatherData.create({
        data: {
          state: c.state,
          district: c.district,
          temperature: body.main?.temp ?? null,
          humidity: body.main?.humidity ?? null,
          rainfall: body.rain?.['1h'] ?? 0,
          windSpeed: body.wind?.speed ?? null,
          timestamp: new Date(),
        },
      })
      synced += 1
    } catch (err) {
      logger.warn('weather.job: failed for city', { district: c.district, error: err.message })
    }
  }
  return { synced }
}

export default { syncWeather }