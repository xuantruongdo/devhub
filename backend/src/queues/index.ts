import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QueueName } from "../constants";

export const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue(QueueName.EMAIL_QUEUE, {
  connection,
});

export const notificationQueue = new Queue(QueueName.NOTIFICATION_QUEUE, {
  connection,
});
