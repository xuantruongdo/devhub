import Container from "typedi";
import { EmailWorker } from "../workers/email";

export const initWorkers = () => {
  const emailWorker = Container.get(EmailWorker);

  console.log("📨 Worker started");

  return {
    emailWorker,
  };
};
