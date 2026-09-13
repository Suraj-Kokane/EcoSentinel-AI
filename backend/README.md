# EcoSentinel AI — Backend

Production-ready Node.js/Express backend for the **EcoSentinel AI** platform — India's AI-Powered Multi-Hazard Environmental Intelligence Network. Serves the existing React frontend (repo root) with zero frontend changes required.

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js (JavaScript **ESM only**, no TypeScript) |
| Framework | Express.js |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | JWT Bearer (`Authorization: Bearer <token>`) + bcrypt |
| Real-time | Socket.IO (`new-alert`, `sensor-update`, `new-report`, `earthquake-update`) |
| Files | Cloudinary (multer → buffer → cloud) |
| Jobs | node-cron (weather / air-quality / earthquake / fire ingestion) |
| IoT | MQTT (`ecosentinel/{deviceId}/reading|status`) — ESP32-ready |
| Security | Helmet · CORS · express-rate-limit · Zod · role middleware · central error handler |

## Quick start

```bash
cd backend
npm install

# 1) start PostgreSQL (Docker) — or point DATABASE_URL at your own/Neon DB
docker compose up -d

# 2) create tables
npm run migrate          # prisma migrate dev

# 3) seed parity data (35 states, 594 districts, alerts, reports, sensors, …)
npm run seed

# 4) run
npm run dev              # http://localhost:8080
```

**Seeded users** (change via `.env`):
- `admin@ecosentinel.in` / `Admin@1234` → ADMIN
- `authority@ecosentinel.in` / `Authority@1234` → AUTHORITY
- `citizen@ecosentinel.in` / `Citizen@1234` → CITIZEN

> Public registration always creates **CITIZEN** accounts. AUTHORITY/ADMIN accounts are provisioned by an ADMIN.

## API

All responses: `{ success, data, meta }` · lists support `?page&limit&sort&q` + entity filters.

```
GET  /api/health                         public
POST /api/auth/register|login            public (rate-limited)
GET  /api/auth/profile                   JWT
GET  /api/dashboard/overview|alerts|threat-level
GET  /api/states · /api/states/:id       (POST = admin)
GET  /api/districts · /api/districts/:id
GET/POST/PUT/DELETE /api/alerts[/:id]    writes = AUTHORITY+
GET/POST/PUT/DELETE /api/reports[/:id]   POST = multipart image upload ("image" field)
GET/POST /api/sensors · GET/POST /api/sensors/readings
GET  /api/earthquakes · /api/fires · /api/air-quality · /api/infrastructure
GET/POST /api/resource-deployments · POST /api/resource-deployments/recommend/:stateId
POST /api/ai/predict · /api/ai/recommend
```

Example:
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ecosentinel.in","password":"Admin@1234"}' | jq -r .data.token)

curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/states
curl -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"stateId":"<state-id>","window":"7d"}' http://localhost:8080/api/ai/predict
```

## Socket.IO

```js
const socket = io('http://localhost:8080', { auth: { token: JWT } })
socket.on('new-alert', a => …)
socket.on('sensor-update', n => …)
socket.on('new-report', r => …)
socket.on('earthquake-update', e => …)
```

## MQTT (ESP32)

Enable with `MQTT_ENABLED=true` + `MQTT_URL`. Device payloads:

```
topic: ecosentinel/<deviceId>/reading     { "temperature":31.2, "humidity":64, "airQuality":180, "waterLevel":2.1, "rainfall":12.4 }
topic: ecosentinel/<deviceId>/status      { "status":"online", "battery":88, "signalStrength":-52 }
```

Readings persist to PostgreSQL and auto-emit `sensor-update`.

## Background jobs (all OFF by default)

Set `ENABLE_JOBS=true` + the relevant key:

| Job | Source | Env key |
|---|---|---|
| weather.job | OpenWeatherMap | `OPENWEATHER_API_KEY` |
| airQuality.job | OpenWeather Air Pollution | `OPENWEATHER_API_KEY` |
| earthquake.job | USGS feed (no key) | — |
| fire.job | NASA FIRMS | `FIRMS_API_KEY` |

Cron schedules configurable via `JOB_CRON_*`. Job failures are logged — **never crash the server**.

## Seed parity

`prisma/seed/data.js` mirrors the frontend mock dataset **1:1** (35 states × 12 hazard scores, 26 alerts, reports, sensors, earthquakes, fires, AQ, infrastructure) and districts are generated from `prisma/seed/geo/india-districts.geojson` (594 districts) using the same deterministic formulas as the frontend risk/EHI engines — backend numbers match the UI exactly.

## Environment

Copy `.env.example` → `.env`. Key variables: `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `CLOUDINARY_*`, `MQTT_*`, `ENABLE_JOBS`, API keys.

## Deployment

| Target | Notes |
|---|---|
| Backend → **Render/Railway** | `npm install && npx prisma migrate deploy && npm start` |
| Database → **Neon** | Set `DATABASE_URL=postgresql://…?sslmode=require` (Prisma handles SSL) |
| Storage → **Cloudinary** | Set the 3 `CLOUDINARY_*` vars |
| MQTT → **Mosquitto** | Any `mqtt://` broker URL |
| Frontend → **Vercel** | Already in repo root; set `CORS_ORIGIN` to the Vercel URL |

## Structure

```
backend/
├── src/
│   ├── config/        env · prisma · logger · cloudinary
│   ├── routes/        13 route modules + index
│   ├── controllers/   request/response only
│   ├── services/      business logic · ai/ (risk, prediction, recommendation, deployment) · external/ (weather, AQ, USGS, FIRMS, satellite, nominatim, MQTT)
│   ├── middleware/    auth · role · validate · error · notFound · rateLimit · upload
│   ├── sockets/       Socket.IO server + event emitters
│   ├── jobs/          node-cron ingestion jobs
│   ├── validations/   zod schemas
│   ├── utils/         ApiError · asyncHandler · jwt · pagination · response
│   ├── app.js         express app factory
│   └── server.js      HTTP + Socket.IO + jobs + MQTT bootstrap
├── prisma/            schema.prisma · seed/ (data.js + geo/ + index.js)
├── docker-compose.yml PostgreSQL 16 (+ pgAdmin)
└── .env.example
```