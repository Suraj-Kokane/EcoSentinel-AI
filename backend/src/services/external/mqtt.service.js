import mqtt from 'mqtt'
import env from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { registerSensor, ingestReadingByDevice } from '../sensor.service.js'

const READINGS_TOPIC = 'ecosentinel/+/reading'
const STATUS_TOPIC = 'ecosentinel/+/status'

// Connect to the MQTT broker and stream ESP32 sensor payloads into PostgreSQL.
// Enabled only when MQTT_ENABLED=true. Failures are logged, never fatal.
export function startMqtt() {
  if (!env.mqttEnabled) {
    logger.info('MQTT disabled (MQTT_ENABLED=false)')
    return null
  }

  const client = mqtt.connect(env.mqttUrl, { reconnectPeriod: 5000 })

  client.on('connect', () => {
    logger.info('MQTT connected', { url: env.mqttUrl })
    client.subscribe([READINGS_TOPIC, STATUS_TOPIC], (err) => {
      if (err) logger.error('MQTT subscribe failed', { error: err.message })
      else logger.info('MQTT subscribed', { topics: [READINGS_TOPIC, STATUS_TOPIC] })
    })
  })

  client.on('error', (err) => logger.error('MQTT error', { error: err.message }))

  client.on('message', async (topic, buffer) => {
    const parts = topic.split('/')
    const deviceId = parts[1]
    const kind = parts[2]
    let payload = {}
    try {
      payload = JSON.parse(buffer.toString())
    } catch {
      logger.warn('MQTT: malformed payload', { topic })
      return
    }

    try {
      if (kind === 'reading') {
        await ingestReadingByDevice(deviceId, payload)
      } else if (kind === 'status') {
        await registerSensor({
          deviceId,
          status: payload.status,
          battery: payload.battery,
          signalStrength: payload.signalStrength,
        })
      }
    } catch (err) {
      logger.warn('MQTT: ingest failed', { deviceId, kind, error: err.message })
    }
  })

  return client
}

export default { startMqtt }