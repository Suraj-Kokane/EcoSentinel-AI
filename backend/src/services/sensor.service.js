import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { emitSensorUpdate } from '../sockets/events.js'

// Register a sensor node (upsert by deviceId) — used by ESP32 provisioning & seed.
export async function registerSensor(data) {
  const node = await prisma.sensorNode.upsert({
    where: { deviceId: data.deviceId },
    update: {
      location: data.location ?? '',
      state: data.state ?? '',
      district: data.district ?? '',
      battery: data.battery ?? 100,
      signalStrength: data.signalStrength ?? -50,
      status: data.status ?? 'online',
      lastSeen: new Date(),
    },
    create: {
      deviceId: data.deviceId,
      location: data.location ?? '',
      state: data.state ?? '',
      district: data.district ?? '',
      battery: data.battery ?? 100,
      signalStrength: data.signalStrength ?? -50,
      status: data.status ?? 'online',
    },
  })
  emitSensorUpdate(node)
  return node
}

export async function listSensors(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {}
  if (query.status) where.status = query.status
  if (query.state) where.state = { equals: query.state, mode: 'insensitive' }

  const [data, total] = await Promise.all([
    prisma.sensorNode.findMany({ where, orderBy: { lastSeen: 'desc' }, skip, take }),
    prisma.sensorNode.count({ where }),
  ])
  return { data, meta: buildMeta({ page, limit, total }) }
}

export async function createReading(data) {
  const node = await prisma.sensorNode.findUnique({ where: { id: data.sensorNodeId } })
  if (!node) throw ApiError.notFound('Sensor node not found')

  const reading = await prisma.sensorReading.create({
    data: {
      sensorNodeId: data.sensorNodeId,
      temperature: data.temperature,
      humidity: data.humidity,
      airQuality: data.airQuality,
      waterLevel: data.waterLevel,
      rainfall: data.rainfall,
      timestamp: data.timestamp ? new Date(data.timestamp) : undefined,
    },
  })

  await prisma.sensorNode.update({
    where: { id: node.id },
    data: { lastSeen: new Date(), status: 'online' },
  })
  emitSensorUpdate({ ...node, lastSeen: new Date() })
  return reading
}

// Ingest from MQTT/ESP32 given a deviceId (not an internal id).
export async function ingestReadingByDevice(deviceId, payload) {
  const node = await prisma.sensorNode.findUnique({ where: { deviceId } })
  if (!node) throw ApiError.notFound('Sensor node not registered')
  return createReading({ sensorNodeId: node.id, ...payload })
}

export async function listReadings(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {}
  if (query.sensorNodeId) where.sensorNodeId = query.sensorNodeId

  const [data, total] = await Promise.all([
    prisma.sensorReading.findMany({ where, orderBy: { timestamp: 'desc' }, skip, take }),
    prisma.sensorReading.count({ where }),
  ])
  return { data, meta: buildMeta({ page, limit, total }) }
}

export default { registerSensor, listSensors, createReading, ingestReadingByDevice, listReadings }