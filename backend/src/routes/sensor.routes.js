import { Router } from 'express'
import * as ctrl from '../controllers/sensor.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAuthority } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { paginationQuerySchema } from '../validations/common.validation.js'
import { createSensorSchema, createReadingSchema, listSensorSchema } from '../validations/sensor.validation.js'

const router = Router()

router.use(authenticate)
router.get('/', validate({ query: listSensorSchema }), ctrl.listSensors)
router.post('/', requireAuthority, validate({ body: createSensorSchema }), ctrl.registerSensor)

router.get('/readings', validate({ query: paginationQuerySchema }), ctrl.listReadings)
router.post('/readings', requireAuthority, validate({ body: createReadingSchema }), ctrl.createReading)

export default router