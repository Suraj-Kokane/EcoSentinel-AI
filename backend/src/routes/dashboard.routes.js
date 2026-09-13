import { Router } from 'express'
import * as ctrl from '../controllers/dashboard.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)
router.get('/overview', ctrl.overview)
router.get('/alerts', ctrl.alerts)
router.get('/threat-level', ctrl.threatLevel)

export default router