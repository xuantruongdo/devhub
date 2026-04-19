import Container from "typedi";
import { EmailWorker } from "../workers/email";
import { NotificationWorker } from "../workers/notification";
import { UserWorker } from "../workers/user";

export const initWorkers = () => {
  const emailWorker = Container.get(EmailWorker);
  const notificationWorker = Container.get(NotificationWorker);
  const userWorker = Container.get(UserWorker);

  console.log("📨 Worker started");

  return {
    emailWorker,
    notificationWorker,
    userWorker,
  };
};
