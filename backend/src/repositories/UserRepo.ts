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

  async createUser(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}
