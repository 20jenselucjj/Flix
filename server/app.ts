/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import mediaRoutes from './routes/media.routes.js'
import historyRoutes from './routes/history.routes.js'
import listRoutes from './routes/list.routes.js'
import { supabaseService } from './services/supabase.service.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api', mediaRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/list', listRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await supabaseService.checkConnection()
      res.status(200).json({
        success: true,
        message: 'ok',
      })
    } catch (e) {
      next(e)
    }
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
