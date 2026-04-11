import instance from "@/lib/api";
import { ConversationInput, Participant, SendMessageInput } from "@/types/chat";

class ChatService {
  async accessConversation(data: ConversationInput) {
    return await instance.post(`/chat/conversation`, data);
  }

  async sendMessage(data: SendMessageInput) {
    return await instance.post(`/chat/message`, data);
  }

  async getMessages(
    conversationId: number,
    params?: {
      limit?: number;
      cursor?: number;
      anchor?: number;
    },
  ) {
    return await instance.get(`/chat/messages/${conversationId}`, {
      params,
    });
  }

  async markAsRead(conversationId: number) {
    return await instance.post(`/chat/read/${conversationId}`);
  }

  async getMyConversations() {
    return await instance.get<Participant[]>(`/chat/conversations`);
  }
}

const chatService = new ChatService();
export default chatService;
