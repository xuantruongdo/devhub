import { createAppSlice } from "@/redux/createAppSlice";
import { Post } from "@/types/post";
import { PayloadAction } from "@reduxjs/toolkit";

export const feed = createAppSlice({
  name: "feed",
  initialState: [] as Post[],
  reducers: {
    setFeed: (_, action: PayloadAction<Post[]>) => {
      return action.payload;
    },

    addPost: (state, action: PayloadAction<Post>) => {
      state.unshift(action.payload);
    },

    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deletePost: (state, action: PayloadAction<number>) => {
      return state.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setFeed, addPost, updatePost, deletePost } = feed.actions;
export default feed.reducer;
