import { Body, Controller, Get, Path, Post, Request, Route, Security, Tags } from 'tsoa'
import { Injected } from '../types'
import { SecurityType } from '../enums'
import {
  sendChatMessage,
  getChatHistory,
  getChatUsage,
} from './chat.service'
import {
  SendChatMessageBody,
  ChatMessageResponse,
  ChatHistoryResponse,
  ChatUsageResponse,
} from './chat.types'

@Route('v1/chat')
@Tags('Chat')
export class ChatController extends Controller {
  @Security(SecurityType.User)
  @Post('message')
  public async sendMessage(
    @Body() body: SendChatMessageBody,
    @Request() injected: Injected,
  ): Promise<ChatMessageResponse | { error: string }> {
    return sendChatMessage(body, injected)
  }

  @Security(SecurityType.User)
  @Get('history')
  public async getHistory(
    @Request() injected: Injected,
  ): Promise<ChatHistoryResponse | { error: string }> {
    return getChatHistory(injected)
  }

  @Security(SecurityType.User)
  @Get('usage')
  public async getUsage(
    @Request() injected: Injected,
  ): Promise<ChatUsageResponse | { error: string }> {
    return getChatUsage(injected)
  }
}



