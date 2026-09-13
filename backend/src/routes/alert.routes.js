import { Router } from 'express'
import * as ctrl from '../controllers/alert.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAuthority } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { idParamSchema } from '../validations/common.validation.js'
import { createAlertSchema, updateAlertSchema, listAlertSchema } from '../validations/alert.validation.js'

const router = Router()

router.use(authenticate)
router.get('/', validate({ query: listAlertSchema }), ctrl.listAlerts)
router.get('/:id', validate({ params: idParamSchema }), ctrl.getAlert)
router.post('/', requireAuthority, validate({ body: createAlertSchema }), ctrl.createAlert)
router.put('/:id', requireAuthority, validate({ params: idParamSchema, body: updateAlertSchema }), ctrl.updateAlert)
router.delete('/:id', requireAuthority, validate({ params: idParamSchema }), ctrl.removeAlert)

export default router