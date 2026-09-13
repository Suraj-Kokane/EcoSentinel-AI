import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

// Multer in-memory storage — files are streamed to Cloudinary, never written to disk.
const storage = multer.memoryStorage()

const FILE_LIMIT = 10 * 1024 * 1024 // 10 MB

export const upload = multer({
  storage,
  limits: { fileSize: FILE_LIMIT },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new ApiError(400, 'Only image uploads are supported'))
  },
})

// Middleware for a single image field named "image".
export const uploadImage = upload.single('image')

export default { upload, uploadImage }