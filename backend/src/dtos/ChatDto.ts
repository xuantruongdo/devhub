import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { CallStatus, MessageType } from "../entities/Message";

export class CreateConversationDto {
  @IsNumber()
  userId!: number;
}

export class SendMessageDto {
  @IsNumber()
  conversationId!: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsNumber()
  callDuration?: number;

  @IsOptional()
  @IsEnum(CallStatus)
  callStatus?: CallStatus;
}
