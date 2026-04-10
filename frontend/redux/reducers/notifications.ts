import { createAppSlice } from "@/redux/createAppSlice";
import { Notification } from "@/types/notification";
import { PayloadAction } from "@reduxjs/toolkit";

export const notifications = createAppSlice({
  name: "notifications",
  initialState: [] as Notification[],
  reducers: {
    setNotifications: (_, action: PayloadAction<Notification[]>) => {
      return action.payload;
    },
  },
});

export const { setNotifications } = notifications.actions;
export default notifications.reducer;
