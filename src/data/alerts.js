// Seed alert feed. Timestamps are generated relative to "now" so the command
// center always looks live. LiveDataContext appends occasional new alerts on top.

import { hoursAgo, minsAgo } from '../lib/format.js'

let seq = 100
const A = (severity, hazard, title, state, district, lat, lng, time, source = 'EcoSentinel AI') => ({
  id: `ALT-${seq++}`,
  severity, // 1 low .. 4 critical
  hazard,
  title,
  state,
  district,
  lat,
  lng,
  time,
  source,
  status: 'active',
})

export const ALERTS = [
  A(4, 'flood', 'Severe flood warning — Brahmaputra above danger mark', 'Assam', 'Dibrugarh', 27.47, 94.92, minsAgo(12)),
  A(4, 'cyclone', 'Cyclone intensifying in Bay of Bengal, landfall watch', 'Orissa', 'Puri', 19.81, 85.83, hoursAgo(1)),
  A(4, 'fire', 'Large forest fire detected in Bandhavgarh range', 'Madhya Pradesh', 'Umaria', 23.53, 80.83, minsAgo(38)),
  A(3, 'heatwave', 'Heatwave alert — temperatures to cross 45°C', 'Rajasthan', 'Bikaner', 28.03, 73.32, hoursAgo(3)),
  A(3, 'landslide', 'Landslide blocks NH-44 near Ramban', 'Jammu and Kashmir', 'Ramban', 33.24, 75.24, hoursAgo(2)),
  A(4, 'flood', 'Urban flooding reported in low-lying wards', 'Maharashtra', 'Mumbai Suburban', 19.08, 72.88, minsAgo(22)),
  A(3, 'airPollution', 'AQI spikes to Severe in NCR corridor', 'Delhi', 'New Delhi', 28.61, 77.21, hoursAgo(4)),
  A(4, 'earthquake', 'Seismic event recorded — M5.2 near Nepal border (monitoring)', 'Bihar', 'Sitamarhi', 26.60, 85.48, minsAgo(55), 'NCS'),
  A(3, 'drought', 'Reservoir storage below 30% — drought stress rising', 'Andhra Pradesh', 'Anantapur', 14.68, 77.60, hoursAgo(6)),
  A(3, 'coldWave', 'Cold wave advisory for upper districts', 'Uttaranchal', 'Uttarkashi', 30.73, 78.44, hoursAgo(5)),
  A(2, 'waterPollution', 'Industrial effluent discharge detected in tributary', 'Gujarat', 'Vadodara', 22.31, 73.18, hoursAgo(7)),
  A(3, 'fire', 'Crop-residue fire cluster detected via satellite hotspot', 'Punjab', 'Ludhiana', 30.90, 75.85, hoursAgo(2)),
  A(4, 'flood', 'Dam discharge increasing — downstream evacuation advisory', 'Kerala', 'Idukki', 9.85, 76.98, minsAgo(8)),
  A(3, 'cyclone', 'Storm surge warning for coastal mandals', 'Andhra Pradesh', 'Visakhapatnam', 17.69, 83.22, hoursAgo(3)),
  A(2, 'landslide', 'Crack line observed on hillslope — monitoring', 'Sikkim', 'North Sikkim', 27.33, 88.61, hoursAgo(9)),
  A(3, 'heatwave', 'Heat stress advisory for urban centres', 'Uttar Pradesh', 'Varanasi', 25.32, 83.01, hoursAgo(4)),
  A(3, 'drought', 'Groundwater depletion accelerating in Malwa belt', 'Madhya Pradesh', 'Ujjain', 23.18, 75.78, hoursAgo(10)),
  A(4, 'flood', 'River breaching embankment near char areas', 'West Bengal', 'Malda', 25.01, 88.14, minsAgo(31)),
  A(2, 'airPollution', 'Industrial emissions exceed permitted limits', 'Jharkhand', 'Dhanbad', 23.80, 86.43, hoursAgo(8)),
  A(3, 'fire', 'Forest fire proximity alert — fringe village at risk', 'Chhattisgarh', 'Kanker', 20.25, 81.49, hoursAgo(3)),
  A(3, 'earthquake', 'Aftershock sequence recorded M3.8 (monitoring)', 'Arunachal Pradesh', 'Pasighat', 28.07, 95.33, hoursAgo(6), 'USGS'),
  A(2, 'coldWave', 'Fog-related transport advisory issued', 'Punjab', 'Amritsar', 31.63, 74.87, hoursAgo(5)),
  A(4, 'cyclone', 'Evacuation of coastal fisherfolk initiated', 'Tamil Nadu', 'Nagapattinam', 10.77, 79.84, minsAgo(16)),
  A(3, 'waterPollution', 'Algal bloom detected in reservoir water body', 'Karnataka', 'Mysore', 12.30, 76.64, hoursAgo(11)),
  A(2, 'drought', 'Fodder scarcity reported in rain-fed blocks', 'Rajasthan', 'Jodhpur', 26.24, 73.02, hoursAgo(9)),
  A(3, 'landslide', 'Road cut off after slope failure, traffic diverted', 'Uttaranchal', 'Rudraprayag', 30.28, 78.98, hoursAgo(4)),
]

export const SEVERITY_META = {
  1: { label: 'LOW', color: '#22C55E' },
  2: { label: 'MODERATE', color: '#EAB308' },
  3: { label: 'HIGH', color: '#F97316' },
  4: { label: 'CRITICAL', color: '#EF4444' },
}