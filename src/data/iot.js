// IoT sensor fleet — ESP32 gateway + distributed water/air/rain/temperature/GPS
// nodes. LiveDataContext drifts `lastReading`/`battery`/`signal` on a ticker.

export const IOT_TYPES = [
  { key: 'gateway', label: 'ESP32 Gateway', icon: 'Router' },
  { key: 'water', label: 'Water Sensor', icon: 'Droplets' },
  { key: 'air', label: 'Air Sensor', icon: 'CloudFog' },
  { key: 'rain', label: 'Rain Gauge', icon: 'CloudRain' },
  { key: 'temp', label: 'Temperature', icon: 'Thermometer' },
  { key: 'gps', label: 'GPS Module', icon: 'MapPin' },
]

let s = 900
const N = (type, name, state, district, lat, lng, status, battery, signal, reading, unit) => ({
  id: `NODE-${s++}`,
  type,
  name,
  state,
  district,
  lat,
  lng,
  status, // online | offline
  battery, // %
  signal, // dBm (RSSI)
  reading,
  unit,
})

export const IOT_NODES = [
  // Gateways (ESP32)
  N('gateway', 'Assam Gateway-01', 'Assam', 'Dibrugarh', 27.47, 94.92, 'online', 88, -52, 142, 'nodes'),
  N('gateway', 'Odisha Gateway-01', 'Orissa', 'Puri', 19.81, 85.83, 'online', 91, -48, 96, 'nodes'),
  N('gateway', 'Himalaya Gateway-01', 'Uttaranchal', 'Dehradun', 30.32, 78.03, 'online', 76, -61, 74, 'nodes'),
  N('gateway', 'Western Gateway-01', 'Maharashtra', 'Pune', 18.52, 73.86, 'online', 84, -55, 118, 'nodes'),
  N('gateway', 'Thar Gateway-01', 'Rajasthan', 'Jodhpur', 26.24, 73.02, 'offline', 12, -94, 0, 'nodes'),
  N('gateway', 'Delta Gateway-01', 'West Bengal', 'Kolkata', 22.57, 88.36, 'online', 69, -66, 88, 'nodes'),
  // Water sensors
  N('water', 'WS-Brahmaputra-07', 'Assam', 'Dibrugarh', 27.48, 94.9, 'online', 82, -58, 8.4, 'pH'),
  N('water', 'WS-Mahanadi-02', 'Orissa', 'Sambalpur', 21.54, 83.87, 'online', 77, -63, 412, 'TDS'),
  N('water', 'WS-Narmada-11', 'Gujarat', 'Bharuch', 21.7, 72.96, 'online', 90, -49, 7.1, 'pH'),
  N('water', 'WS-Ganga-19', 'Uttar Pradesh', 'Varanasi', 25.32, 83.01, 'offline', 9, -97, 0, 'TDS'),
  N('water', 'WS-Cauvery-04', 'Tamil Nadu', 'Mettur', 11.8, 77.8, 'online', 68, -71, 6.8, 'pH'),
  N('water', 'WS-Periyar-03', 'Kerala', 'Idukki', 9.85, 76.98, 'online', 71, -60, 388, 'TDS'),
  // Air sensors
  N('air', 'AQ-Delhi-01', 'Delhi', 'New Delhi', 28.61, 77.21, 'online', 85, -54, 341, 'AQI'),
  N('air', 'AQ-Mumbai-02', 'Maharashtra', 'Mumbai Suburban', 19.08, 72.88, 'online', 79, -57, 168, 'AQI'),
  N('air', 'AQ-Lucknow-01', 'Uttar Pradesh', 'Lucknow', 26.85, 80.95, 'online', 83, -60, 212, 'AQI'),
  N('air', 'AQ-Patna-01', 'Bihar', 'Patna', 25.59, 85.14, 'offline', 15, -90, 0, 'AQI'),
  N('air', 'AQ-Bengaluru-03', 'Karnataka', 'Bengaluru Urban', 12.97, 77.59, 'online', 74, -66, 96, 'AQI'),
  N('air', 'AQ-Kanpur-02', 'Uttar Pradesh', 'Kanpur', 26.45, 80.33, 'online', 66, -73, 188, 'AQI'),
  // Rain gauges
  N('rain', 'RG-Assam-02', 'Assam', 'Dibrugarh', 27.46, 94.91, 'online', 88, -51, 34.2, 'mm'),
  N('rain', 'RG-Kerala-01', 'Kerala', 'Idukki', 9.86, 76.97, 'online', 80, -56, 58.7, 'mm'),
  N('rain', 'RG-Maharashtra-04', 'Maharashtra', 'Pune', 18.51, 73.85, 'online', 73, -64, 12.3, 'mm'),
  N('rain', 'RG-Odisha-03', 'Orissa', 'Puri', 19.8, 85.82, 'online', 91, -47, 41.8, 'mm'),
  N('rain', 'RG-Rajasthan-01', 'Rajasthan', 'Jodhpur', 26.25, 73.03, 'offline', 20, -92, 0, 'mm'),
  // Temperature sensors
  N('temp', 'TS-Rajasthan-02', 'Rajasthan', 'Bikaner', 28.03, 73.32, 'online', 87, -53, 46.1, '°C'),
  N('temp', 'TS-Delhi-01', 'Delhi', 'New Delhi', 28.62, 77.2, 'online', 84, -55, 41.3, '°C'),
  N('temp', 'TS-JK-03', 'Jammu and Kashmir', 'Srinagar', 34.08, 74.8, 'online', 70, -68, -2.4, '°C'),
  N('temp', 'TS-MP-01', 'Madhya Pradesh', 'Bhopal', 23.26, 77.41, 'online', 82, -59, 39.7, '°C'),
  N('temp', 'TS-HP-02', 'Himachal Pradesh', 'Shimla', 31.1, 77.17, 'online', 65, -72, 6.8, '°C'),
  // GPS modules
  N('gps', 'GPS-Rescue-UAV-01', 'Orissa', 'Puri', 19.82, 85.84, 'online', 95, -41, 22.3, 'km/h'),
  N('gps', 'GPS-Boat-02', 'Assam', 'Dibrugarh', 27.49, 94.93, 'online', 90, -46, 8.1, 'km/h'),
  N('gps', 'GPS-Relief-Van-03', 'Bihar', 'Patna', 25.6, 85.15, 'online', 77, -62, 44.5, 'km/h'),
  N('gps', 'GPS-Drone-01', 'Uttaranchal', 'Dehradun', 30.31, 78.02, 'online', 60, -69, 51.8, 'km/h'),
  N('gps', 'GPS-Team-04', 'Maharashtra', 'Pune', 18.53, 73.87, 'offline', 5, -98, 0, 'km/h'),
]

export function iotSummary(nodes = IOT_NODES) {
  const online = nodes.filter((n) => n.status === 'online').length
  const gateways = nodes.filter((n) => n.type === 'gateway')
  const lowBattery = nodes.filter((n) => n.battery < 20).length
  const weakSignal = nodes.filter((n) => n.signal < -80).length
  return { total: nodes.length, online, offline: nodes.length - online, gateways: gateways.length, lowBattery, weakSignal }
}