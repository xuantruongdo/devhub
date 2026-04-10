import { IsNumber, IsString } from "class-validator";

export class CreateConversationDto {
  @IsNumber()
  userId!: number;
}

export class SendMessageDto {
  @IsNumber()
  conversationId!: number;

  @IsString({ message: "Content must be a string" })
  content!: string;
}
