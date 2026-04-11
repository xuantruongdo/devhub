import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Message } from "../entities/Message";
import { MESSAGE_LIMIT } from "../constants";

@Service()
export class MessageRepo {
  private repo = AppDataSource.getRepository(Message);

  async create(data: Partial<Message>) {
    const msg = this.repo.create(data);
    return this.repo.save(msg);
  }

  async getMessages(
    conversationId: number,
    options?: {
      limit?: number;
      cursor?: number;
      anchor?: number;
    },
  ) {
    const limit = options?.limit || MESSAGE_LIMIT;

    const qb = this.repo
      .createQueryBuilder("m")
      .leftJoin("m.sender", "sender")
      .addSelect([
        "sender.id",
        "sender.email",
        "sender.username",
        "sender.fullName",
        "sender.avatar",
        "sender.isVerified",
      ])
      .where("m.conversationId = :conversationId", { conversationId })
      .orderBy("m.id", "DESC")
      .take(limit);

    if (options?.cursor) {
      qb.andWhere("m.id < :cursor", { cursor: options.cursor });
    }

    // ✅ FIX QUAN TRỌNG
    if (options?.anchor) {
      qb.andWhere("m.id <= :anchor", { anchor: options.anchor });
    }

    return qb.getMany();
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ["sender"],
    });
  }

  async findLastMessage(conversationId: number) {
    return this.repo.findOne({
      where: { conversationId },
      order: { id: "DESC" },
    });
  }
}
