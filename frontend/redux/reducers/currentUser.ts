import { createAppSlice } from "@/redux/createAppSlice";
import { CurrentUserResponse } from "@/types/auth";
import { PayloadAction } from "@reduxjs/toolkit";

export const currentUser = createAppSlice({
  name: "currentUser",
  initialState: {
    id: 0,
    username: "",
    fullName: "",
    email: "",
    role: "",
    avatar: "",
    isVerified: false,
  },
  reducers: {
    setCurrentUser: (state, action: PayloadAction<CurrentUserResponse>) => {
      state = action.payload;
      return state;
    },
  },
});
export const { setCurrentUser } = currentUser.actions;
export default currentUser.reducer;
