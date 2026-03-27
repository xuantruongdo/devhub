import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

@Service()
export class UserRepo {
  private repo = AppDataSource.getRepository(User);

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.repo.findOne({
      where: { username },
    });
  }

  async createUser(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async updateUser(id: number, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }
}
