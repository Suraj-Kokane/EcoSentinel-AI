import 'dotenv/config'

const bool = (v) => (v ?? '').toString().toLowerCase() === 'true'
const str = (v, d = '') => (v === undefined || v === '' ? d : v)
const int = (v, d) => {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? d : n
}

const env = {
  nodeEnv: str(process.env.NODE_ENV, 'development'),
  port: int(process.env.PORT, 8080),
  corsOrigin: str(process.env.CORS_ORIGIN, 'http://localhost:5173'),

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: str(process.env.JWT_SECRET, 'ecosentinel-dev-secret'),
  jwtExpiresIn: str(process.env.JWT_EXPIRES_IN, '1d'),
  bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),

  rateLimitWindowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  rateLimitMax: int(process.env.RATE_LIMIT_MAX, 300),
  authRateLimitMax: int(process.env.AUTH_RATE_LIMIT_MAX, 20),

  cloudinary: {
    cloudName: str(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: str(process.env.CLOUDINARY_API_KEY),
    apiSecret: str(process.env.CLOUDINARY_API_SECRET),
    folder: str(process.env.CLOUDINARY_FOLDER, 'ecosentinel/reports'),
  },

  mqttEnabled: bool(process.env.MQTT_ENABLED),
  mqttUrl: str(process.env.MQTT_URL, 'mqtt://localhost:1883'),

  enableJobs: bool(process.env.ENABLE_JOBS),
  jobCron: {
    weather: str(process.env.JOB_CRON_WEATHER, '*/30 * * * *'),
    airQuality: str(process.env.JOB_CRON_AIR_QUALITY, '*/30 * * * *'),
    earthquake: str(process.env.JOB_CRON_EARTHQUAKE, '*/5 * * * *'),
    fire: str(process.env.JOB_CRON_FIRE, '*/60 * * * *'),
  },

  apiKeys: {
    openWeather: str(process.env.OPENWEATHER_API_KEY),
    firms: str(process.env.FIRMS_API_KEY),
    sentinelId: str(process.env.SENTINEL_CLIENT_ID),
    sentinelSecret: str(process.env.SENTINEL_CLIENT_SECRET),
  },
}

export default env
export { bool, env }