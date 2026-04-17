import Container from "typedi";
import { EmailWorker } from "../workers/email";
import { NotificationWorker } from "../workers/notification";

export const initWorkers = () => {
  const emailWorker = Container.get(EmailWorker);
  const notificationWorker = Container.get(NotificationWorker);

  console.log("📨 Worker started");

  return {
    emailWorker,
    notificationWorker,
  };
};
