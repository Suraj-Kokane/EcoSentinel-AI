// Satellite intelligence mock data — flood extent, fire hotspots, vegetation
// (NDVI), water bodies, deforestation. Future-ready for ISRO Bhuvan, ESA
// Sentinel and NASA FIRMS ingestion.

import { hoursAgo } from '../lib/format.js'
import { rng } from '../lib/prng.js'

// Vegetation health (NDVI proxy, 0–1) — deterministic per state name
export function ndviFor(stateName) {
  const r = rng('ndvi|' + stateName)
  return Math.round((0.3 + r() * 0.55) * 100) / 100
}

// FIRMS-style active fire hotspots
export const FIRE_HOTSPOTS = [
  { lat: 23.53, lng: 80.83, intensity: 92, confidence: 95, region: 'Bandhavgarh, MP', detected: hoursAgo(2) },
  { lat: 20.25, lng: 81.49, intensity: 85, confidence: 90, region: 'Kanker, Chhattisgarh', detected: hoursAgo(3) },
  { lat: 27.33, lng: 88.61, intensity: 71, confidence: 82, region: 'North Sikkim', detected: hoursAgo(4) },
  { lat: 30.9, lng: 75.85, intensity: 66, confidence: 88, region: 'Ludhiana (stubble)', detected: hoursAgo(2) },
  { lat: 26.02, lng: 92.77, intensity: 78, confidence: 84, region: 'Nagaon, Assam', detected: hoursAgo(5) },
  { lat: 12.97, lng: 77.59, intensity: 60, confidence: 76, region: 'Bengaluru Rural', detected: hoursAgo(3) },
  { lat: 30.32, lng: 78.03, intensity: 55, confidence: 70, region: 'Dehradun foothills', detected: hoursAgo(6) },
  { lat: 21.15, lng: 79.09, intensity: 82, confidence: 89, region: 'Nagpur forest range', detected: hoursAgo(2) },
]

// Flood extent polygons (simplified bounding rings, km² estimates)
export const FLOOD_EXTENTS = [
  { region: 'Brahmaputra valley, Assam', area: 4820, date: hoursAgo(6), severity: 4, ring: [[27.2, 93.8], [26.4, 94.9], [26.0, 94.0], [26.8, 93.2]] },
  { region: 'Ganga basin, Bihar', area: 2150, date: hoursAgo(12), severity: 4, ring: [[26.0, 85.0], [25.4, 86.4], [25.0, 85.8], [25.6, 84.6]] },
  { region: 'Kerala backwaters', area: 720, date: hoursAgo(18), severity: 3, ring: [[9.9, 76.3], [9.6, 77.0], [9.2, 76.7], [9.6, 76.1]] },
  { region: 'Sundarbans delta', area: 1380, date: hoursAgo(24), severity: 3, ring: [[22.3, 88.8], [21.8, 89.2], [21.5, 88.9], [21.9, 88.4]] },
]

export const WATER_BODIES = [
  { name: 'Indira Sagar Reservoir', state: 'Madhya Pradesh', level: 62, trend: 'falling', area: 913 },
  { name: 'Mettur Dam Reservoir', state: 'Tamil Nadu', level: 48, trend: 'falling', area: 153 },
  { name: 'Hirakud Reservoir', state: 'Orissa', level: 88, trend: 'rising', area: 743 },
  { name: 'Tehri Reservoir', state: 'Uttaranchal', level: 71, trend: 'stable', area: 42 },
  { name: 'Sardar Sarovar (Narmada)', state: 'Gujarat', level: 55, trend: 'falling', area: 348 },
]

export const SATELLITE_SOURCES = [
  { key: 'bhuvan', label: 'ISRO Bhuvan', status: 'integration-ready' },
  { key: 'sentinel', label: 'ESA Sentinel-2', status: 'integration-ready' },
  { key: 'firms', label: 'NASA FIRMS', status: 'integration-ready' },
  { key: 'noaa', label: 'NOAA GOES', status: 'integration-ready' },
]