import { logger } from '../../config/logger.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

// Reverse-geocode lat/lng → Indian state/district using OpenStreetMap Nominatim.
// Respects the usage policy (single-threaded, identifiable UA, low rate).
export async function reverseGeocode(lat, lng) {
  try {
    const url = `${NOMINATIM_URL}?format=json&lat=${lat}&lon=${lng}&zoom=8&accept-language=en`
    const res = await fetch(url, { headers: { 'User-Agent': 'EcoSentinelAI/1.2 (national environmental network)' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const addr = data.address || {}
    return {
      state: addr.state || '',
      district: addr.county || addr.state_district || addr.city || '',
      displayName: data.display_name || '',
    }
  } catch (err) {
    logger.warn('reverseGeocode: failed', { error: err.message })
    return { state: '', district: '' }
  }
}

export default { reverseGeocode }