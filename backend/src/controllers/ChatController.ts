import {
  JsonController,
  Post,
  Get,
  Body,
  Param,
  QueryParam,
  CurrentUser,
} from "routing-controllers";
import { Service } from "typedi";
import { ChatService } from "../services/ChatService";
import { UserProps } from "../types/auth";
import { CreateConversationDto, SendMessageDto } from "../dtos/ChatDto";

@Service()
@JsonController("/chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post("/conversation")
  async accessConversation(
    @Body() body: CreateConversationDto,
    @CurrentUser() user: UserProps,
  ) {
    return this.chatService.accessConversation(user.id, body.userId);
  }

  @Post("/message")
  async sendMessage(
    @Body()
    body: SendMessageDto,
    @CurrentUser() user: UserProps,
  ) {
    return this.chatService.sendMessage({
      conversationId: body.conversationId,
      senderId: user.id,
      content: body.content,
    });
  }

  @Get("/messages/:conversationId")
  async getMessages(
    @Param("conversationId") conversationId: number,
    @QueryParam("limit") limit?: number,
    @QueryParam("cursor") cursor?: number,
  ) {
    return this.chatService.getMessages(conversationId, {
      limit,
      cursor,
    });
  }

  @Post("/read/:conversationId")
  async markAsRead(
    @Param("conversationId") conversationId: number,
    @CurrentUser() user: UserProps,
  ) {
    return this.chatService.markAsRead(conversationId, user.id);
  }

  @Get("/conversations")
  async getMyConversations(@CurrentUser() user: UserProps) {
    return this.chatService.getUserConversations(user.id);
  }
}
