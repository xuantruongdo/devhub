import { createAppSlice } from "@/redux/createAppSlice";
import { Conversation, Message, Participant } from "@/types/chat";
import { PayloadAction } from "@reduxjs/toolkit";

export const conversation = createAppSlice({
  name: "conversation",
  initialState: {
    id: 0,
    isGroup: false,
    title: "",
    participants: [] as Participant[],
    messages: [] as Message[],
    lastMessage: {},
  } as Conversation,
  reducers: {
    setSelectedConversation: (state, action: PayloadAction<Conversation>) => {
      state = action.payload;
      return state;
    },
  },
});
export const { setSelectedConversation } = conversation.actions;
export default conversation.reducer;
