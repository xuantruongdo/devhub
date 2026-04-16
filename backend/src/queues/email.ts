import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QueueName } from "../constants";

export const connection = new IORedis(process.env.REDIS_URL!);

export const emailQueue = new Queue(QueueName.EMAIL_QUEUE, {
  connection,
});
