import { Body, Controller, Get, Path, Post, Request, Res, Route, Security, Tags, TsoaResponse } from 'tsoa'
import {
  generatePdf,
  archiveTaxReturn,
  createTaxReturn,
  getTaxReturn,
  getUser,
  loginUser,
  loginWithEmail,
  registerUser,
  scan,
  submitVerificationCode,
  updateTaxReturnData,
  updateUserData,
  getTaxAmount,
  deleteAccount,
  exportECH0119XML,
  getMunicipalities,
} from './api.service'
import fs from 'fs'
import { Injected, TaxAmount, TaxReturn } from '../types'
import {
  CreateTaxReturnBody,
  LoginBody,
  LoginEmailBody,
  RegisterBody,
  ScanBody,
  ScanResponse,
  SubmitVerificationCodeBody,
  UpdateUserDataBody,
  UserT,
} from './api.types'
import express from 'express'
import { SecurityType } from '../enums'

@Route('v1')
@Tags('Api')
export class ApiController extends Controller {
  @Post('register')
  public async register(
    @Body() body: RegisterBody,
  ): Promise<{ success: true; phoneNumber: string } | { error: string }> {
    return registerUser(body)
  }

  @Post('login')
  public async login(
    @Body() body: LoginBody,
  ): Promise<{ success: true; phoneNumber: string } | { error: string }> {
    return loginUser(body)
  }

  @Post('login-email')
  public async loginEmail(
    @Body() body: LoginEmailBody,
  ): Promise<{ token: string; user: UserT } | { error: string }> {
    console.log('body', body)
    if (!body.email) {
      return { error: 'Missing email' }
    }
    return loginWithEmail(body.email)
  }

  @Post('verification-code')
  public async submitVerificationCode(
    @Body() body: SubmitVerificationCodeBody,
  ): Promise<{ token: string; user: UserT } | { error: string }> {
    return submitVerificationCode(body)
  }

  @Security(SecurityType.User)
  @Get('user')
  public async getUser(@Request() injected: Injected): Promise<UserT> {
    return getUser(injected)
  }

  @Get('municipalities')
  public async getMunicipalities(): Promise<{
    municipalities: Array<{
      bfsNumber: number
      name: string
      hasCompleteData: boolean
    }>
  }> {
    return getMunicipalities()
  }

  @Security(SecurityType.User)
  @Post('scan')
  public async scan(@Body() body: ScanBody): Promise<ScanResponse> {
    return scan(body)
  }

  @Security(SecurityType.User)
  @Post('user/update')
  public async updateUserData(
    @Body() body: UpdateUserDataBody,
    @Request() injected: Injected,
  ): Promise<{}> {
    return updateUserData(body, injected)
  }

  @Security(SecurityType.User)
  @Get('tax-return/{taxReturnId}/get')
  public async getTaxReturn(
    @Path() taxReturnId: string,
    @Request() injected: Injected,
  ): Promise<TaxReturn> {
    console.log('taxReturnId', taxReturnId)
    return getTaxReturn(taxReturnId, injected)
  }

  @Security(SecurityType.User)
  @Post('tax-return/{taxReturnId}/update')
  public async updateTaxReturn(
    // @Body() body: UpdateTaxReturnBody,
    @Body() body: any, // TODO - fix is
    @Path() taxReturnId: string,
    @Request() injected: Injected,
  ): Promise<{}> {
    console.log('body', body.data)
    return updateTaxReturnData(taxReturnId, body, injected)
  }

  @Security(SecurityType.User)
  @Post('tax-return/create')
  public async createTaxReturn(
    @Body() body: CreateTaxReturnBody,
    @Request() injected: Injected,
  ): Promise<TaxReturn> {
    return createTaxReturn(body, injected)
  }

  @Security(SecurityType.User)
  @Get('tax-return/{taxReturnId}/archive')
  public async archiveTaxReturn(
    @Request() injected: Injected,
    @Path() taxReturnId: string,
  ): Promise<{}> {
    return archiveTaxReturn(taxReturnId, injected)
  }

  @Security(SecurityType.User)
  @Get('{taxReturnId}/generate-pdf')
  public async generatePdf(@Request() request: express.Request, @Path() taxReturnId: string) {
    const fileName = await generatePdf(taxReturnId, request as any)
    const base64 = fs.readFileSync(fileName).toString('base64')
    fs.unlinkSync(fileName)

    // Also save the PDF locally from base64 for testing purposes
    try {
      const outPath = `generated-${taxReturnId}.pdf`
      fs.writeFileSync(outPath, Buffer.from(base64, 'base64'))
    } catch {}

    return { base64 }
  }

  @Security(SecurityType.User)
  @Get('{taxReturnId}/tax-amount')
  public async getTaxAmount(
    @Request() request: express.Request,
    @Path() taxReturnId: string,
  ): Promise<TaxAmount> {
    const taxReturn = await getTaxReturn(taxReturnId, request as any)
    return getTaxAmount(taxReturn, request as any)
  }

  @Security(SecurityType.User)
  @Post('user/delete')
  public async deleteAccount(
    @Request() req: express.Request,
  ): Promise<{ success: true } | { error: string }> {
    const injected = req as unknown as Injected
    return deleteAccount(injected)
  }

  @Security(SecurityType.User)
  @Get('tax-return/{taxReturnId}/export-ech0119')
  public async exportECH0119(
    @Request() request: express.Request,
    @Path() taxReturnId: string,
    @Res() res: TsoaResponse<200, string>,
  ): Promise<void> {
    const injected = request as unknown as Injected
    const xml = await exportECH0119XML(taxReturnId, injected)
    
    // Get tax return for filename
    const taxReturn = await getTaxReturn(taxReturnId, injected)
    const year = taxReturn.year
    const userId = injected.user._id.toString()
    
    // Set headers for file download
    const filename = `steuererklärung-${year}-${userId}.xml`
    const response = res(200, xml, {
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
  }
}
