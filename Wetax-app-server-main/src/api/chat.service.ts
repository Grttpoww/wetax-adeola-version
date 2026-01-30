import { Injected, ChatMessage } from '../types'
import { SendChatMessageBody, ChatMessageResponse, ChatHistoryResponse, ChatUsageResponse } from './chat.types'

export const sendChatMessage = async (
  body: SendChatMessageBody,
  injected: Injected,
): Promise<ChatMessageResponse | { error: string }> {
  // TODO: Phase 4 implementation
  return { error: 'Not implemented yet' }
}

export const getChatHistory = async (
  injected: Injected,
): Promise<ChatHistoryResponse | { error: string }> {
  // TODO: Phase 6 implementation
  return { messages: [] }
}

export const getChatUsage = async (
  injected: Injected,
): Promise<ChatUsageResponse | { error: string }> {
  // TODO: Phase 3 implementation
  return { used: 0, limit: 244000, percentage: 0 }
}




