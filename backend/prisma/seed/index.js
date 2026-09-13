// EcoSentinel AI — database seeder (parity with the frontend dataset).
// Idempotent: safe to run repeatedly. Usage: npm run seed
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- risk/EHI formulas (mirror frontend src/lib) ---------------------------
const HAZARD_KEYS = ['flood', 'cyclone', 'heatwave', 'coldWave', 'earthquake', 'landslide', 'fire', 'airPollution', 'waterPollution', 'drought', 'infrastructure']
const DISASTER_KEYS = ['flood', 'cyclone', 'heatwave', 'coldWave', 'earthquake', 'landslide', 'fire', 'drought']
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function overallScore(scores) {
  const vals = HAZARD_KEYS.map((k) => scores[k] ?? 0)
  const max = Math.max(...vals)
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.round(max * 0.55 + avg * 0.45)
}

function ehiScore(scores) {
  const airQ = clamp(100 - (scores.airPollution ?? 0), 0, 100)
  const waterQ = clamp(100 - (scores.waterPollution ?? 0), 0, 100)
  const disaster = DISASTER_KEYS.reduce((a, k) => a + (scores[k] ?? 0), 0) / DISASTER_KEYS.length
  const veg = clamp(100 - (scores.fire ?? 0) * 0.5 - (scores.drought ?? 0) * 0.5, 0, 100)
  const tempAnomaly = ((scores.heatwave ?? 0) + (scores.coldWave ?? 0)) / 2
  const temp = clamp(100 - tempAnomaly, 0, 100)
  return Math.round(0.25 * airQ + 0.2 * waterQ + 0.25 * (100 - disaster) + 0.15 * veg + 0.15 * temp)
}

