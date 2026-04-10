import {
  JsonController,
  Body,
  Param,
  Put,
  Delete,
  Post,
  CurrentUser,
  Get,
  QueryParam,
} from "routing-controllers";
import { Service } from "typedi";
import { UserProps } from "../types/auth";
import { NotificationService } from "../services/Notification";
import { CreateNotificationDto } from "../dtos/NotificationDto";

@Service()
@JsonController("/notifications")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post()
  async create(
    @Body({ validate: true }) body: CreateNotificationDto,
    @CurrentUser() user: UserProps,
  ) {
    return this.notificationService.create({
      ...body,
      senderId: user.id,
    });
  }

  @Get()
  async getUserNotifications(
    @CurrentUser() user: UserProps,
    @QueryParam("limit") limit?: number,
    @QueryParam("cursor") cursor?: number,
  ) {
    return this.notificationService.getUserNotifications(user.id, {
      limit,
      cursor,
    });
  }

  @Get("/unread-count")
  async getUnreadCount(@CurrentUser() user: UserProps) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Put("/:id/read")
  async markAsRead(@Param("id") id: number, @CurrentUser() user: UserProps) {
    return this.notificationService.markAsRead(user.id, id);
  }

  @Put("/read-all")
  async markAllAsRead(@CurrentUser() user: UserProps) {
    await this.notificationService.markAllAsRead(user.id);
    return { success: true };
  }

  @Delete("/:id")
  async remove(@Param("id") id: number, @CurrentUser() user: UserProps) {
    await this.notificationService.remove(id);
    return { success: true };
  }
}
