import { prisma } from '../config/prisma.js'
import { listAlerts } from './alert.service.js'

function threatFromAvg(avg) {
  if (avg >= 70) return { level: 'SEVERE', color: '#EF4444', score: avg }
  if (avg >= 52) return { level: 'ELEVATED', color: '#F97316', score: avg }
  if (avg >= 38) return { level: 'GUARDED', color: '#EAB308', score: avg }
  return { level: 'NORMAL', color: '#22C55E', score: avg }
}

export async function getThreatLevel() {
  const agg = await prisma.state.aggregate({ _avg: { overallRisk: true } })
  const avg = Math.round(agg._avg.overallRisk ?? 0)
  const criticalCount = await prisma.state.count({ where: { overallRisk: { gte: 75 } } })
  return { ...threatFromAvg(avg), criticalStates: criticalCount }
}

export async function getOverview() {
  const [stateCount, districtCount, activeAlerts, reportCount, sensorCount, avgAgg, criticalStates, topStates] = await Promise.all([
    prisma.state.count(),
    prisma.district.count(),
    prisma.alert.count({ where: { status: 'active' } }),
    prisma.citizenReport.count(),
    prisma.sensorNode.count(),
    prisma.state.aggregate({ _avg: { overallRisk: true, ehiScore: true } }),
    prisma.state.count({ where: { overallRisk: { gte: 75 } } }),
    prisma.state.findMany({ orderBy: { overallRisk: 'desc' }, take: 5 }),
  ])

  return {
    nationalThreatLevel: threatFromAvg(Math.round(avgAgg._avg.overallRisk ?? 0)),
    ehiScore: Math.round(avgAgg._avg.ehiScore ?? 0),
    stateCount,
    districtCount,
    activeAlerts,
    reportCount,
    sensorCount,
    criticalStates,
    topCriticalStates: topStates,
  }
}

export async function getDashboardAlerts(query) {
  return listAlerts(query)
}

export default { getThreatLevel, getOverview, getDashboardAlerts }