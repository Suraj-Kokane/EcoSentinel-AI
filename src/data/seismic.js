// Seismic activity feed — monitoring only (NO prediction claims).
// Sources attributed to NCS and USGS feeds.

import { hoursAgo, minsAgo } from '../lib/format.js'

let s = 200
const Q = (mag, depth, place, lat, lng, time, source, felt = false) => ({
  id: `EQ-${s++}`,
  mag,
  depth, // km
  place,
  lat,
  lng,
  time,
  source, // NCS | USGS
  felt,
})

export const SEISMIC = [
  Q(5.2, 34, 'Sitamarhi, Bihar (Indo-Nepal border region)', 26.6, 85.48, minsAgo(55), 'NCS', true),
  Q(3.8, 18, 'Pasighat, Arunachal Pradesh', 28.07, 95.33, hoursAgo(6), 'USGS'),
  Q(4.1, 42, 'Kargil, Ladakh region', 34.55, 76.13, hoursAgo(11), 'NCS'),
  Q(3.5, 10, 'Imphal East, Manipur', 24.82, 93.94, hoursAgo(14), 'NCS'),
  Q(4.6, 28, 'Chamoli-Gopeshwar, Uttarakhand', 30.42, 79.33, hoursAgo(20), 'NCS', true),
  Q(2.9, 8, 'Koyna region, Maharashtra', 17.4, 73.75, hoursAgo(26), 'NCS'),
  Q(5.6, 60, 'Andaman Sea (north of Port Blair)', 12.1, 93.4, hoursAgo(31), 'USGS'),
  Q(3.2, 15, 'Sonitpur, Assam', 26.62, 92.79, hoursAgo(39), 'NCS'),
  Q(4.3, 22, 'Doda, Jammu region', 33.15, 75.55, hoursAgo(45), 'NCS', true),
  Q(3.1, 12, 'Mandya, Karnataka (shield zone)', 12.52, 76.9, hoursAgo(52), 'NCS'),
  Q(4.9, 35, 'Lunglei, Mizoram', 22.87, 92.76, hoursAgo(60), 'NCS', true),
  Q(2.7, 6, 'Roorkee, Uttarakhand (reservoir-induced)', 29.85, 77.89, hoursAgo(70), 'NCS'),
]

// India seismic zone classification (BIS IS 1893): II (low) .. V (very high)
export const SEISMIC_ZONES = [
  { zone: 'Zone V', level: 'Very High', pga: '0.36g', regions: 'Himalayan belt, NE India, Kutch', color: '#EF4444' },
  { zone: 'Zone IV', level: 'High', pga: '0.24g', regions: 'Indo-Gangetic, Bihar foothills', color: '#F97316' },
  { zone: 'Zone III', level: 'Moderate', pga: '0.16g', regions: 'Punjab, Maharashtra, West Bengal', color: '#EAB308' },
  { zone: 'Zone II', level: 'Low', pga: '0.10g', regions: 'Southern peninsula shield', color: '#22C55E' },
]

export const SEISMIC_DISCLAIMER =
  'Earthquakes cannot currently be predicted. EcoSentinel AI provides real-time seismic monitoring, historical trend analysis, seismic zone mapping and early notification using data from the National Center for Seismology (NCS) and the USGS earthquake feed.'