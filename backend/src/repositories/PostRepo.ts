import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Post } from "../entities/Post";
import { BaseRepo } from "./BaseRepo";

@Service()
export class PostRepo extends BaseRepo<Post> {
  constructor() {
    super(Post, AppDataSource);
  }

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
    const query = this.createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")

      .leftJoin("post.likes", "like", "like.userId = :currentUserId", {
        currentUserId,
      })

      .select([
        "post",
        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])

      .addSelect(
        `CASE 
        WHEN like.id IS NOT NULL THEN 1
        ELSE 0
      END`,
        "isLiked",
      )

      .andWhere(
        "(post.visibility = :publicVisibility OR post.authorId = :currentUserId)",
        {
          publicVisibility: "public",
          currentUserId,
        },
      );

    if (followingsIds?.length) {
      query
        .addOrderBy(
          `CASE WHEN post.authorId IN (:...followingsIds) THEN 1 ELSE 0 END`,
          "DESC",
        )
        .setParameter("followingsIds", followingsIds);
    }

    query
      .addOrderBy("post.likeCount", "DESC")
      .addOrderBy("post.commentCount", "DESC")
      .addOrderBy("post.shareCount", "DESC")
      .addOrderBy("post.createdAt", "DESC");

    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((post) => {
      const found = raw.find((r) => r.post_id === post.id);
      return {
        ...post,
        isLiked: !!found?.isLiked,
      };
    });
  }

  async findPostsByUsername(username: string, currentUserId: number) {
    const query = this.createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")

      // check isLiked
      .leftJoin("post.likes", "like", "like.userId = :currentUserId", {
        currentUserId,
      })

      .select([
        "post",
        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])

      .addSelect(
        `CASE 
        WHEN like.id IS NOT NULL THEN 1
        ELSE 0
      END`,
        "isLiked",
      )

      // lọc theo username
      .where("author.username = :username", { username })

      // visibility rule
      .andWhere(
        `(post.visibility = :publicVisibility 
        OR author.id = :currentUserId)`,
        {
          publicVisibility: "public",
          currentUserId,
        },
      )

      // sort mới nhất
      .orderBy("post.createdAt", "DESC");

    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((post) => {
      const found = raw.find((r) => r.post_id === post.id);

      return {
        ...post,
        isLiked: !!found?.isLiked,
      };
    });
  }

  async findPostById(id: number, currentUserId: number) {
    return await this.createQueryBuilder("post")
      .leftJoin("post.author", "author")
      .where("(post.visibility = :public OR post.authorId = :currentUserId)", {
        public: "public",
        currentUserId,
      })
      .andWhere("post.id = :id", { id })
      .select([
        "post.id",
        "post.authorId",
        "post.content",
        "post.images",
        "post.visibility",

        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])
      .getOne();
  }

  async getPostCounts(postId: number): Promise<{
    likeCount: number;
    commentCount: number;
    shareCount: number;
  }> {
    const result = await this.createQueryBuilder("post")
      .select("post.likeCount", "likeCount")
      .addSelect("post.commentCount", "commentCount")
      .addSelect("post.shareCount", "shareCount")
      .where("post.id = :postId", { postId })
      .getRawOne();

    return {
      likeCount: Number(result?.likeCount || 0),
      commentCount: Number(result?.commentCount || 0),
      shareCount: Number(result?.shareCount || 0),
    };
  }

  async checkPostLiked(postId: number, userId: number): Promise<boolean> {
    const result = await this.createQueryBuilder()
      .select("1")
      .from("post_like", "pl")
      .where("pl.postId = :postId", { postId })
      .andWhere("pl.userId = :userId", { userId })
      .limit(1)
      .getRawOne();

    return !!result;
  }

  async findMe(userId: number) {
    return this.createQueryBuilder("post")
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
}
