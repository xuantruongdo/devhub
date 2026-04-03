import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { PostLike } from "../entities/PostLike";

@Service()
export class PostLikeRepo {
  private repo = AppDataSource.getRepository(PostLike);

  async find(userId: number, postId: number) {
    return this.repo.findOne({
      where: { userId, postId },
    });
  }

  async isLiked(userId: number, postId: number) {
    const like = await this.repo.findOne({
      where: { userId, postId },
      select: ["id"],
    });
    return !!like;
  }

  async create(userId: number, postId: number) {
    return this.repo.save({
      userId,
      postId,
    });
  }

  async remove(userId: number, postId: number) {
    return this.repo.delete({
      userId,
      postId,
    });
  }
}
