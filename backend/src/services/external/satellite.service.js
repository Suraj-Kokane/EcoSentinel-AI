import env from '../../config/env.js'
import { logger } from '../../config/logger.js'

// Satellite intelligence integration stubs. Designed to plug Sentinel Hub and
// ISRO Bhuvan in later via env-controlled clients. Not active by default.
export function satelliteStatus() {
  return [
    { key: 'bhuvan', label: 'ISRO Bhuvan', ready: false, note: 'awaiting auth integration' },
    { key: 'sentinel', label: 'Sentinel Hub', ready: Boolean(env.apiKeys.sentinelId && env.apiKeys.sentinelSecret), note: 'env-driven' },
    { key: 'firms', label: 'NASA FIRMS', ready: Boolean(env.apiKeys.firms), note: 'used by fire job' },
    { key: 'osm', label: 'OpenStreetMap', ready: true, note: 'basemap (frontend)' },
  ]
}

// Placeholder for future NDVI/water-body retrieval via Sentinel Hub Process API.
export async function fetchNdvi() {
  if (!env.apiKeys.sentinelId || !env.apiKeys.sentinelSecret) {
    logger.warn('sentinel: credentials not configured')
    return null
  }
  logger.info('sentinel: NDVI retrieval stubbed (integration-ready)')
  return null
}

export default { satelliteStatus, fetchNdvi }