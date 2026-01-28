import { generateCode } from './util'
import twilio from 'twilio'

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const sendCode = async (phoneNumber: string): Promise<string> => {
  const code = generateCode(6)

  console.log('Sending code', code, 'to', phoneNumber)

  // if (process.env.NODE_ENV === 'development') {
  //   return code
  // }

  try {
    await twilioClient.messages.create({
      body: `WeTax - Verification Code: ${code}. Do not share this code with anyone.`,
      from: `+17756288354`,
      to: phoneNumber,
    })
    console.log('Code sent successfully')
  } catch (error) {
    throw new Error('Invalid Phone Number')
  }

  return code
}
