import { Router } from 'express'
import * as ctrl from '../controllers/resource.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAuthority } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { idParamSchema, paginationQuerySchema } from '../validations/common.validation.js'

const router = Router()

router.use(authenticate)
router.get('/', validate({ query: paginationQuerySchema }), ctrl.listDeployments)
router.post('/', requireAuthority, ctrl.createDeployment)
router.post('/recommend/:id', requireAuthority, validate({ params: idParamSchema }), ctrl.recommendForState)

export default router