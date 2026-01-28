import { describe, test, expect } from '@jest/globals'
import { ApiController } from '../api/api.controller'
import { RegisterBody, LoginBody, SubmitVerificationCodeBody, ScanBody } from '../api/api.types'
import { ScanType } from '../enums'

describe('ApiController Structure Tests', () => {
  let controller: ApiController

  beforeEach(() => {
    controller = new ApiController()
  })

  describe('Authentication Endpoints', () => {
    test('should have register endpoint', () => {
      expect(typeof controller.register).toBe('function')
    })

    test('should have login endpoint', () => {
      expect(typeof controller.login).toBe('function')
    })

    test('should have verification code endpoint', () => {
      expect(typeof controller.submitVerificationCode).toBe('function')
    })
  })

  describe('Tax Return Management Endpoints', () => {
    test('should have getTaxReturn endpoint', () => {
      expect(typeof controller.getTaxReturn).toBe('function')
    })

    test('should have updateTaxReturn endpoint', () => {
      expect(typeof controller.updateTaxReturn).toBe('function')
    })

    test('should have createTaxReturn endpoint', () => {
      expect(typeof controller.createTaxReturn).toBe('function')
    })

    test('should have archiveTaxReturn endpoint', () => {
      expect(typeof controller.archiveTaxReturn).toBe('function')
    })
  })

  describe('PDF and Tax Calculation Endpoints', () => {
    test('should have generatePdf endpoint', () => {
      expect(typeof controller.generatePdf).toBe('function')
    })

    test('should have getTaxAmount endpoint', () => {
      expect(typeof controller.getTaxAmount).toBe('function')
    })

    test('should have exportECH0119 endpoint', () => {
      expect(typeof controller.exportECH0119).toBe('function')
    })
  })

  describe('User Management Endpoints', () => {
    test('should have getUser endpoint', () => {
      expect(typeof controller.getUser).toBe('function')
    })

    test('should have updateUserData endpoint', () => {
      expect(typeof controller.updateUserData).toBe('function')
    })

    test('should have deleteAccount endpoint', () => {
      expect(typeof controller.deleteAccount).toBe('function')
    })
  })

  describe('Document Scanning Endpoints', () => {
    test('should have scan endpoint', () => {
      expect(typeof controller.scan).toBe('function')
    })
  })

  describe('API Type Validation', () => {
    test('should accept valid RegisterBody structure', () => {
      const registerBody: RegisterBody = {
        ahvNumber: '756.1234.5678.90',
        phoneNumber: '+41123456789',
      }

      expect(registerBody.ahvNumber).toBe('756.1234.5678.90')
      expect(registerBody.phoneNumber).toBe('+41123456789')
    })

    test('should accept valid ScanBody structure', () => {
      const scanBody: ScanBody = {
        data: 'base64-encoded-image-data',
        mimeType: 'image/jpeg',
        type: ScanType.Lohnausweis,
      }

      expect(scanBody.type).toBe(ScanType.Lohnausweis)
      expect(scanBody.mimeType).toBe('image/jpeg')
    })

    test('should accept valid LoginBody structure', () => {
      const loginBody: LoginBody = {
        ahvNumber: '756.1234.5678.90',
      }

      expect(loginBody.ahvNumber).toBe('756.1234.5678.90')
    })

    test('should accept valid SubmitVerificationCodeBody structure', () => {
      const verificationBody: SubmitVerificationCodeBody = {
        code: '1234',
        ahvNumber: '756.1234.5678.90',
      }

      expect(verificationBody.code).toBe('1234')
      expect(verificationBody.ahvNumber).toBe('756.1234.5678.90')
    })
  })
})
