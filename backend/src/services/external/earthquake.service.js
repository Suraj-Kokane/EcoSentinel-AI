import { prisma } from '../../config/prisma.js'
import { logger } from '../../config/logger.js'
import { emitEarthquake } from '../../sockets/events.js'

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'
const INDIA_BOUNDS = { minLat: 6.0, maxLat: 38.0, minLng: 68.0, maxLng: 98.0 }

function isIndiaRegion(lat, lng) {
  return lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat && lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng
}

// USGS earthquake-feed ingestion (no API key). Monitors the Indian region.
export async function syncEarthquakes() {
  try {
    const res = await fetch(USGS_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const geo = await res.json()

    let synced = 0
    for (const f of geo.features ?? []) {
      const [lng, lat, depth] = f.geometry?.coordinates ?? [0, 0, 0]
      if (!isIndiaRegion(lat, lng)) continue

      const mag = f.properties?.mag
      const eventTime = new Date(f.properties?.time)
      const place = f.properties?.place || 'India region'

      // Upsert by unique event id to avoid duplicates.
      const exists = await prisma.earthquake.findFirst({ where: { magnitude: mag, eventTime } })
      if (exists) continue

      const eq = await prisma.earthquake.create({
        data: { magnitude: mag ?? 0, depth: depth ?? 0, latitude: lat, longitude: lng, location: place, eventTime },
      })
      emitEarthquake(eq)
      synced += 1
    }
    return { synced }
  } catch (err) {
    logger.warn('earthquake.job: fetch failed', { error: err.message })
    return { synced: 0, error: err.message }
  }
}

export default { syncEarthquakes }