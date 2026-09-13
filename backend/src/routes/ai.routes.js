import { Router } from 'express'
import * as ctrl from '../controllers/ai.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)
router.post('/predict', ctrl.predict)
router.post('/recommend', ctrl.recommendFor)

export default router