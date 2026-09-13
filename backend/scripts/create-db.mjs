// One-off: create the ecosentinel database on the embedded PG (port 5433).
import pg from 'pg'

async function tryConnect() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const c = new pg.Client({
      host: '127.0.0.1',
      port: 5433,
      user: 'postgres',
      database: 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: false,
    })
    try {
      await c.connect()
      return c
    } catch (e) {
      console.log(`attempt ${attempt} failed: ${e.code || e.message}`)
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
  throw new Error('could not connect to embedded postgres')
}

const c = await tryConnect()
const r = await c.query("SELECT 1 FROM pg_database WHERE datname='ecosentinel'")
if (r.rowCount === 0) {
  await c.query('CREATE DATABASE ecosentinel')
  console.log('database created')
} else {
  console.log('database already exists')
}
await c.end()
console.log('OK')