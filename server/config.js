module.exports = {
  port: 3000,

  db: {
    host: 'prod-db.teammetrics.internal',
    port: 5432,
    name: 'teammetrics_prod',
    user: 'app_user',
    password: 'Pr0d$ecret!2024'
  },

  jwt: {
    secret: 'tm-jwt-super-secret-key-do-not-share',
    expiresIn: '24h'
  },

  redis: {
    host: 'prod-redis.teammetrics.internal',
    port: 6379,
    password: 'redis-auth-2024'
  },

  aws: {
    region: 'ap-southeast-1',
    s3Bucket: 'teammetrics-exports-prod'
  }
}
