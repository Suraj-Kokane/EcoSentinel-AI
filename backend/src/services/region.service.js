import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

const ALIAS = {
  Orissa: 'Odisha',
  Uttaranchal: 'Uttarakhand',
  Delhi: 'Delhi NCR',
}

function stateLabel(name) {
  return ALIAS[name] || name
}

function serializeState(s) {
  return { ...s, label: stateLabel(s.name) }
}

export async function listStates(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {}
  if (query.q) where.name = { contains: query.q, mode: 'insensitive' }

  const [rows, total] = await Promise.all([
    prisma.state.findMany({
      where,
      orderBy: { overallRisk: 'desc' },
      skip,
      take,
      include: { _count: { select: { districts: true } } },
    }),
    prisma.state.count({ where }),
  ])
  const data = rows.map((s) => serializeState(s))
  return { data, meta: buildMeta({ page, limit, total }) }
}

export async function getState(id) {
  const state = await prisma.state.findUnique({
    where: { id },
    include: {
      districts: { orderBy: { overallRisk: 'desc' } },
    },
  })
  if (!state) throw ApiError.notFound('State not found')
  return serializeState(state)
}

export async function createState(data) {
  return prisma.state.create({ data })
}

export async function listDistricts(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {}
  if (query.stateId) where.stateId = query.stateId
  if (query.q) where.name = { contains: query.q, mode: 'insensitive' }

  const [rows, total] = await Promise.all([
    prisma.district.findMany({ where, orderBy: { overallRisk: 'desc' }, skip, take, include: { state: true } }),
    prisma.district.count({ where }),
  ])
  return { data: rows, meta: buildMeta({ page, limit, total }) }
}

export async function getDistrict(id) {
  const district = await prisma.district.findUnique({ where: { id }, include: { state: true } })
  if (!district) throw ApiError.notFound('District not found')
  return district
}

export default { listStates, getState, createState, listDistricts, getDistrict }