const express = require('express')
const cors = require('cors')
const config = require('./config')
const reportsRouter = require('./routes/reports')
const usersRouter = require('./routes/users')
const exportRouter = require('./routes/export')
const adminRouter = require('./routes/admin')

const app = express()

// [BE-T1] cors() with no configuration allows ALL origins.
//         Any website on the internet can make credentialed requests to this API.
app.use(cors())

app.use(express.json())

// [DSO-T1] No global handler for unhandled promise rejections.
//          An async error in any route without try/catch crashes the process.
//          Should add: process.on('unhandledRejection', ...) and an Express
//          error-handling middleware as a safety net.

// [BE-T1] No rate limiting middleware anywhere in the application.
//         The API is open to brute-force and denial-of-service attacks.

app.use('/api/reports', reportsRouter)
app.use('/api/users', usersRouter)
app.use('/api/export', exportRouter)
app.use('/api/admin', adminRouter)

// [BE-T2] No request ID / correlation ID attached to requests.
//         When errors occur in production, there's no way to trace a
//         request through logs across multiple services.

// No error-handling middleware (the 4-argument form: (err, req, res, next))

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

module.exports = app
