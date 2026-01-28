import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from './jwt'
import { User, Injected } from './types'
import { db } from './db'
import { ObjectId } from 'mongodb'
import { SecurityType } from './enums'

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<Injected['user']> {
  if (process.env.NODE_ENV !== 'production' && request.headers['x-access-token'] === 'test-token') {
    // Bypass auth, set dummy user
    return Promise.resolve({ id: 'dev', email: 'dev@example.com' } as any)
  }
  if (securityName === SecurityType.User) {
    const token = request.headers?.['x-access-token']

    if (typeof token !== 'string') {
      throw new Error('Invalid token')
    }

    return new Promise((resolve, reject) =>
      jwt.verify(
        token,
        JWT_SECRET,
        async function (err: any, decoded: { _id: string }) {
          if (err) {
            reject({
              error: 'Invalid jwt',
            })
          } else {
            const user = await db().users.findOne({ _id: new ObjectId(decoded._id) })

            if (!user) {
              reject({
                error: 'User not found',
              })
            }

            return resolve(user as User)
          }
        } as any, // TODO,
      ),
    )
  }

  return Promise.resolve(null as any)
}
