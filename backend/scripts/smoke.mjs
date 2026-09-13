// End-to-end API smoke test against the running backend.
const BASE = 'http://localhost:8080/api'

const post = async (path, body, token) => {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const get = async (path, token) => {
  const res = await fetch(BASE + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  return { status: res.status, json: await res.json().catch(() => null) }
}

// 1. login
const login = await post('/auth/login', { email: 'admin@ecosentinel.in', password: 'Admin@1234' })
console.log('LOGIN:', login.status, '→ token:', login.json?.data?.token ? 'OK' : 'FAIL', '| role:', login.json?.data?.user?.role)
const token = login.json.data.token

// 2. profile
const profile = await get('/auth/profile', token)
console.log('PROFILE:', profile.status, '→', profile.json?.data?.email)

// 3. states (with pagination)
const states = await get('/states?limit=5', token)
console.log('STATES:', states.status, '→ count:', states.json?.meta?.total, '| top:', states.json?.data?.[0]?.name, states.json?.data?.[0]?.overallRisk)

// 4. districts of first state
const stateId = states.json.data[0].id
const districts = await get(`/districts?stateId=${stateId}&limit=3`, token)
console.log('DISTRICTS:', districts.status, '→', districts.json?.data?.map((d) => d.name).join(', '))

// 5. dashboard overview
const overview = await get('/dashboard/overview', token)
console.log('OVERVIEW:', overview.status, '→ threat:', overview.json?.data?.nationalThreatLevel?.level, '| EHI:', overview.json?.data?.ehiScore, '| activeAlerts:', overview.json?.data?.activeAlerts)

// 6. threat level
const threat = await get('/dashboard/threat-level', token)
console.log('THREAT:', threat.status, '→', JSON.stringify(threat.json?.data))

// 7. AI predict for the state
const ai = await post('/ai/predict', { stateId, window: '7d' }, token)
const p0 = ai.json?.data?.predictions?.[0]
console.log('AI PREDICT:', ai.status, '→ region:', ai.json?.data?.region, '| primary:', p0?.label, p0?.base, '→', p0?.projected, `(${p0?.drift}, conf ${p0?.confidence}%)`)

// 8. alerts + create alert (write path)
const alerts = await get('/alerts?limit=3', token)
console.log('ALERTS:', alerts.status, '→ total:', alerts.json?.meta?.total, '| first:', alerts.json?.data?.[0]?.title)
const created = await post('/alerts', { title: 'Smoke test alert — flood watch', hazardType: 'flood', severity: 'high', state: 'Assam', district: 'Dibrugarh' }, token)
console.log('CREATE ALERT:', created.status, '→ id:', created.json?.data?.id)

// 9. sensors + readings
const sensors = await get('/sensors?limit=3', token)
console.log('SENSORS:', sensors.status, '→ total:', sensors.json?.meta?.total, '| first:', sensors.json?.data?.[0]?.deviceId)

// 10. earthquakes
const eq = await get('/earthquakes?limit=2', token)
console.log('EARTHQUAKES:', eq.status, '→ total:', eq.json?.meta?.total, '| M' + eq.json?.data?.[0]?.magnitude, eq.json?.data?.[0]?.location)

// 11. RBAC check — citizen cannot create alerts
const citizenLogin = await post('/auth/login', { email: 'citizen@ecosentinel.in', password: 'Citizen@1234' })
const forbidden = await post('/alerts', { title: 'x' }, citizenLogin.json.data.token)
console.log('RBAC (citizen→create alert):', forbidden.status, '(expect 403)')

console.log('\nE2E SMOKE COMPLETE')