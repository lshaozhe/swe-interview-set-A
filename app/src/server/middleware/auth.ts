// INTERVIEWER-ANNOTATION-START
// [BE-05 · T2 · security] decode() does not verify the signature or expiry, so forged and expired tokens are accepted.
//     Look near: jwt.decode(token)
// [DSO-15 · T3 · security] There is no token revocation: a stolen or suspended user's token works for 24 hours.
//     Look near: req.user = payload
// INTERVIEWER-ANNOTATION-END
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  id: number
  email: string
  role: string
  orgId: number
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.decode(token) as TokenPayload | null

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
