// [DSO-T1] Secrets hardcoded directly in source code and committed to the repo.
//          Anyone with repo access has production credentials.
//          Rotating secrets requires a code change and redeployment.
//          Should use environment variables or a secrets manager (AWS Secrets Manager, Vault).

module.exports = {
  port: 3000,

  db: {
    host: 'prod-db.teammetrics.internal',
    port: 5432,
    name: 'teammetrics_prod',
    user: 'app_user',
    password: 'Pr0d$ecret!2024'      // hardcoded production password
  },

  jwt: {
    secret: 'tm-jwt-super-secret-key-do-not-share',  // hardcoded signing secret
    expiresIn: '24h'
  },

  redis: {
    host: 'prod-redis.teammetrics.internal',
    port: 6379,
    password: 'redis-auth-2024'      // hardcoded redis password
  },

  aws: {
    region: 'ap-southeast-1',
    s3Bucket: 'teammetrics-exports-prod'
  }
}
