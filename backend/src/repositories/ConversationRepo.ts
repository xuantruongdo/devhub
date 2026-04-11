import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Conversation } from "../entities/Conversation";

@Service()
export class ConversationRepo {
  private repo = AppDataSource.getRepository(Conversation);

  async create(data: Partial<Conversation>) {
    const convo = this.repo.create(data);
    return this.repo.save(convo);
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ["participants", "participants.user"],
    });
  }

  async update(id: number, data: Partial<Conversation>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
