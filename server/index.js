const express = require('express')
const cors = require('cors')
const config = require('./config')
const reportsRouter = require('./routes/reports')
const usersRouter = require('./routes/users')
const exportRouter = require('./routes/export')
const adminRouter = require('./routes/admin')

const app = express()

app.use(cors())

app.use(express.json())

app.use('/api/reports', reportsRouter)
app.use('/api/users', usersRouter)
app.use('/api/export', exportRouter)
app.use('/api/admin', adminRouter)

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

module.exports = app
