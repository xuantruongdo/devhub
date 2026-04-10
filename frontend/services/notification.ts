import instance from "@/lib/api";
import { BaseService } from "./base";

class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }

  async getUnreadCount() {
    return await instance.get(`/notifications/unread-count`);
  }

  async markAsRead(id: number) {
    return await instance.put(`/notifications/${id}/read`);
  }

  async markAllRead() {
    return await instance.put(`/notifications/read-all`);
  }

  async remove(id: number) {
    return await instance.delete(`/notifications/${id}`);
  }
}

const notificationService = new NotificationService();
export default notificationService;
