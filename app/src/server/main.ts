import config from './config'
import { initDb } from './db/queries'
import { seedDemo } from './db/seed'
import { createApp } from './index'

await initDb()
await seedDemo()

createApp().listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
