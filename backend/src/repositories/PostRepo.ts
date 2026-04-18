import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Post } from "../entities/Post";
import { BaseRepo } from "./BaseRepo";
import { PostLike } from "../entities/PostLike";

@Service()
export class PostRepo extends BaseRepo<Post> {
  constructor() {
    super(Post, AppDataSource);
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

  /**
   * Lấy candidate posts để build feed
   *
   * Nguyên tắc:
   * - DB chỉ filter + lấy data
   * - Ranking, pagination xử lý ở service
   *
   * Logic:
   * ✔ Lấy:
   *   - Post PUBLIC
   *   - Post của chính user (kể cả PRIVATE)
   *
   * ❌ Không lấy:
   *   - Post PRIVATE của người khác
   *
   * ⚠️ Lưu ý:
   * - KHÔNG filter theo followings ở DB
   *   → follow chỉ dùng để boost score (ở service)
   *
   * Select:
   * - Chỉ lấy field cần thiết (tránh over-fetch)
   * - Không lấy like/comment/share (fetch realtime sau)
   *
   * Order:
   * - createdAt DESC (ưu tiên bài mới)
   *
   * Limit:
   * - take(100) để giảm load
   */
  async findFeedCandidates(currentUserId: number) {
    const query = this.createQueryBuilder("post")
      // join author để hiển thị thông tin user
      .leftJoin("post.author", "author")

      // chỉ select field cần thiết
      .select([
        "post.id",
        "post.authorId",
        "post.content",
        "post.images",
        "post.visibility",
        "post.createdAt",

        "author.id",
        "author.username",
        "author.fullName",
        "author.email",
        "author.avatar",
        "author.isVerified",
      ])

      .where(
        `(
        post.visibility = :public
        OR post.authorId = :currentUserId
      )`,
        {
          public: "public",
          currentUserId,
        },
      )

      // ưu tiên lấy post mới
      .orderBy("post.createdAt", "DESC")

      // giới hạn số lượng candidate
      .take(100);

    return query.getMany();
  }

  /**
   * Lấy thông tin interaction + counters của posts theo user
   *
   * Bao gồm:
   * - isLiked (user đã like chưa)
   * - likeCount
   * - commentCount
   * - shareCount
   *
   * @param userId
   * @param postIds
   * @returns Map<postId, { isLiked, likeCount, commentCount, shareCount }>
   */
  async getPostInteractionMetaForUser(userId: number, postIds: number[]) {
    if (!postIds.length) return new Map<number, any>();

    // Lấy counters từ post
    const posts = await this.createQueryBuilder("post")
      .select([
        "post.id",
        "post.likeCount",
        "post.commentCount",
        "post.shareCount",
      ])
      .where("post.id IN (:...postIds)", { postIds })
      .getMany();

    // Lấy liked posts của user
    const likes = await this.manager
      .createQueryBuilder(PostLike, "like")
      .select("like.postId", "postId")
      .where("like.userId = :userId", { userId })
      .andWhere("like.postId IN (:...postIds)", { postIds })
      .getRawMany();

    const likedSet = new Set(likes.map((l) => l.postId));

    // Merge vào map
    const map = new Map<number, any>();

    posts.forEach((p) => {
      map.set(p.id, {
        isLiked: likedSet.has(p.id),
        likeCount: p.likeCount,
        commentCount: p.commentCount,
        shareCount: p.shareCount,
      });
    });

    return map;
  }
}
