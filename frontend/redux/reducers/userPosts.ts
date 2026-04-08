import { createAppSlice } from "@/redux/createAppSlice";
import { Post } from "@/types/post";
import { PayloadAction } from "@reduxjs/toolkit";

export const userPosts = createAppSlice({
  name: "userPosts",
  initialState: [] as Post[],
  reducers: {
    setUserPosts: (_, action: PayloadAction<Post[]>) => {
      return action.payload;
    },

    addUserPost: (state, action: PayloadAction<Post>) => {
      state.unshift(action.payload);
    },

    updateUserPost: (state, action: PayloadAction<Post>) => {
      const index = state.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteUserPost: (state, action: PayloadAction<number>) => {
      return state.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setUserPosts, addUserPost, updateUserPost, deleteUserPost } =
  userPosts.actions;
export default userPosts.reducer;
