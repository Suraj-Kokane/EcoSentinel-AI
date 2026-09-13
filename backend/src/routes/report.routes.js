import { Router } from 'express'
import * as ctrl from '../controllers/report.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAuthority } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { uploadImage } from '../middleware/upload.middleware.js'
import { idParamSchema } from '../validations/common.validation.js'
import { createReportSchema, updateReportSchema, listReportSchema } from '../validations/report.validation.js'

const router = Router()

router.use(authenticate)
router.get('/', validate({ query: listReportSchema }), ctrl.listReports)
router.get('/:id', validate({ params: idParamSchema }), ctrl.getReport)
// multipart image upload (field "image") + JSON metadata
router.post('/', uploadImage, validate({ body: createReportSchema }), ctrl.createReport)
router.put('/:id', requireAuthority, validate({ params: idParamSchema, body: updateReportSchema }), ctrl.updateReport)
router.delete('/:id', requireAuthority, validate({ params: idParamSchema }), ctrl.removeReport)

export default router