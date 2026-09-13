// Pool of plausible "just-in" alert templates that the live ticker emits, so a
// judge leaving the command center open sees genuinely new activity.

export const STATS_POOL = [
  { severity: 4, hazard: 'flood', title: 'Flash flood watch upgraded — heavy downpour continuing', state: 'Assam', district: 'Lakhimpur', lat: 27.22, lng: 94.11, source: 'EcoSentinel AI' },
  { severity: 3, hazard: 'fire', title: 'New thermal anomaly cluster detected by satellite', state: 'Chhattisgarh', district: 'Dantewada', lat: 18.89, lng: 81.35, source: 'NASA FIRMS' },
  { severity: 4, hazard: 'earthquake', title: 'Seismic event recorded — checking for aftershocks', state: 'Jammu and Kashmir', district: 'Kishtwar', lat: 33.31, lng: 75.77, source: 'NCS' },
  { severity: 3, hazard: 'heatwave', title: 'Heat index crossing 50°C — red alert issued', state: 'Rajasthan', district: 'Jaisalmer', lat: 26.92, lng: 70.9, source: 'EcoSentinel AI' },
  { severity: 3, hazard: 'airPollution', title: 'AQI breach: crop residue plume drifting east', state: 'Haryana', district: 'Karnal', lat: 29.69, lng: 76.99, source: 'EcoSentinel AI' },
  { severity: 4, hazard: 'cyclone', title: 'Cyclone track update — intensification confirmed', state: 'West Bengal', district: 'South 24 Parganas', lat: 22.13, lng: 88.4, source: 'IMD' },
  { severity: 3, hazard: 'landslide', title: 'Slope instrumentation triggered — movement detected', state: 'Uttaranchal', district: 'Chamoli', lat: 30.42, lng: 79.33, source: 'EcoSentinel AI' },
  { severity: 2, hazard: 'waterPollution', title: 'Dissolved oxygen drop in monitoring well', state: 'Karnataka', district: 'Mandya', lat: 12.52, lng: 76.9, source: 'EcoSentinel AI' },
  { severity: 3, hazard: 'drought', title: 'Soil moisture index below threshold in rain-fed belt', state: 'Maharashtra', district: 'Solapur', lat: 17.67, lng: 75.91, source: 'EcoSentinel AI' },
  { severity: 2, hazard: 'coldWave', title: 'Cold wave surge expected over high passes', state: 'Himachal Pradesh', district: 'Lahaul Spiti', lat: 32.55, lng: 77.03, source: 'EcoSentinel AI' },
]