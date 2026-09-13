// Critical Infrastructure registry — dams, hospitals, schools, power plants,
// railways, highways, airports. Each asset carries a hazard-exposure risk
// score + tier, surfaced on the map and the Infrastructure page.

import { scoreBand } from '../lib/risk.js'

export const INFRA_CATEGORIES = [
  { key: 'dam', label: 'Dam', icon: 'Waves' },
  { key: 'hospital', label: 'Hospital', icon: 'Cross' },
  { key: 'school', label: 'School', icon: 'GraduationCap' },
  { key: 'power', label: 'Power Plant', icon: 'Zap' },
  { key: 'railway', label: 'Railway', icon: 'TrainFront' },
  { key: 'highway', label: 'Highway', icon: 'Route' },
  { key: 'airport', label: 'Airport', icon: 'Plane' },
]

let s = 30
const B = (category, name, state, district, lat, lng, risk, capacity, detail) => ({
  id: `INF-${s++}`,
  category,
  name,
  state,
  district,
  lat,
  lng,
  risk,
  tier: scoreBand(risk).level,
  capacity,
  detail,
  status: risk >= 75 ? 'critical' : risk >= 55 ? 'watch' : 'normal',
})

export const INFRASTRUCTURE = [
  // Dams
  B('dam', 'Koyna Dam', 'Maharashtra', 'Satara', 17.4, 73.75, 55, '2,797 Mm³', 'Hydro + seismic monitoring zone'),
  B('dam', 'Indira Sagar Dam', 'Madhya Pradesh', 'Khandwa', 22.28, 76.47, 40, '12,220 Mm³', 'Narmada basin'),
  B('dam', 'Hirakud Dam', 'Orissa', 'Sambalpur', 21.54, 83.87, 82, '7,190 Mm³', 'Mahanadi flood control'),
  B('dam', 'Tehri Dam', 'Uttaranchal', 'Tehri Garhwal', 30.38, 78.48, 68, '2,600 Mm³', 'High seismic zone'),
  B('dam', 'Sardar Sarovar Dam', 'Gujarat', 'Narmada', 21.83, 73.75, 38, '9,500 Mm³', 'Narmada irrigation'),
  B('dam', 'Mettur Dam', 'Tamil Nadu', 'Salem', 11.8, 77.8, 48, '2,650 Mm³', 'Cauvery basin storage'),
  B('dam', 'Bhakra Dam', 'Himachal Pradesh', 'Bilaspur', 31.41, 76.43, 45, '9,340 Mm³', 'Sutlej hydro'),
  B('dam', 'Mullaperiyar Dam', 'Kerala', 'Idukki', 9.53, 77.14, 78, '1,155 Mm³', 'Aging structure — landslide zone'),
  // Hospitals
  B('hospital', 'AIIMS New Delhi', 'Delhi', 'New Delhi', 28.57, 77.21, 72, '2,500 beds', 'Apex referral'),
  B('hospital', 'PGIMER Chandigarh', 'Chandigarh', 'Chandigarh', 30.77, 76.78, 40, '2,000 beds', 'North referral'),
  B('hospital', 'KEM Hospital', 'Maharashtra', 'Mumbai Suburban', 19.02, 72.84, 62, '1,800 beds', 'Coastal flood exposure'),
  B('hospital', 'CMC Vellore', 'Tamil Nadu', 'Vellore', 12.92, 79.13, 45, '2,600 beds', 'Tertiary care'),
  B('hospital', 'NIMHANS Bengaluru', 'Karnataka', 'Bengaluru Urban', 12.94, 77.59, 35, '980 beds', 'Neuro centre'),
  B('hospital', 'JIPMER Puducherry', 'Puducherry', 'Puducherry', 11.96, 79.81, 58, '2,400 beds', 'Coastal campus'),
  B('hospital', 'SGPGI Lucknow', 'Uttar Pradesh', 'Lucknow', 26.76, 80.92, 50, '1,200 beds', 'Trauma referral'),
  // Schools
  B('school', 'Govt. HSS Vijaynagar', 'Assam', 'Dibrugarh', 27.47, 94.92, 88, '800 students', 'Flood-prone campus'),
  B('school', 'Zilla Parishad School', 'Bihar', 'Patna', 25.59, 85.14, 74, '650 students', 'Low-lying district'),
  B('school', 'Kendriya Vidyalaya', 'Orissa', 'Puri', 19.81, 85.83, 80, '900 students', 'Cyclone corridor'),
  B('school', 'Municipal School', 'Maharashtra', 'Mumbai Suburban', 19.08, 72.88, 60, '1,100 students', 'Urban flood zone'),
  B('school', 'Govt. Model School', 'Jammu and Kashmir', 'Ramban', 33.24, 75.24, 85, '420 students', 'Landslide-prone slope'),
  // Power plants
  B('power', 'Tarapur Atomic Power', 'Maharashtra', 'Palghar', 19.83, 72.65, 58, '1,400 MW', 'Coastal facility'),
  B('power', 'Kudankulam NPP', 'Tamil Nadu', 'Tirunelveli', 8.17, 77.71, 62, '2,000 MW', 'Coastal + cyclone exposure'),
  B('power', 'Kaiga Generating Station', 'Karnataka', 'Uttara Kannada', 14.87, 74.44, 42, '1,200 MW', 'Nuclear — Western Ghats'),
  B('power', 'Mundra Ultra Mega Power', 'Gujarat', 'Kutch', 22.86, 69.71, 40, '4,000 MW', 'Coal import terminal'),
  B('power', 'Vindhyachal STPS', 'Madhya Pradesh', 'Singrauli', 24.1, 82.68, 46, '4,760 MW', 'Super thermal'),
  B('power', 'Rihand STPS', 'Uttar Pradesh', 'Sonbhadra', 24.2, 83.03, 44, '3,000 MW', 'Thermal corridor'),
  // Railways
  B('railway', 'Howrah Junction', 'West Bengal', 'Howrah', 22.58, 88.34, 66, 'Daily 1M+ pax', 'Flood-exposed marshalling'),
  B('railway', 'CSMT Mumbai', 'Maharashtra', 'Mumbai', 18.94, 72.84, 58, 'Heritage terminal', 'Coastal flooding risk'),
  B('railway', 'New Delhi Station', 'Delhi', 'New Delhi', 28.64, 77.22, 44, '400+ trains/day', 'Central corridor'),
  B('railway', 'Chennai Central', 'Tamil Nadu', 'Chennai', 13.08, 80.28, 65, 'Major terminal', 'Storm-surge exposure'),
  B('railway', 'Secunderabad Jn', 'Andhra Pradesh', 'Hyderabad', 17.44, 78.5, 36, 'Hub station', 'Deccan plateau'),
  // Highways
  B('highway', 'NH-44 (Jammu–Srinagar)', 'Jammu and Kashmir', 'Ramban', 33.24, 75.24, 84, 'Strategic link', 'Landslide + winter closure'),
  B('highway', 'Mumbai–Pune Expressway', 'Maharashtra', 'Raigad', 18.8, 73.36, 70, '65M veh/year', 'Ghat landslide sections'),
  B('highway', 'NH-37 (Silchar–Guwahati)', 'Assam', 'Nagaon', 26.34, 92.68, 82, 'Lifeline highway', 'Monsoon submersion'),
  B('highway', 'NH-48 (Delhi–Jaipur)', 'Rajasthan', 'Gurgaon', 28.46, 77.03, 30, 'Express corridor', 'Heatwave operations'),
  B('highway', 'East Coast Rd (Chennai–Puducherry)', 'Tamil Nadu', 'Chengalpattu', 12.7, 80.02, 74, 'Tourist + critical route', 'Cyclone surge zone'),
  // Airports
  B('airport', 'IGI Airport Delhi', 'Delhi', 'New Delhi', 28.56, 77.1, 42, '70M pax/yr', 'Air pollution ops'),
  B('airport', 'CSMIA Mumbai', 'Maharashtra', 'Mumbai Suburban', 19.09, 72.87, 64, '48M pax/yr', 'Coastal flooding'),
  B('airport', 'Kempegowda Bengaluru', 'Karnataka', 'Bengaluru Rural', 13.2, 77.71, 34, '33M pax/yr', 'Plateau ops'),
  B('airport', 'Chennai Intl', 'Tamil Nadu', 'Chennai', 12.99, 80.17, 68, '22M pax/yr', 'Storm surge closure risk'),
  B('airport', 'Kolkata Netaji Subhas', 'West Bengal', 'Kolkata', 22.65, 88.45, 56, '26M pax/yr', 'Delta drainage'),
]

export const INFRA_AT_RISK = INFRASTRUCTURE.filter((a) => a.risk >= 55).sort((a, b) => b.risk - a.risk)