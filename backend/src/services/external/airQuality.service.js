import { prisma } from '../../config/prisma.js'
import env from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { CITIES } from './cities.js'

// OpenWeather Air Pollution API ingestion. Disabled unless OPENWEATHER_API_KEY is set.
export async function syncAirQuality() {
  const key = env.apiKeys.openWeather
  if (!key) {
    logger.warn('airQuality.job: OPENWEATHER_API_KEY not set — skipping')
    return { synced: 0, reason: 'missing key' }
  }

  let synced = 0
  for (const c of CITIES) {
    try {
      const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${c.lat}&lon=${c.lng}&appid=${key}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      const comp = body.list?.[0]?.components ?? {}

      await prisma.airQuality.create({
        data: {
          state: c.state,
          district: c.district,
          aqi: body.list?.[0]?.main?.aqi ? Math.round(body.list[0].main.aqi * 50) : 0,
          pm25: comp.pm2_5 ?? null,
          pm10: comp.pm10 ?? null,
          co: comp.co ?? null,
          no2: comp.no2 ?? null,
          so2: comp.so2 ?? null,
          timestamp: new Date(),
        },
      })
      synced += 1
    } catch (err) {
      logger.warn('airQuality.job: failed for city', { district: c.district, error: err.message })
    }
  }
  return { synced }
}

export default { syncAirQuality }