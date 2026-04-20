import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { FindUserOptions } from "../types/auth";
import { BaseRepo } from "./BaseRepo";
import { ILike } from "typeorm";

@Service()
export class UserRepo extends BaseRepo<User> {
  constructor() {
    super(User, AppDataSource);
  }

  async pagination(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          fullName: ILike(`%${search}%`),
        }
      : {};

    const [data, total] = await this.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: "DESC",
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        lastLogin: true,
        postCount: true,
        createdAt: true,
      },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number, options: FindUserOptions = {}) {
    const { includeRefreshToken = false } = options;

    const qb = this.createQueryBuilder("user")
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
    return this.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.createQueryBuilder("user")
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
      .getOne();
  }

  async checkIsFollowing(me: number, target: number): Promise<boolean> {
    const result = await this.createQueryBuilder()
      .select("1")
      .from("user_followers", "uf")
      .where("uf.userId = :target", { target })
      .andWhere("uf.followerId = :me", { me })
      .limit(1)
      .getRawOne();

    return !!result;
  }

  async getFollowerIds(userId: number): Promise<number[]> {
    const rows = await this.createQueryBuilder("user")
      .leftJoin("user.followings", "following")
      .where("following.id = :userId", { userId })
      .select("user.id", "id")
      .getRawMany();

    return rows.map((r) => r.id);
  }

  async getSuggestedUsers(currentUserId: number) {
    const currentUser = await this.findOne({
      where: { id: currentUserId },
      relations: {
        followings: true,
      },
    });

    const followingIds = currentUser?.followings.map((u) => u.id) || [];

    return this.createQueryBuilder("user")
      .where("user.id != :currentUserId", { currentUserId })
      .andWhere(
        followingIds.length ? "user.id NOT IN (:...followingIds)" : "1=1",
        { followingIds },
      )
      .orderBy("user.createdAt", "DESC")
      .limit(5)
      .getMany();
  }
}
