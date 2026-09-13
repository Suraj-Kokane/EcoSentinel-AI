import { Router } from 'express'
import * as ctrl from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authLimiter } from '../middleware/rateLimit.middleware.js'
import { registerSchema, loginSchema } from '../validations/auth.validation.js'

const router = Router()

router.post('/register', authLimiter, validate({ body: registerSchema }), ctrl.register)
router.post('/login', authLimiter, validate({ body: loginSchema }), ctrl.login)
router.get('/profile', authenticate, ctrl.profile)

export default router