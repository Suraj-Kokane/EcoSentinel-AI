import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'
import { emitAlert } from '../sockets/events.js'

const SORTABLE = ['createdAt', 'severity', 'title']

export async function createAlert(data) {
  const alert = await prisma.alert.create({ data })
  emitAlert(alert)
  return alert
}

export async function listAlerts(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const { field, order } = parseSort(query, SORTABLE, 'createdAt')

  const where = {}
  if (query.state) where.state = { equals: query.state, mode: 'insensitive' }
  if (query.district) where.district = { equals: query.district, mode: 'insensitive' }
  if (query.hazardType) where.hazardType = query.hazardType
  if (query.severity) where.severity = query.severity
  if (query.status) where.status = query.status
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.alert.findMany({ where, orderBy: { [field]: order }, skip, take }),
    prisma.alert.count({ where }),
  ])
  return { data, meta: buildMeta({ page, limit, total }) }
}

export async function getAlert(id) {
  const alert = await prisma.alert.findUnique({ where: { id } })
  if (!alert) throw ApiError.notFound('Alert not found')
  return alert
}

export async function updateAlert(id, data) {
  await getAlert(id)
  return prisma.alert.update({ where: { id }, data })
}

export async function removeAlert(id) {
  await getAlert(id)
  await prisma.alert.delete({ where: { id } })
  return { id }
}

export default { createAlert, listAlerts, getAlert, updateAlert, removeAlert }