import jwt from 'jsonwebtoken'
import { User } from './types'

const EXPIRATION = 60 * 60 * 24 * 365

export const JWT_SECRET = 'UfAKfhpntv2VvCMB'

export const generateToken = async (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: EXPIRATION }, (err, token) => {
      if (err || !token) {
        reject(err || new Error('Token generation failed'))
      } else {
        resolve(token)
      }
    })
  })
}
