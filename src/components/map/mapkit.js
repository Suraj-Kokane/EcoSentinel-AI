import L from 'leaflet'

// Basemaps — CARTO Dark uses OpenStreetMap data (mission-control look); standard OSM kept as an option.
export const BASEMAPS = {
  dark: {
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  light: {
    label: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

export const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.1, 97.4],
]

export function featureName(feature) {
  const p = feature?.properties || {}
  if (p.NAME_2) return { kind: 'district', name: p.NAME_2, state: p.NAME_1 }
  if (p.NAME_1) return { kind: 'state', name: p.NAME_1 }
  return { kind: 'unknown', name: 'Unknown' }
}

export function featureBounds(feature) {
  try {
    return L.geoJSON(feature).getBounds()
  } catch {
    return null
  }
}

// marker color keys used by overlays
export const REPORT_COLORS = {
  flood: '#2C8CFF',
  fire: '#F97316',
  pollution: '#A855F7',
  landslide: '#EAB308',
  other: '#64748B',
}

export const INFRA_COLORS = {
  dam: '#22D3EE',
  hospital: '#EF4444',
  school: '#EAB308',
  power: '#F97316',
  railway: '#8AA6C8',
  highway: '#34D399',
  airport: '#A78BFA',
}

export const MAG_COLOR = (mag) => (mag >= 5 ? '#EF4444' : mag >= 4 ? '#F97316' : '#EAB308')