// Citizen-submitted incident reports. AI auto-classifies each into a hazard
// category with a confidence + severity. Coordinates are approximate.

import { hoursAgo, minsAgo } from '../lib/format.js'

let s = 500
const I = (type, title, desc, lat, lng, state, district, status, confidence, severity, time) => ({
  id: `CR-${s++}`,
  type, // flood | fire | pollution | landslide | other
  title,
  desc,
  lat,
  lng,
  state,
  district,
  status, // verified | review | dispatched
  confidence,
  severity, // 1..4
  time,
  reporter: 'Citizen',
})

export const INCIDENTS = [
  I('flood', 'Water entered housing colony', 'Ankle-deep water accumulating near the canal after heavy rain; drainage blocked.', 26.85, 80.95, 'Uttar Pradesh', 'Lucknow', 'verified', 0.94, 3, minsAgo(18)),
  I('fire', 'Smoke visible on hill slope', 'Dense smoke rising from scrub forest behind the village, spreading towards huts.', 12.97, 77.59, 'Karnataka', 'Bengaluru Rural', 'verified', 0.89, 3, minsAgo(27)),
  I('pollution', 'Foam in river stretch', 'White foam and strong chemical smell on the river surface near industrial outlet.', 22.31, 73.18, 'Gujarat', 'Vadodara', 'review', 0.82, 2, hoursAgo(1)),
  I('flood', 'Road submerged', 'Village link road completely submerged; tractors unable to pass.', 25.59, 85.14, 'Bihar', 'Patna', 'dispatched', 0.96, 4, minsAgo(9)),
  I('landslide', 'Rocks falling near highway', 'Loose boulders rolling onto the national highway; traffic stopped.', 30.32, 78.03, 'Uttaranchal', 'Dehradun', 'verified', 0.77, 3, hoursAgo(2)),
  I('other', 'Unusual animal migration', 'Large herd moving away from forest, possibly sensing ground disturbance.', 23.34, 85.31, 'Jharkhand', 'Ranchi', 'review', 0.55, 1, hoursAgo(3)),
  I('fire', 'Crop residue burning', 'Thick smoke from farmland after harvest; visibility reduced.', 30.90, 75.85, 'Punjab', 'Ludhiana', 'verified', 0.91, 2, minsAgo(42)),
  I('flood', 'River overflowing', 'River has breached the bank near the temple ghat; homes at risk downstream.', 20.30, 85.82, 'Orissa', 'Bhubaneswar', 'dispatched', 0.95, 4, minsAgo(14)),
  I('pollution', 'Black smoke from factory', 'Continuous black plume from chimney since morning.', 26.45, 80.33, 'Uttar Pradesh', 'Kanpur', 'review', 0.8, 2, hoursAgo(2)),
  I('landslide', 'Slope crack', 'Fresh crack ~2m wide along the slope above the settlement.', 31.10, 77.17, 'Himachal Pradesh', 'Shimla', 'verified', 0.74, 3, hoursAgo(4)),
  I('flood', 'School playground inundated', 'Water logged around school; children moved to higher floor.', 13.08, 80.27, 'Tamil Nadu', 'Chennai', 'verified', 0.9, 3, minsAgo(33)),
  I('fire', 'Forest fire near camp', 'Fire line advancing ~1km from the eco-tourism camp.', 20.25, 81.49, 'Chhattisgarh', 'Kanker', 'dispatched', 0.88, 4, minsAgo(51)),
  I('pollution', 'Garbage dumped in wetland', 'Fresh garbage mounds dumped near the wetland edge.', 19.08, 72.88, 'Maharashtra', 'Mumbai Suburban', 'review', 0.7, 2, hoursAgo(5)),
  I('flood', 'Embankment leak', 'Water seeping through a weak point in the earthen embankment.', 25.01, 88.14, 'West Bengal', 'Malda', 'dispatched', 0.92, 4, minsAgo(22)),
  I('other', 'Dead fish in lake', 'Several dead fish floating; cause unknown, possible contamination.', 17.38, 78.49, 'Andhra Pradesh', 'Hyderabad', 'review', 0.6, 2, hoursAgo(3)),
]

export const INCIDENT_TYPES = [
  { key: 'flood', label: 'Flood' },
  { key: 'fire', label: 'Fire' },
  { key: 'pollution', label: 'Pollution' },
  { key: 'landslide', label: 'Landslide' },
  { key: 'other', label: 'Other' },
]