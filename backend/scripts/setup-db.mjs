// One-time: create ecosentinel role + database on the embedded PG (port 5433).
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PGBIN = resolve(__dirname, '../node_modules/@embedded-postgres/windows-x64/native/bin')
const env = { ...process.env, PGPASSWORD: 'postgres' }

const psql = (sql) =>
  execFileSync(resolve(PGBIN, 'psql.exe'), ['-h', '127.0.0.1', '-p', '5433', '-U', 'postgres', '-d', 'postgres', '-c', sql], { env, stdio: 'pipe' }).toString()

const exists = execFileSync(
  resolve(PGBIN, 'psql.exe'),
  ['-h', '127.0.0.1', '-p', '5433', '-U', 'postgres', '-d', 'postgres', '-tAc', "SELECT 1 FROM pg_database WHERE datname='ecosentinel'"],
  { env, stdio: 'pipe' },
).toString().trim()

if (!exists) {
  psql("CREATE ROLE ecosentinel LOGIN PASSWORD 'ecosentinel' SUPERUSER")
  console.log('role created')
  psql('CREATE DATABASE ecosentinel OWNER ecosentinel')
  console.log('database created')
} else {
  console.log('database already exists')
}

console.log('OK → postgresql://ecosentinel:ecosentinel@127.0.0.1:5433/ecosentinel')