-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AUTHORITY', 'CITIZEN');

-- CreateEnum
CREATE TYPE "HazardType" AS ENUM ('flood', 'cyclone', 'heatwave', 'coldWave', 'earthquake', 'landslide', 'fire', 'airPollution', 'waterPollution', 'drought', 'infrastructure', 'other');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('low', 'moderate', 'high', 'critical');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('active', 'acknowledged', 'dispatched', 'resolved');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('submitted', 'under_review', 'verified', 'dispatched', 'resolved');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('online', 'offline', 'degraded');

-- CreateEnum
CREATE TYPE "InfraType" AS ENUM ('dam', 'hospital', 'school', 'power', 'railway', 'highway', 'airport');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "overallRisk" INTEGER NOT NULL DEFAULT 0,
    "floodRisk" INTEGER NOT NULL DEFAULT 0,
    "fireRisk" INTEGER NOT NULL DEFAULT 0,
    "pollutionRisk" INTEGER NOT NULL DEFAULT 0,
    "earthquakeRisk" INTEGER NOT NULL DEFAULT 0,
    "cycloneRisk" INTEGER NOT NULL DEFAULT 0,
    "landslideRisk" INTEGER NOT NULL DEFAULT 0,
    "heatwaveRisk" INTEGER NOT NULL DEFAULT 0,
    "droughtRisk" INTEGER NOT NULL DEFAULT 0,
    "waterPollutionRisk" INTEGER NOT NULL DEFAULT 0,
    "coldWaveRisk" INTEGER NOT NULL DEFAULT 0,
    "infrastructureRisk" INTEGER NOT NULL DEFAULT 0,
    "ehiScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "overallRisk" INTEGER NOT NULL DEFAULT 0,
    "ehiScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "hazardType" "HazardType" NOT NULL DEFAULT 'other',
    "severity" "Severity" NOT NULL DEFAULT 'moderate',
    "status" "AlertStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citizen_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT DEFAULT '',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "hazardType" "HazardType" NOT NULL DEFAULT 'other',
    "status" "ReportStatus" NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "citizen_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_nodes" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "battery" INTEGER NOT NULL DEFAULT 100,
    "signalStrength" INTEGER NOT NULL DEFAULT -50,
    "status" "NodeStatus" NOT NULL DEFAULT 'online',
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" TEXT NOT NULL,
    "sensorNodeId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "airQuality" DOUBLE PRECISION,
    "waterLevel" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earthquakes" (
    "id" TEXT NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "eventTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earthquakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fire_hotspots" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'NASA FIRMS',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fire_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "air_quality" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "aqi" INTEGER NOT NULL DEFAULT 0,
    "pm25" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "co" DOUBLE PRECISION,
    "no2" DOUBLE PRECISION,
    "so2" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "air_quality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastructure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InfraType" NOT NULL DEFAULT 'hospital',
    "state" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "infrastructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_deployments" (
    "id" TEXT NOT NULL,
    "hazardType" "HazardType" NOT NULL DEFAULT 'other',
    "severity" "Severity" NOT NULL DEFAULT 'moderate',
    "ndrfTeams" INTEGER NOT NULL DEFAULT 0,
    "ambulances" INTEGER NOT NULL DEFAULT 0,
    "fireBrigades" INTEGER NOT NULL DEFAULT 0,
    "reliefCamps" INTEGER NOT NULL DEFAULT 0,
    "medicalTeams" INTEGER NOT NULL DEFAULT 0,
    "recommendation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_deployments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- CreateIndex
CREATE INDEX "districts_stateId_idx" ON "districts"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "districts_stateId_name_key" ON "districts"("stateId", "name");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_hazardType_idx" ON "alerts"("hazardType");

-- CreateIndex
CREATE INDEX "alerts_state_idx" ON "alerts"("state");

-- CreateIndex
CREATE INDEX "citizen_reports_status_idx" ON "citizen_reports"("status");

-- CreateIndex
CREATE INDEX "citizen_reports_hazardType_idx" ON "citizen_reports"("hazardType");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_nodes_deviceId_key" ON "sensor_nodes"("deviceId");

-- CreateIndex
CREATE INDEX "sensor_nodes_status_idx" ON "sensor_nodes"("status");

-- CreateIndex
CREATE INDEX "sensor_readings_sensorNodeId_timestamp_idx" ON "sensor_readings"("sensorNodeId", "timestamp");

-- CreateIndex
CREATE INDEX "earthquakes_eventTime_idx" ON "earthquakes"("eventTime");

-- CreateIndex
CREATE INDEX "fire_hotspots_detectedAt_idx" ON "fire_hotspots"("detectedAt");

-- CreateIndex
CREATE INDEX "weather_data_timestamp_idx" ON "weather_data"("timestamp");

-- CreateIndex
CREATE INDEX "air_quality_timestamp_idx" ON "air_quality"("timestamp");

-- CreateIndex
CREATE INDEX "air_quality_state_idx" ON "air_quality"("state");

-- CreateIndex
CREATE INDEX "infrastructure_type_idx" ON "infrastructure"("type");

-- CreateIndex
CREATE INDEX "infrastructure_state_idx" ON "infrastructure"("state");

-- CreateIndex
CREATE INDEX "resource_deployments_hazardType_idx" ON "resource_deployments"("hazardType");

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensorNodeId_fkey" FOREIGN KEY ("sensorNodeId") REFERENCES "sensor_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
