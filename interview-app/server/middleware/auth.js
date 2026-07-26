const jwt = require('jsonwebtoken')
const config = require('../config')

// [BE-T2] jwt.decode() only decodes the token — it does NOT verify the signature
//         or check the expiry (exp claim). A token with a forged payload or an
//         expired token will pass this middleware successfully.
//         Should use jwt.verify(token, config.jwt.secret) instead.
//
// [DSO-T3] No token revocation mechanism. Even after a user logs out or is
//          suspended, their token remains valid until its natural expiry (24h).
//          A stolen token is usable for up to 24 hours with no way to invalidate it.

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // decode() does not verify signature or expiry — use verify() instead
    const payload = jwt.decode(token)

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { authenticate }
