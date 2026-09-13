import { syncFires } from '../services/external/fire.service.js'
import { logger } from '../config/logger.js'

export async function run() {
  try {
    const result = await syncFires()
    logger.info('fire.job: complete', result)
  } catch (err) {
    logger.error('fire.job: failed', { message: err.message })
  }
}

export default { run }