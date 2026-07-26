const rateLimit = require('express-rate-limit')

// [DSO-T2] Rate limit is keyed by IP address, not by authenticated user.
//          In an office where 50 users share one NAT IP, one user's burst
//          will throttle all colleagues simultaneously.
//
// [DSO-T3] In-memory store — counters live in this process's heap.
//          With 3 server instances behind a load balancer, a user can send
//          3× the intended limit by hitting different instances.
//          Needs a Redis-backed store (e.g. rate-limit-redis) to share state.

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit per window
  // keyGenerator defaults to req.ip — should use req.user?.id when available
  // store defaults to in-memory MemoryStore — not shared across instances
  message: { error: 'Too many requests, please try again later.' }
})

module.exports = limiter
