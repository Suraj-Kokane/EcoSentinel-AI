import { Router } from 'express'
import authRoutes from './auth.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import stateRoutes from './state.routes.js'
import districtRoutes from './district.routes.js'
import alertRoutes from './alert.routes.js'
import reportRoutes from './report.routes.js'
import sensorRoutes from './sensor.routes.js'
import earthquakeRoutes from './earthquake.routes.js'
import fireRoutes from './fire.routes.js'
import airQualityRoutes from './airQuality.routes.js'
import infrastructureRoutes from './infrastructure.routes.js'
import resourceDeploymentRoutes from './resourceDeployment.routes.js'
import aiRoutes from './ai.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/states', stateRoutes)
router.use('/districts', districtRoutes)
router.use('/alerts', alertRoutes)
router.use('/reports', reportRoutes)
router.use('/sensors', sensorRoutes)
router.use('/earthquakes', earthquakeRoutes)
router.use('/fires', fireRoutes)
router.use('/air-quality', airQualityRoutes)
router.use('/infrastructure', infrastructureRoutes)
router.use('/resource-deployments', resourceDeploymentRoutes)
router.use('/ai', aiRoutes)

export default router