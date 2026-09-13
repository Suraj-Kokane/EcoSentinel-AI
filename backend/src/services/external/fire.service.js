import { prisma } from '../../config/prisma.js'
import env from '../../config/env.js'
import { logger } from '../../config/logger.js'

// NASA FIRMS fire-hotspot ingestion. FIRMS requires a MAP_KEY (FIRMS_API_KEY).
// If no key is set the job skips (no synthetic data is created — keep sources real).
export async function syncFires() {
  const key = env.apiKeys.firms
  if (!key) {
    logger.warn('fire.job: FIRMS_API_KEY not set — skipping')
    return { synced: 0, reason: 'missing key' }
  }

  try {
    // FIRMS country endpoint for India (ISO3: IND), CSV output, latest 24h.
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/MODIS_NRT/IND/1`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()

    const rows = text
      .trim()
      .split('\n')
      .slice(1) // drop header
      .map((line) => line.split(','))
      .filter((r) => r.length >= 5)

    let synced = 0
    for (const r of rows) {
      const [latitude, longitude, brightness, , acq_date, acq_time, , confidence] = r
      if (!latitude || !longitude) continue
      const detectedAt = new Date(`${acq_date}T${String(acq_time).slice(0, 2)}:${String(acq_time).slice(2, 4)}:00Z`)

      await prisma.fireHotspot.create({
        data: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          intensity: Math.round((Number(brightness) - 300) * 3) || 50,
          source: 'NASA FIRMS',
          detectedAt,
        },
      })
      synced += 1
    }
    return { synced }
  } catch (err) {
    logger.warn('fire.job: fetch failed', { error: err.message })
    return { synced: 0, error: err.message }
  }
}

export default { syncFires }