import env from './env.js'

// Minimal structured logger (JSON in prod, pretty in dev). Zero-dependency.
const level = { debug: 10, info: 20, warn: 30, error: 40 }

function emit(sev, msg, meta) {
  if (level[sev] < (level[env.nodeEnv === 'test' ? 'error' : 'info'] ?? 20)) return
  const entry = { time: new Date().toISOString(), level: sev, msg }
  if (meta && Object.keys(meta).length) entry.meta = meta
  if (env.nodeEnv === 'production') {
    console.log(JSON.stringify(entry))
  } else {
    const color = { debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' }[sev]
    console.log(`${color}[${sev.toUpperCase()}]\x1b[0m ${entry.time} ${msg}`, meta ? meta : '')
  }
}

export const logger = {
  debug: (msg, meta) => emit('debug', msg, meta),
  info: (msg, meta) => emit('info', msg, meta),
  warn: (msg, meta) => emit('warn', msg, meta),
  error: (msg, meta) => emit('error', msg, meta),
}

export default logger