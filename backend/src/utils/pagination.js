import { ApiError } from './ApiError.js'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

/**
 * Normalize pagination query params → { page, limit, skip, take }.
 * Accepts `page`/`limit` (and `offset`/`take` aliases) with sensible bounds.
 */
export function parsePagination(query) {
  const rawPage = parseInt(query.page ?? query.offset ?? DEFAULT_PAGE, 10)
  const rawLimit = parseInt(query.limit ?? query.take ?? DEFAULT_LIMIT, 10)

  if (Number.isNaN(rawPage) || rawPage < 1) {
    throw ApiError.badRequest('Invalid page parameter')
  }
  if (Number.isNaN(rawLimit) || rawLimit < 1) {
    throw ApiError.badRequest('Invalid limit parameter')
  }

  const page = rawPage
  const limit = Math.min(rawLimit, MAX_LIMIT)
  const skip = (page - 1) * limit
  const take = limit
  return { page, limit, skip, take }
}

/** Build the `meta` object for the standardized `{ data, meta }` envelope. */
export function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  }
}

/** Parse sort param like `-createdAt` or `name` into `{ field, order }`. */
export function parseSort(query, allowed = [], fallback = 'createdAt') {
  const raw = (query.sort || '').toString().trim() || fallback
  const order = raw.startsWith('-') ? 'desc' : 'asc'
  const field = raw.replace(/^-/, '')
  if (allowed.length && !allowed.includes(field)) {
    throw ApiError.badRequest(`Invalid sort field "${field}"`)
  }
  return { field, order }
}

// build a Prisma `where` from common filter params
export function applyFilters(query, map) {
  const where = {}
  for (const [param, field] of Object.entries(map)) {
    if (query[param] !== undefined && query[param] !== '') {
      where[field] = query[param]
    }
  }
  if (query.q) {
    // full-text-ish `contains` search is added by the caller per service
  }
  return where
}

export default { parsePagination, buildMeta, parseSort, applyFilters }