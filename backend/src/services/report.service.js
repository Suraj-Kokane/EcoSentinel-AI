import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'
import { emitReport } from '../sockets/events.js'
import { cloudinaryConfigured, cloudinary, folder } from '../config/cloudinary.js'

const SORTABLE = ['createdAt', 'title']

// Upload a memory buffer to Cloudinary → secure URL.
function uploadImageBuffer(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', public_id: `report-${Date.now()}` },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(buffer)
  })
}

async function resolveImageUrl(file, providedImageUrl) {
  if (file && cloudinaryConfigured) {
    const result = await uploadImageBuffer(file.buffer, file.originalname)
    return result.secure_url
  }
  return providedImageUrl || ''
}

export async function createReport(data, file, userId) {
  const imageUrl = await resolveImageUrl(file, data.imageUrl)
  const report = await prisma.citizenReport.create({
    data: {
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      hazardType: data.hazardType,
      status: data.status,
      imageUrl,
      userId: userId ?? null,
    },
  })
  emitReport(report)
  return report
}

export async function listReports(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const { field, order } = parseSort(query, SORTABLE, 'createdAt')

  const where = {}
  if (query.hazardType) where.hazardType = query.hazardType
  if (query.status) where.status = query.status
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.citizenReport.findMany({ where, orderBy: { [field]: order }, skip, take }),
    prisma.citizenReport.count({ where }),
  ])
  return { data, meta: buildMeta({ page, limit, total }) }
}

export async function getReport(id) {
  const report = await prisma.citizenReport.findUnique({ where: { id } })
  if (!report) throw ApiError.notFound('Report not found')
  return report
}

export async function updateReport(id, data) {
  await getReport(id)
  return prisma.citizenReport.update({ where: { id }, data })
}

export async function removeReport(id) {
  await getReport(id)
  await prisma.citizenReport.delete({ where: { id } })
  return { id }
}

export default { createReport, listReports, getReport, updateReport, removeReport }