import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { NotificationType } from "../entities/Notification";

export class CreateNotificationDto {
  @IsNumber()
  recipientId!: number;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsNumber()
  postId?: number;

  @IsOptional()
  @IsNumber()
  commentId?: number;
}
