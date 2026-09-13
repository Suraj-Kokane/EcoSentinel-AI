import { Router } from 'express'
import * as ctrl from '../controllers/region.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { idParamSchema, paginationQuerySchema } from '../validations/common.validation.js'

const router = Router()

router.use(authenticate)
router.get('/', validate({ query: paginationQuerySchema }), ctrl.listDistricts)
router.get('/:id', validate({ params: idParamSchema }), ctrl.getDistrict)

export default router