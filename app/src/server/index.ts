// INTERVIEWER-ANNOTATION-START
// [BE-01 · T1 · security] CORS is wide open to every origin.
//     Look near: app.use(cors())
// [BE-04 · T1 · security] No rate limiting is applied anywhere (the limiter exists but is never mounted).
//     Look near: app.use(express.json())
// [BE-06 · T2 · observability] No request id, access logging or correlation across services.
//     Look near: app.use('/api/auth', authRouter)
// [BE-07 · T1 · reliability] There is no error-handling middleware and no process-level handler for unhandled rejections.
//     Look near: return app
// INTERVIEWER-ANNOTATION-END
import cors from 'cors'
import express from 'express'
import adminRouter from './routes/admin'
import authRouter from './routes/auth'
import exportRouter from './routes/export'
import reportsRouter from './routes/reports'
import usersRouter from './routes/users'

export function createApp() {
  const app = express()

  app.use(cors())

  app.use(express.json())

  app.use('/api/auth', authRouter)
  app.use('/api/reports', reportsRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/export', exportRouter)
  app.use('/api/admin', adminRouter)

  return app
}
