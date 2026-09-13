// State/UT intelligence seed data. Scores are 0–100 per hazard and are
// geo-informed (coastal → cyclone, Himalayan → landslide/quake, Thar → heat/drought).
// Keys MUST match `NAME_1` in public/data/india-states.geojson.

import { HAZARD_KEYS, overallScore } from '../lib/risk.js'
import { randInt, rng } from '../lib/prng.js'
import { ehiScore, ehiGrade } from '../lib/ehi.js'

// [name, type, capital, population(lakhs), [11 hazard scores in HAZARD_KEYS order]]
const ROWS = [
  ['Andaman and Nicobar', 'Union Territory', 'Port Blair', 4, [55, 92, 25, 5, 70, 35, 20, 30, 25, 40, 45]],
  ['Andhra Pradesh', 'State', 'Amaravati', 540, [70, 75, 80, 5, 20, 15, 30, 55, 45, 75, 50]],
  ['Arunachal Pradesh', 'State', 'Itanagar', 15, [55, 25, 10, 30, 75, 90, 45, 25, 20, 25, 40]],
  ['Assam', 'State', 'Dispur', 350, [95, 35, 30, 25, 70, 55, 40, 45, 60, 35, 55]],
  ['Bihar', 'State', 'Patna', 1290, [88, 25, 70, 60, 55, 30, 15, 70, 65, 70, 60]],
  ['Chandigarh', 'Union Territory', 'Chandigarh', 12, [25, 10, 60, 55, 40, 10, 10, 65, 45, 40, 30]],
  ['Chhattisgarh', 'State', 'Raipur', 300, [40, 30, 75, 25, 30, 40, 60, 45, 40, 65, 40]],
  ['Dadra and Nagar Haveli', 'Union Territory', 'Silvassa', 4, [45, 50, 65, 10, 25, 20, 30, 40, 35, 50, 30]],
  ['Daman and Diu', 'Union Territory', 'Daman', 2, [50, 70, 60, 10, 25, 15, 20, 40, 35, 45, 35]],
  ['Delhi', 'Union Territory', 'New Delhi', 190, [45, 10, 80, 65, 45, 10, 15, 95, 80, 55, 85]],
  ['Goa', 'State', 'Panaji', 15, [65, 55, 50, 5, 30, 45, 35, 40, 40, 45, 40]],
  ['Gujarat', 'State', 'Gandhinagar', 640, [60, 78, 75, 10, 45, 20, 25, 55, 50, 88, 60]],
  ['Haryana', 'State', 'Chandigarh', 300, [50, 15, 78, 60, 40, 10, 20, 72, 60, 62, 45]],
  ['Himachal Pradesh', 'State', 'Shimla', 75, [55, 15, 20, 55, 80, 88, 40, 35, 30, 35, 45]],
  ['Jammu and Kashmir', 'Union Territory', 'Srinagar', 130, [60, 15, 15, 75, 88, 92, 35, 30, 30, 30, 50]],
  ['Jharkhand', 'State', 'Ranchi', 390, [45, 25, 72, 45, 40, 45, 50, 50, 40, 70, 40]],
  ['Karnataka', 'State', 'Bengaluru', 680, [60, 55, 65, 10, 30, 50, 38, 42, 40, 75, 48]],
  ['Kerala', 'State', 'Thiruvananthapuram', 355, [88, 60, 55, 5, 40, 78, 35, 38, 40, 30, 55]],
  ['Lakshadweep', 'Union Territory', 'Kavaratti', 1, [40, 85, 40, 5, 30, 10, 5, 25, 20, 40, 25]],
  ['Madhya Pradesh', 'State', 'Bhopal', 850, [50, 30, 82, 35, 35, 30, 55, 45, 45, 78, 45]],
  ['Maharashtra', 'State', 'Mumbai', 1260, [70, 50, 72, 10, 35, 55, 40, 58, 52, 80, 62]],
  ['Manipur', 'State', 'Imphal', 32, [60, 30, 25, 30, 72, 80, 45, 30, 30, 30, 40]],
  ['Meghalaya', 'State', 'Shillong', 33, [65, 30, 20, 30, 75, 78, 40, 30, 30, 30, 40]],
  ['Mizoram', 'State', 'Aizawl', 12, [55, 30, 20, 25, 70, 85, 42, 28, 25, 30, 38]],
  ['Nagaland', 'State', 'Kohima', 22, [55, 30, 20, 25, 70, 82, 40, 30, 28, 30, 38]],
  ['Orissa', 'State', 'Bhubaneswar', 470, [82, 88, 72, 10, 25, 25, 45, 50, 45, 62, 55]],
  ['Puducherry', 'Union Territory', 'Puducherry', 16, [50, 65, 60, 5, 25, 15, 15, 45, 40, 50, 40]],
  ['Punjab', 'State', 'Chandigarh', 310, [55, 15, 72, 60, 40, 15, 20, 62, 68, 60, 40]],
  ['Rajasthan', 'State', 'Jaipur', 820, [35, 35, 92, 30, 30, 15, 25, 55, 55, 92, 45]],
  ['Sikkim', 'State', 'Gangtok', 7, [60, 20, 10, 45, 85, 90, 40, 25, 25, 25, 40]],
  ['Tamil Nadu', 'State', 'Chennai', 780, [70, 80, 72, 5, 25, 35, 35, 48, 45, 72, 52]],
  ['Tripura', 'State', 'Agartala', 40, [60, 35, 30, 25, 70, 70, 40, 32, 30, 32, 40]],
  ['Uttar Pradesh', 'State', 'Lucknow', 2350, [72, 30, 80, 55, 45, 20, 25, 68, 65, 68, 55]],
  ['Uttaranchal', 'State', 'Dehradun', 110, [62, 15, 15, 60, 82, 90, 45, 32, 30, 30, 45]],
  ['West Bengal', 'State', 'Kolkata', 990, [85, 82, 68, 20, 55, 55, 35, 62, 60, 55, 60]],
]

