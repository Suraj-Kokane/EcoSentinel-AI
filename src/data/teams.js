// Emergency response teams & resource inventory for the Authority Command Center.

let t = 10
const T = (name, type, location, lat, lng, status, size, lead) => ({
  id: `TM-${t++}`,
  name,
  type, // ndrf | fire | medical | rescue
  location,
  lat,
  lng,
  status, // deployed | enroute | standby
  size,
  lead,
})

export const TEAMS = [
  T('NDRF 04 Battalion', 'ndrf', 'Guwahati, Assam', 26.14, 91.74, 'deployed', 58, 'Cdr. P. Sharma'),
  T('NDRF 09 Battalion', 'ndrf', 'Bhubaneswar, Odisha', 20.3, 85.82, 'deployed', 55, 'DIG A. Verma'),
  T('NDRF 05 Battalion', 'ndrf', 'Pune, Maharashtra', 18.52, 73.86, 'enroute', 52, 'DIG S. Rao'),
  T('State Fire Brigade Omega', 'fire', 'Bhopal, MP', 23.26, 77.41, 'deployed', 34, 'SO M. Khan'),
  T('Fire & Rescue Task-7', 'fire', 'Dehradun, Uttarakhand', 30.32, 78.03, 'enroute', 28, 'SO K. Negi'),
  T('Medical Rapid Response', 'medical', 'Patna, Bihar', 25.59, 85.14, 'deployed', 22, 'Dr. R. Singh'),
  T('Medical Relief Column', 'medical', 'Chennai, TN', 13.08, 80.27, 'standby', 26, 'Dr. L. Menon'),
  T('Mountain Rescue Team', 'rescue', 'Shimla, HP', 31.1, 77.17, 'enroute', 18, 'Lt. D. Thakur'),
  T('Flood Rescue Boat Unit', 'rescue', 'Kolkata, WB', 22.57, 88.36, 'deployed', 24, 'SI B. Das'),
  T('NDRF 07 Battalion (Water)', 'ndrf', 'Gandhinagar, Gujarat', 23.23, 72.65, 'standby', 48, 'DIG V. Patel'),
]

export const RESOURCES = {
  ndrfTeams: { total: 14, allocated: 7, available: 7 },
  ambulances: { total: 240, allocated: 128, available: 112 },
  boats: { total: 180, allocated: 136, available: 44 },
  shelters: { total: 620, allocated: 310, available: 310 },
  medicalTeams: { total: 42, allocated: 19, available: 23 },
  helicopters: { total: 12, allocated: 6, available: 6 },
}

export const TEAM_TYPES = {
  ndrf: { label: 'NDRF', color: '#F97316' },
  fire: { label: 'Fire Brigade', color: '#EF4444' },
  medical: { label: 'Medical', color: '#22D3EE' },
  rescue: { label: 'Rescue', color: '#22C55E' },
}