import { Worker, Job } from "bullmq";
import { Service } from "typedi";
import { NotificationJobName, QueueName } from "../constants";
import { connection } from "../queues";
import { emitNewNotification } from "../libs/io";

@Service()
export class NotificationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QueueName.NOTIFICATION_QUEUE,
      this.process.bind(this),
      {
        connection: connection,
        concurrency: 10, // notification thường nhiều → nên cao hơn email
      },
    );

    this.registerEvents();
  }

  private async process(job: Job) {
    switch (job.name) {
      case NotificationJobName.FOLLOW:
      case NotificationJobName.LIKE_POST:
      case NotificationJobName.COMMENT:
      case NotificationJobName.LIKE_COMMENT:
        return this.handleEmit(job);

      default:
        console.warn(`[NOTIFICATION WORKER] Unknown job: ${job.name}`);
    }
  }

  private async handleEmit(job: Job) {
    const { recipientId, notification } = job.data;
    return emitNewNotification(recipientId, notification);
  }

  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`[NOTIFICATION WORKER] Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[NOTIFICATION WORKER] Job ${job?.id} failed`, err);
    });
  }

  public close() {
    return this.worker.close();
  }
}
