import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { FindUserOptions } from "../types/auth";

@Service()
export class UserRepo {
  private repo = AppDataSource.getRepository(User);

  async findById(id: number, options: FindUserOptions = {}) {
    const { includeRefreshToken = false } = options;

    const qb = this.repo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.followers", "follower")
      .leftJoinAndSelect("user.followings", "following")
      .where("user.id = :id", { id });

    const selectFields = [
      "user.id",
      "user.username",
      "user.fullName",
      "user.avatar",
      "user.isVerified",
      "user.isActive",

      "follower.id",
      "follower.username",
      "follower.fullName",
      "follower.avatar",
      "follower.isVerified",

      "following.id",
      "following.username",
      "following.fullName",
      "following.avatar",
      "following.isVerified",
    ];

    if (includeRefreshToken) {
      selectFields.push("user.refreshToken");
    }

    qb.select(selectFields);

    return qb.getOne();
  }

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

  async create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: number, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }
}
