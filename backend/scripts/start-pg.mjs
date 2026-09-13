// Boots an embedded PostgreSQL 16 server for local dev on Windows
// (no Docker needed). Data dir: backend/.pgdata — safe to delete to reset.
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PGBIN = resolve(__dirname, '../node_modules/@embedded-postgres/windows-x64/native/bin')
const DATA = resolve(__dirname, '../.pgdata')
const PORT = 5433
const USER = 'ecosentinel'
const PASSWORD = 'ecosentinel'
const DB = 'ecosentinel'

function tryConnect(port) {
  return new Promise((resolve_) => {
    const s = net.connect({ port, host: '127.0.0.1', timeout: 1200 }, () => {
      s.destroy()
      resolve_(true)
    })
    s.on('error', () => resolve_(false))
    s.on('timeout', () => {
      s.destroy()
      resolve_(false)
    })
  })
}

function psql(sql) {
  execFileSync(resolve(PGBIN, 'psql.exe'), ['-h', '127.0.0.1', '-p', String(PORT), '-U', USER, '-d', 'postgres', '-c', sql], {
    env: { ...process.env, PGPASSWORD: 'postgres' },
    stdio: 'pipe',
  })
}

async function main() {
  const up = await tryConnect(PORT)
  if (up) {
    console.log(`[pg] already running on :${PORT}`)
    return
  }

  if (!existsSync(DATA)) {
    console.log('[pg] initializing data directory…')
    execFileSync(resolve(PGBIN, 'initdb.exe'), ['-U', 'postgres', '-E', 'UTF8', '-A', 'trust', DATA], { stdio: 'inherit' })
  }

  console.log('[pg] starting postgres…')
  const child = spawn(
    resolve(PGBIN, 'postgres.exe'),
    ['-D', DATA, '-p', String(PORT), '-h', '127.0.0.1', '-c', 'listen_addresses=127.0.0.1'],
    { detached: true, stdio: 'ignore', env: { ...process.env } },
  )
  child.unref()

  // wait for readiness
  for (let i = 0; i < 30; i++) {
    if (await tryConnect(PORT)) break
    await new Promise((r) => setTimeout(r, 500))
  }
  if (!(await tryConnect(PORT))) {
    console.error('[pg] failed to start')
    process.exit(1)
  }
  console.log(`[pg] postgres up on 127.0.0.1:${PORT} (pid ${child.pid})`)

  // create app role + database (idempotent)
  try {
    psql(`DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${USER}') THEN CREATE ROLE ${USER} LOGIN PASSWORD '${PASSWORD}'; ELSE ALTER ROLE ${USER} WITH LOGIN PASSWORD '${PASSWORD}'; END IF; END $$;`)
    psql(`SELECT 1 FROM pg_database WHERE datname='${DB}'` .trim() && `SELECT 'check'`)
  } catch {
    /* role might exist */
  }
  try {
    psql(`CREATE DATABASE ${DB} OWNER ${USER}`)
    console.log('[pg] database created')
  } catch {
    console.log('[pg] database already exists')
  }

  console.log(`[pg] ready → postgresql://${USER}:${PASSWORD}@127.0.0.1:${PORT}/${DB}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})