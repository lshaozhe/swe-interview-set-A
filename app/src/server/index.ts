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
