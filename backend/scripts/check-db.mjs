// Dev utility: verify tables exist in the ecosentinel DB.
import pg from 'pg'

const c = new pg.Client({ host: '127.0.0.1', port: 5433, user: 'postgres', database: 'ecosentinel' })
await c.connect()
const r = await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
console.log('TABLES:', r.rows.map((x) => x.tablename).join(', '))
const counts = await c.query(`
  SELECT 'states' t, COUNT(*) c FROM states
  UNION ALL SELECT 'districts', COUNT(*) FROM districts
  UNION ALL SELECT 'users', COUNT(*) FROM users
`)
console.log('COUNTS:', JSON.stringify(counts.rows))
await c.end()