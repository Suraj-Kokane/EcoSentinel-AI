// Analytics series — disaster trends, prediction accuracy, pollution and EHI
// aggregate over the trailing 12 months (deterministic, demo-realistic).

export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

// active hazard events per month by type (index-aligned with MONTHS)
export const DISASTER_TREND = [
  { month: 'Oct', flood: 22, fire: 14, cyclone: 3, heatwave: 2, earthquake: 4, drought: 6, landslide: 5 },
  { month: 'Nov', flood: 18, fire: 18, cyclone: 4, heatwave: 1, earthquake: 3, drought: 5, landslide: 4 },
  { month: 'Dec', flood: 12, fire: 22, cyclone: 2, heatwave: 0, earthquake: 5, drought: 4, landslide: 6 },
  { month: 'Jan', flood: 9, fire: 28, cyclone: 1, heatwave: 0, earthquake: 3, drought: 3, landslide: 7 },
  { month: 'Feb', flood: 7, fire: 34, cyclone: 1, heatwave: 1, earthquake: 4, drought: 3, landslide: 6 },
  { month: 'Mar', flood: 6, fire: 41, cyclone: 1, heatwave: 6, earthquake: 2, drought: 6, landslide: 5 },
  { month: 'Apr', flood: 8, fire: 38, cyclone: 2, heatwave: 22, earthquake: 3, drought: 9, landslide: 4 },
  { month: 'May', flood: 14, fire: 29, cyclone: 3, heatwave: 38, earthquake: 4, drought: 12, landslide: 5 },
  { month: 'Jun', flood: 48, fire: 12, cyclone: 5, heatwave: 18, earthquake: 3, drought: 8, landslide: 9 },
  { month: 'Jul', flood: 72, fire: 8, cyclone: 4, heatwave: 6, earthquake: 5, drought: 4, landslide: 12 },
  { month: 'Aug', flood: 84, fire: 7, cyclone: 5, heatwave: 3, earthquake: 4, drought: 2, landslide: 11 },
  { month: 'Sep', flood: 66, fire: 11, cyclone: 6, heatwave: 5, earthquake: 5, drought: 3, landslide: 8 },
]

export const ACCURACY_TREND = [
  { month: 'Oct', flood: 84, fire: 78, cyclone: 71, drought: 66 },
  { month: 'Nov', flood: 85, fire: 79, cyclone: 73, drought: 67 },
  { month: 'Dec', flood: 86, fire: 81, cyclone: 74, drought: 68 },
  { month: 'Jan', flood: 87, fire: 82, cyclone: 76, drought: 70 },
  { month: 'Feb', flood: 88, fire: 83, cyclone: 77, drought: 71 },
  { month: 'Mar', flood: 88, fire: 84, cyclone: 78, drought: 73 },
  { month: 'Apr', flood: 89, fire: 85, cyclone: 79, drought: 74 },
  { month: 'May', flood: 90, fire: 86, cyclone: 81, drought: 76 },
  { month: 'Jun', flood: 91, fire: 87, cyclone: 82, drought: 77 },
  { month: 'Jul', flood: 92, fire: 89, cyclone: 83, drought: 79 },
  { month: 'Aug', flood: 93, fire: 90, cyclone: 85, drought: 80 },
  { month: 'Sep', flood: 94, fire: 91, cyclone: 86, drought: 81 },
]

export const POLLUTION_TREND = [
  { month: 'Oct', aqi: 212, pm25: 128 },
  { month: 'Nov', aqi: 278, pm25: 176 },
  { month: 'Dec', aqi: 302, pm25: 198 },
  { month: 'Jan', aqi: 288, pm25: 184 },
  { month: 'Feb', aqi: 226, pm25: 141 },
  { month: 'Mar', aqi: 172, pm25: 96 },
  { month: 'Apr', aqi: 148, pm25: 74 },
  { month: 'May', aqi: 132, pm25: 62 },
  { month: 'Jun', aqi: 96, pm25: 41 },
  { month: 'Jul', aqi: 82, pm25: 34 },
  { month: 'Aug', aqi: 88, pm25: 38 },
  { month: 'Sep', aqi: 134, pm25: 68 },
]

export const MONTHLY_REPORTS = [
  { title: 'National Environmental Risk — Sep 2026', status: 'published', date: '12 Sep 2026', size: '4.2 MB' },
  { title: 'Monsoon Flood Situation Report #4', status: 'released', date: '08 Sep 2026', size: '8.7 MB' },
  { title: 'AI Prediction Accuracy Review — Q3', status: 'released', date: '01 Sep 2026', size: '2.1 MB' },
  { title: 'Drought Mitigation Bulletin — Aug 2026', status: 'published', date: '25 Aug 2026', size: '5.4 MB' },
  { title: 'Seismic Monitoring Quarterly Digest', status: 'draft', date: '20 Aug 2026', size: '3.3 MB' },
]

// top hazards for a region — used by analytics ranking widget
export function hazardShare(scores) {
  const entries = Object.entries(scores).filter(([k]) => k !== 'overall')
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1
  return entries
    .map(([k, v]) => ({ key: k, value: v, pct: Math.round((v / total) * 100) }))
    .sort((a, b) => b.value - a.value)
}