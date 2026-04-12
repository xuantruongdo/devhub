import { Message } from "../entities/Message";
import { Notification } from "../entities/Notification";
import { UserProps } from "./auth";

export type MessageWithSender = Omit<Message, "sender"> & {
  sender: UserProps;
};

export type NotificationWithSender = Omit<Notification, "sender"> & {
  sender: UserProps;
};
