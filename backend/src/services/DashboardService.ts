import { Service } from "typedi";
import { UserRepo } from "../repositories/UserRepo";
import { PostRepo } from "../repositories/PostRepo";
import { MoreThan } from "typeorm";

@Service()
export class DashboardService {
  constructor(
    private userRepo: UserRepo,
    private postRepo: PostRepo,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({
      where: { isActive: true },
    });

    const verifiedUsers = await this.userRepo.count({
      where: { isVerified: true },
    });

    const totalPosts = await this.postRepo.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await this.userRepo.count({
      where: {
        createdAt: MoreThan(today),
      },
    });

    const newPostsToday = await this.postRepo.count({
      where: {
        createdAt: MoreThan(today),
      },
    });

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalPosts,
      newUsersToday,
      newPostsToday,
    };
  }

  async getRecentUsers(limit: number = 5) {
    return this.userRepo.find({
      order: {
        createdAt: "DESC",
      },
      take: limit,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  async getRecentPosts(limit: number = 5) {
    return this.postRepo.find({
      relations: ["author"],
      order: {
        createdAt: "DESC",
      },
      take: limit,
      select: {
        id: true,
        content: true,
        images: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        createdAt: true,
        author: {
          id: true,
          fullName: true,
          avatar: true,
          username: true,
        },
      },
    });
  }

  async getUserGrowth() {
    const days = 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const next = new Date(date);
      next.setDate(date.getDate() + 1);

      const count = await this.userRepo.count({
        where: {
          createdAt: MoreThan(date),
        },
      });

      result.push({
        date: date.toISOString().split("T")[0],
        users: count,
      });
    }

    return result;
  }

  async getPostGrowth() {
    const days = 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const count = await this.postRepo.count({
        where: {
          createdAt: MoreThan(date),
        },
      });

      result.push({
        date: date.toISOString().split("T")[0],
        posts: count,
      });
    }

    return result;
  }
}
