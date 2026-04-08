import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { FindUserOptions, UserProps } from "../types/auth";
import { FindOptionsWhere } from "typeorm";

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

  async findOne(
    where: FindOptionsWhere<User>,
    options?: {
      relations?: string[];
    },
  ): Promise<User | null> {
    const { relations } = options || {};

    const user = await this.repo.findOne({
      where,
      relations,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        isVerified: true,
        role: true,
        followers: true,
        followings: true,
      },
    });

    return user;
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.save(user);
  }

  async update(id: number, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async findByUsername(username: string, currentUserId: number) {
    const qb = this.repo
      .createQueryBuilder("user")
      .leftJoin(
        "user_followers",
        "uf",
        "uf.userId = user.id AND uf.followerId = :currentUserId",
        { currentUserId },
      )
      .where("user.username = :username", { username })
      .select([
        "user.id",
        "user.username",
        "user.fullName",
        "user.email",
        "user.role",
        "user.avatar",
        "user.bio",
        "user.website",
        "user.birthday",
        "user.location",
        "user.isActive",
        "user.isVerified",
        "user.lastLogin",
        "user.followerCount",
        "user.followingCount",
        "user.postCount",
        "user.createdAt",
        "user.updatedAt",
      ])
      .addSelect(
        "CASE WHEN uf.followerId IS NOT NULL THEN 1 ELSE 0 END",
        "uf_isFollowing",
      );

    const { raw, entities } = await qb.getRawAndEntities();
    const user = entities[0];
    if (!user) return null;

    const isFollowing = raw[0]?.uf_isFollowing === 1;

    return {
      ...user,
      isFollowing,
    };
  }
}
