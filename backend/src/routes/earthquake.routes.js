import { Router } from 'express'
import * as ctrl from '../controllers/earthquake.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { paginationQuerySchema } from '../validations/common.validation.js'

const router = Router()

router.get('/', authenticate, validate({ query: paginationQuerySchema }), ctrl.listEarthquakes)

export default router