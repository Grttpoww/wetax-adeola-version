import { ChatMessage } from '../types'

export type SendChatMessageBody = {
  message: string
  taxReturnId?: string // Optional: if user wants to reference specific tax return
}

export type ChatMessageResponse = {
  message: string
  action?: {
    type: 'navigate' | 'update'
    screen?: string
    path?: string
    value?: any
    params?: Record<string, any>
  }
}

export type ChatHistoryResponse = {
  messages: ChatMessage[]
}

export type ChatUsageResponse = {
  used: number
  limit: number
  percentage: number
}



