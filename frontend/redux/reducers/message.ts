import { createAppSlice } from "@/redux/createAppSlice";
import { Message } from "@/types/chat";
import { PayloadAction } from "@reduxjs/toolkit";

export const messages = createAppSlice({
  name: "messages",
  initialState: [] as Message[],

  reducers: {
    setMessages: (_, action: PayloadAction<Message[]>) => {
      return action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      state.push(action.payload);
    },

    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    prependMessages: (state, action: PayloadAction<Message[]>) => {
      return [...action.payload, ...state];
    },

    removeMessage: (state, action: PayloadAction<number>) => {
      return state.filter((m) => m.id !== action.payload);
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  prependMessages,
  removeMessage,
} = messages.actions;

export default messages.reducer;