const ALIAS = {
  Orissa: 'Odisha',
  Uttaranchal: 'Uttarakhand',
  Delhi: 'Delhi NCR',
}

export const STATES = ROWS.map(([name, type, capital, popLakh, arr]) => {
  const scores = Object.fromEntries(HAZARD_KEYS.map((k, i) => [k, arr[i]]))
  const overall = overallScore(scores)
  const ehi = ehiScore(scores)
  const r = rng(name)
  const spark = Array.from({ length: 12 }, (_, i) =>
    Math.round(overall + Math.sin(i / 1.8 + r() * 6) * 8 + (r() - 0.5) * 10),
  )
  return {
    name,
    label: ALIAS[name] || name,
    type,
    capital,
    population: popLakh * 100000,
    populationLakh: popLakh,
    scores,
    overall,
    ehi,
    ehiGrade: ehiGrade(ehi).label,
    alerts: randInt(name + '|alerts', Math.floor(overall / 9), Math.ceil(overall / 3.5)),
    spark,
  }
})

export const STATE_MAP = Object.fromEntries(STATES.map((s) => [s.name, s]))

export function stateByName(name) {
  return STATE_MAP[name] || null
}

// lookup tolerant of aliases (Odisha → Orissa, etc.)
export function findState(q) {
  const lq = q.trim().toLowerCase()
  return STATES.find(
    (s) => s.name.toLowerCase() === lq || s.label.toLowerCase() === lq,
  )
}

export function nationalAggregate() {
  const n = STATES.length
  const totalAlerts = STATES.reduce((a, s) => a + s.alerts, 0)
  const critical = STATES.filter((s) => s.overall >= 75).length
  const high = STATES.filter((s) => s.overall >= 55 && s.overall < 75).length
  const top = [...STATES].sort((a, b) => b.overall - a.overall).slice(0, 5)
  return { totalAlerts, critical, high, top, n }
}