import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Post } from "../entities/Post";

@Service()
export class PostRepo {
  private repo = AppDataSource.getRepository(Post);

  /**
   * Lấy feed cho người dùng hiện tại
   *
   * Logic:
   * 1. Chỉ lấy post public hoặc post của chính user hiện tại (bao gồm private)
   * 2. Nếu có followings:
   *    - Ưu tiên các post của followings lên đầu feed (isFollowingPost = 1)
   * 3. Sắp xếp trong cùng nhóm:
   *    - likeCount DESC
   *    - commentCount DESC
   *    - shareCount DESC
   *    - createdAt DESC (mới nhất trước)
   *
   * Thứ tự hiển thị:
   * 1. Post của followings (public)
   * 2. Các post public khác
   * 3. Post private của chính user
   * 4. Post private của người khác sẽ không hiển thị
   *
   * @param currentUserId - ID của người dùng hiện tại
   * @param followingsIds - Mảng ID của các followings để ưu tiên post
   * @returns Danh sách các post được sắp xếp theo feed
   */
  async findAllFeed(currentUserId: number, followingsIds: number[]) {
    const query = this.repo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .select([
        "post",
        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])
      .andWhere(
        "(post.visibility = :publicVisibility OR post.authorId = :currentUserId)",
        {
          publicVisibility: "public",
          currentUserId,
        },
      );

    if (followingsIds && followingsIds.length > 0) {
      query
        .addSelect(
          `
      CASE 
        WHEN post.authorId IN (:...followingsIds) THEN 1
        ELSE 0
      END
    `,
          "isFollowingPost",
        )
        .setParameter("followingsIds", followingsIds)
        .orderBy("isFollowingPost", "DESC");
    }

    query
      .addOrderBy("post.likeCount", "DESC")
      .addOrderBy("post.commentCount", "DESC")
      .addOrderBy("post.shareCount", "DESC")
      .addOrderBy("post.createdAt", "DESC");

    return query.getMany();
  }

  async findById(id: number) {
    return this.repo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .select([
        "post",
        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])
      .where("post.id = :id", { id })
      .getOne();
  }

  async findMe(userId: number) {
    return this.repo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .select([
        "post",
        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])
      .where("post.authorId = :userId", { userId })
      .orderBy("post.createdAt", "DESC")
      .getMany();
  }

  async create(data: Partial<Post>) {
    const post = this.repo.create(data);
    return this.repo.save(post);
  }

  async save(post: Partial<Post>) {
    return this.repo.save(post);
  }

  async remove(post: Post) {
    return this.repo.remove(post);
  }
}
