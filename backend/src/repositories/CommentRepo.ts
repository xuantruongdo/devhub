import { Service } from "typedi";
import { Comment } from "../entities/Comment";
import { AppDataSource } from "../config/data-source";
import { BaseRepo } from "./BaseRepo";

@Service()
export class CommentRepo extends BaseRepo<Comment> {
  constructor() {
    super(Comment, AppDataSource);
  }

  async getLikedMap(
    ids: number[],
    userId: number,
  ): Promise<Map<number, boolean>> {
    const map = new Map<number, boolean>();

    if (!ids.length) return map;

    const rows = await this.createQueryBuilder("comment")
      .leftJoin(
        "comment_like",
        "cl",
        "cl.commentId = comment.id AND cl.userId = :userId",
        { userId },
      )
      .where("comment.id IN (:...ids)", { ids })
      .select("comment.id", "id")
      .addSelect("CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END", "isLiked")
      .getRawMany();

    rows.forEach((r) => {
      map.set(Number(r.id), Number(r.isLiked) === 1);
    });

    return map;
  }

  async getRootComments(postId: number, currentUserId: number) {
    return this.createQueryBuilder("comment")
      .leftJoinAndSelect("comment.author", "author")
      .where("comment.postId = :postId", { postId })
      .andWhere("comment.parentId IS NULL")
      .orderBy(
        `CASE WHEN comment.authorId = :currentUserId THEN 0 ELSE 1 END`,
        "ASC",
      )
      .addOrderBy("comment.likeCount", "DESC")
      .addOrderBy("comment.createdAt", "ASC")
      .setParameter("currentUserId", currentUserId)
      .getMany();
  }

  async getReplies(postId: number, currentUserId: number) {
    return this.createQueryBuilder("reply")
      .leftJoinAndSelect("reply.author", "author")
      .where("reply.postId = :postId", { postId })
      .andWhere("reply.parentId IS NOT NULL")
      .orderBy(
        `CASE WHEN reply.authorId = :currentUserId THEN 0 ELSE 1 END`,
        "ASC",
      )
      .addOrderBy("reply.likeCount", "DESC")
      .addOrderBy("reply.createdAt", "ASC")
      .setParameter("currentUserId", currentUserId)
      .getMany();
  }
}
