import { generateToken, JWT_SECRET } from '../jwt'
import { test, expect, describe } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { User } from '../types'
import { ObjectId } from 'mongodb'

describe('JWT Functions', () => {
  describe('generateToken', () => {
    test('should generate valid JWT token', () => {
      const mockUser: User = {
        _id: new ObjectId(),
        phoneNumber: '+41123456789',
        ahvNummer: '756.1234.5678.90',
        validated: true,
        verificationCode: '1234',
        created: new Date(),
      }

      const token = generateToken(mockUser)

      expect(typeof token).toBe('string')
      expect(token).toBeTruthy()

      // Verify the token can be decoded
      const decoded = jwt.verify(token, JWT_SECRET) as any
      expect(decoded._id).toBe(mockUser._id.toString())
      expect(decoded.exp).toBeTruthy()
      expect(decoded.iat).toBeTruthy()
    })

    test('should generate different tokens for different users', () => {
      const user1: User = {
        _id: new ObjectId(),
        phoneNumber: '+41123456789',
        ahvNummer: '756.1234.5678.90',
        validated: true,
        verificationCode: '1234',
        created: new Date(),
      }

      const user2: User = {
        _id: new ObjectId(),
        phoneNumber: '+41123456789',
        ahvNummer: '756.1234.5678.91',
        validated: true,
        verificationCode: '1234',
        created: new Date(),
      }

      const token1 = generateToken(user1)
      const token2 = generateToken(user2)

      expect(token1).not.toBe(token2)
    })

    test('should include expiration in token', () => {
      const mockUser: User = {
        _id: new ObjectId(),
        phoneNumber: '+41123456789',
        ahvNummer: '756.1234.5678.90',
        validated: true,
        verificationCode: '1234',
        created: new Date(),
      }

      const token = generateToken(mockUser)
      const decoded = jwt.verify(token, JWT_SECRET) as any

      const now = Math.floor(Date.now() / 1000)
      const oneYear = 60 * 60 * 24 * 365

      expect(decoded.exp).toBeGreaterThan(now)
      expect(decoded.exp).toBeLessThanOrEqual(now + oneYear + 10) // Allow small variance
    })
  })
})
