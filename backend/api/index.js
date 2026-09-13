// Vercel serverless entry — exports the Express app as a serverless function
import { createApp } from './src/app.js'

const app = createApp()

export default app
