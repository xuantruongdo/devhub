import { Worker, Job } from "bullmq";
import { Service } from "typedi";
import { connection } from "../queues";
import { QueueName, UserJobName } from "../constants";
import { USER_INDEX } from "../indices/user";
import { es } from "../libs/elastic-search";
import { UserRepo } from "../repositories/UserRepo";

@Service()
export class UserWorker {
  private worker: Worker;

  constructor(private userRepo: UserRepo) {
    this.worker = new Worker(QueueName.USER_QUEUE, this.process.bind(this), {
      connection,
      concurrency: 5,
    });

    this.registerEvents();
  }

  private async process(job: Job) {
    switch (job.name) {
      case UserJobName.CREATE_USER_TO_ES:
        await this.createUserToES(job.data.userId);
        break;

      case UserJobName.UPDATE_USER_TO_ES:
        await this.updateUserToES(job.data.userId);
        break;

      case UserJobName.DELETE_USER_FROM_ES:
        await this.deleteUserFromES(job.data.userId);
        break;

      default:
        console.warn(`[USER WORKER] Unknown job: ${job.name}`);
    }
  }

  private async createUserToES(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) return;

    await es.index({
      index: USER_INDEX,
      id: user.id.toString(),
      document: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        followerCount: user.followerCount,
        deletedAt: user.deletedAt ?? undefined,
      },
    });
  }

  private async updateUserToES(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) return;

    await es.update({
      index: USER_INDEX,
      id: user.id.toString(),
      doc: {
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        followerCount: user.followerCount,
      },
      doc_as_upsert: true,
    });
  }

  private async deleteUserFromES(userId: number) {
    await es.delete({
      index: USER_INDEX,
      id: userId.toString(),
    });
  }

  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`[USER WORKER] Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[USER WORKER] Job ${job?.id} failed`, err);
    });
  }

  public close() {
    return this.worker.close();
  }
}
