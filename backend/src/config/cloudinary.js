import { v2 as cloudinary } from 'cloudinary'
import env from './env.js'
import { logger } from './logger.js'

const { cloudName, apiKey, apiSecret, folder } = env.cloudinary

export const cloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret)

if (cloudinaryConfigured) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  logger.info('Cloudinary configured', { folder })
} else {
  logger.warn('Cloudinary not configured — image uploads will use a provided imageUrl fallback')
}

export { cloudinary, folder }