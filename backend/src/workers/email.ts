import { Worker, Job } from "bullmq";
import { Service } from "typedi";
import { MailService } from "../services/MailService";
import { connection } from "../queues/email";
import { EmailJobName, QueueName } from "../constants";

@Service()
export class EmailWorker {
  private worker: Worker;

  constructor(private mailService: MailService) {
    this.worker = new Worker(QueueName.EMAIL_QUEUE, this.process.bind(this), {
      connection: connection,
      concurrency: 5,
    });

    this.registerEvents();
  }

  private async process(job: Job) {
    switch (job.name) {
      case EmailJobName.SEND_VERIFY_EMAIL:
        await this.mailService.sendVerifyEmail(job.data);
        break;

      default:
        console.warn(`[EMAIL WORKER] Unknown job: ${job.name}`);
    }
  }

  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`[EMAIL WORKER] Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[EMAIL WORKER] Job ${job?.id} failed`, err);
    });
  }

  public close() {
    return this.worker.close();
  }
}
