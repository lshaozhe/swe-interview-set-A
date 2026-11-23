// INTERVIEWER-ANNOTATION-START
// [DSO-13 · T2 · security] The limiter is keyed by IP, so one noisy user behind a shared NAT throttles everyone.
//     Look near: const limiter = rateLimit({
// [DSO-14 · T3 · reliability] The default in-memory store is per process: three instances give three times the limit and reset on deploy.
//     Look near: max: 100,
// INTERVIEWER-ANNOTATION-END
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
})

export default limiter