// deterministic PRNG for district variance (mirror of frontend prng)
function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rng(seedStr) {
  let a = hashString(seedStr)
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const HOURS_AGO = (h) => new Date(Date.now() - h * 3600000)

// ---- import seed dataset ----------------------------------------------------
import { STATE_ROWS, ALERT_ROWS, REPORT_ROWS, SENSOR_ROWS, EARTHQUAKE_ROWS, FIRE_ROWS, AIR_QUALITY_ROWS, INFRA_ROWS } from './data.js'

const stateScoreKeys = {
  flood: 'floodRisk', cyclone: 'cycloneRisk', heatwave: 'heatwaveRisk', coldWave: 'coldWaveRisk',
  earthquake: 'earthquakeRisk', landslide: 'landslideRisk', fire: 'fireRisk',
  airPollution: 'pollutionRisk', waterPollution: 'waterPollutionRisk', drought: 'droughtRisk',
  infrastructure: 'infrastructureRisk',
}

function stateScores(arr) {
  const scores = {}
  HAZARD_KEYS.forEach((k, i) => (scores[k] = arr[i]))
  return scores
}

async function main() {
  console.log('🌱 Seeding EcoSentinel AI database…')

  // wipe in FK-safe order (idempotent re-seed)
  await prisma.sensorReading.deleteMany()
  await prisma.sensorNode.deleteMany()
  await prisma.citizenReport.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.district.deleteMany()
  await prisma.state.deleteMany()
  await prisma.earthquake.deleteMany()
  await prisma.fireHotspot.deleteMany()
  await prisma.weatherData.deleteMany()
  await prisma.airQuality.deleteMany()
  await prisma.infrastructure.deleteMany()
  await prisma.resourceDeployment.deleteMany()

  // ---- users --------------------------------------------------------------
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12)
  const mkUser = async (name, email, password, role) => {
    const hash = await bcrypt.hash(password, rounds)
    return prisma.user.upsert({
      where: { email },
      update: { name, password: hash, role },
      create: { name, email, password: hash, role },
    })
  }
  const admin = await mkUser('System Admin', process.env.SEED_ADMIN_EMAIL || 'admin@ecosentinel.in', process.env.SEED_ADMIN_PASSWORD || 'Admin@1234', 'ADMIN')
  await mkUser('State Authority', process.env.SEED_AUTHORITY_EMAIL || 'authority@ecosentinel.in', process.env.SEED_AUTHORITY_PASSWORD || 'Authority@1234', 'AUTHORITY')
  const citizen = await mkUser('Demo Citizen', process.env.SEED_CITIZEN_EMAIL || 'citizen@ecosentinel.in', process.env.SEED_CITIZEN_PASSWORD || 'Citizen@1234', 'CITIZEN')
  console.log('  ✓ users (admin / authority / citizen)')

  // ---- states -------------------------------------------------------------
  const stateMap = {} // name → prisma record
  for (const [name, , arr] of STATE_ROWS) {
    const scores = stateScores(arr)
    const row = {
      name,
      overallRisk: overallScore(scores),
      ehiScore: ehiScore(scores),
    }
    for (const [k, field] of Object.entries(stateScoreKeys)) row[field] = scores[k]
    stateMap[name] = await prisma.state.create({ data: row })
  }
  console.log(`  ✓ ${Object.keys(stateMap).length} states/UTs (12 hazard scores + EHI each)`)

  // ---- districts (from bundled GeoJSON) -------------------------------------
  const geoPath = join(__dirname, 'geo', 'india-districts.geojson')
  let districtCount = 0
  try {
    const geo = JSON.parse(readFileSync(geoPath, 'utf8'))
    for (const f of geo.features) {
      const stateName = f.properties.NAME_1
      const districtName = f.properties.NAME_2
      const state = stateMap[stateName]
      if (!state || !districtName) continue

      // deterministic district variance around the parent state baseline
      const r = rng(`${stateName}|${districtName}`)
      const dScores = {}
      HAZARD_KEYS.forEach((k) => {
        const base = state[stateScoreKeys[k]]
        const spread = ['flood', 'landslide', 'fire', 'drought', 'infrastructure'].includes(k) ? 26 : 16
        dScores[k] = Math.round(clamp(base + (r() - 0.5) * 2 * spread, 0, 100))
      })
      await prisma.district.create({
        data: {
          name: districtName,
          stateId: state.id,
          overallRisk: overallScore(dScores),
          ehiScore: ehiScore(dScores),
        },
      })
      districtCount += 1
    }
    console.log(`  ✓ ${districtCount} districts (deterministic variance around state baselines)`)
  } catch (err) {
    console.warn(`  ⚠ districts skipped (${err.message}) — geo file missing?`)
  }

  // ---- alerts ---------------------------------------------------------------
  let t = 0
  for (const [severity, hazardType, title, state, district] of ALERT_ROWS) {
    await prisma.alert.create({
      data: { severity, hazardType, title, state, district, status: 'active', createdAt: HOURS_AGO((t += 0.2)) },
    })
  }
  console.log(`  ✓ ${ALERT_ROWS.length} alerts`)

  // ---- citizen reports --------------------------------------------------------
  t = 0
  for (const [title, description, latitude, longitude, hazardType, status] of REPORT_ROWS) {
    await prisma.citizenReport.create({
      data: { title, description, latitude, longitude, hazardType, status, userId: citizen.id, createdAt: HOURS_AGO((t += 0.5)) },
    })
  }
  console.log(`  ✓ ${REPORT_ROWS.length} citizen reports`)

  // ---- sensors + readings ------------------------------------------------------
  const nodeMap = {}
  for (const [deviceId, , state, district, status, battery, signal] of SENSOR_ROWS) {
    nodeMap[deviceId] = await prisma.sensorNode.create({
      data: { deviceId, location: district, state, district, status, battery, signalStrength: signal, lastSeen: HOURS_AGO(0.1) },
    })
  }
  // a few readings per online node
  let readingCount = 0
  for (const node of Object.values(nodeMap)) {
    if (node.status !== 'online') continue
    for (let i = 5; i >= 1; i--) {
      const r = rng(node.deviceId + i)
      await prisma.sensorReading.create({
        data: {
          sensorNodeId: node.id,
          temperature: Math.round((20 + r() * 25) * 10) / 10,
          humidity: Math.round((40 + r() * 50) * 10) / 10,
          airQuality: Math.round(80 + r() * 240),
          waterLevel: Math.round(r() * 4 * 10) / 10,
          rainfall: Math.round(r() * 60 * 10) / 10,
          timestamp: HOURS_AGO(i / 2),
        },
      })
      readingCount += 1
    }
  }
  console.log(`  ✓ ${SENSOR_ROWS.length} sensor nodes, ${readingCount} readings`)

  // ---- earthquakes / fires / air quality / infrastructure --------------------
  t = 0
  for (const [magnitude, depth, latitude, longitude, place] of EARTHQUAKE_ROWS) {
    await prisma.earthquake.create({ data: { magnitude, depth, latitude, longitude, location: place, eventTime: HOURS_AGO((t += 3)) } })
  }
  t = 0
  for (const [latitude, longitude, intensity, region] of FIRE_ROWS) {
    await prisma.fireHotspot.create({ data: { latitude, longitude, intensity, source: 'NASA FIRMS', detectedAt: HOURS_AGO((t += 1)) } })
  }
  for (const [state, district, aqi, pm25, pm10, co, no2, so2] of AIR_QUALITY_ROWS) {
    await prisma.airQuality.create({ data: { state, district, aqi, pm25, pm10, co, no2, so2, timestamp: HOURS_AGO(1) } })
  }
  for (const [name, type, state, district, latitude, longitude, riskScore] of INFRA_ROWS) {
    await prisma.infrastructure.create({ data: { name, type, state, district, latitude, longitude, riskScore } })
  }
  console.log(`  ✓ ${EARTHQUAKE_ROWS.length} earthquakes, ${FIRE_ROWS.length} fire hotspots, ${AIR_QUALITY_ROWS.length} AQ records, ${INFRA_ROWS.length} infra assets`)

  // ---- resource deployments (from the rule engine) -----------------------------
  const { deployResource } = await import('../../src/services/ai/deployment.service.js')
  for (const [name, , arr] of STATE_ROWS.slice(0, 8)) {
    const scores = stateScores(arr)
    const sorted = HAZARD_KEYS.map((k) => ({ key: k, score: scores[k] })).sort((a, b) => b.score - a.score)
    const primary = sorted[0]
    const d = deployResource({ hazard: primary.key, score: primary.score, population: 50_000_000 })
    await prisma.resourceDeployment.create({
      data: { ...d, hazardType: primary.key, recommendation: `AI deployment plan for ${name} — primary hazard ${primary.key}` },
    })
  }
  console.log(`  ✓ ${Math.min(8, STATE_ROWS.length)} resource deployments`)

  console.log('✅ Seed complete.')
  console.log(`   Admin login: ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())