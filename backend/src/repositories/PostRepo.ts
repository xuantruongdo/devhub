import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Post } from "../entities/Post";
import { Comment } from "../entities/Comment";
import { BaseRepo } from "./BaseRepo";
import { Repository } from "typeorm";

@Service()
export class PostRepo extends BaseRepo<Post> {
  constructor() {
    super(Post, AppDataSource);
  }

  private commentRepo = AppDataSource.getRepository(Comment);

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

  async findOnePost(id: number, currentUserId: number) {
    // GET POST
    const postQuery = this.createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoin("post.likes", "postLike", "postLike.userId = :currentUserId", {
        currentUserId,
      })
      .addSelect(
        `CASE WHEN postLike.id IS NOT NULL THEN 1 ELSE 0 END`,
        "post_isLiked",
      )
      .where(
        "(post.visibility = :publicVisibility OR post.authorId = :currentUserId)",
        {
          publicVisibility: "public",
          currentUserId,
        },
      )
      .andWhere("post.id = :id", { id });

    const { raw: postRaw, entities: postEntities } =
      await postQuery.getRawAndEntities();

    const post = postEntities[0];
    if (!post) return null;

    const postRow = postRaw[0];

    // GET ROOT COMMENTS
    const comments = await this.commentRepo
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.author", "author")
      .leftJoin(
        "comment.likes",
        "commentLike",
        "commentLike.userId = :currentUserId",
        { currentUserId },
      )
      .addSelect(
        `CASE WHEN commentLike.id IS NOT NULL THEN 1 ELSE 0 END`,
        "isLiked",
      )
      .where("comment.postId = :postId", { postId: id })
      .andWhere("comment.parentId IS NULL")

      // SORT
      .orderBy(
        `CASE WHEN comment.authorId = :currentUserId THEN 0 ELSE 1 END`,
        "ASC",
      )
      .addOrderBy("comment.likeCount", "DESC")
      .addOrderBy("comment.createdAt", "ASC")

      .getRawAndEntities();

    const commentEntities = comments.entities;
    const commentRaw = comments.raw;

    // map isLiked
    const commentMap = new Map<number, boolean>();
    commentRaw.forEach((r) => {
      commentMap.set(r.comment_id, !!r.isLiked);
    });

    // GET REPLIES
    const replies = await this.commentRepo
      .createQueryBuilder("reply")
      .leftJoinAndSelect("reply.author", "author")
      .leftJoin(
        "reply.likes",
        "replyLike",
        "replyLike.userId = :currentUserId",
        { currentUserId },
      )
      .addSelect(
        `CASE WHEN replyLike.id IS NOT NULL THEN 1 ELSE 0 END`,
        "isLiked",
      )
      .where("reply.postId = :postId", { postId: id })
      .andWhere("reply.parentId IS NOT NULL")

      // SORT
      .orderBy(
        `CASE WHEN reply.authorId = :currentUserId THEN 0 ELSE 1 END`,
        "ASC",
      )
      .addOrderBy("reply.likeCount", "DESC")
      .addOrderBy("reply.createdAt", "ASC")

      .getRawAndEntities();

    const replyEntities = replies.entities;
    const replyRaw = replies.raw;

    // map isLiked reply
    const replyMap = new Map<number, boolean>();
    replyRaw.forEach((r) => {
      replyMap.set(r.reply_id, !!r.isLiked);
    });

    // GROUP REPLIES
    const repliesByParent = new Map<number, any[]>();

    replyEntities.forEach((r: any) => {
      const parentId = r.parentId;
      if (!repliesByParent.has(parentId)) {
        repliesByParent.set(parentId, []);
      }

      repliesByParent.get(parentId)!.push({
        ...r,
        isLiked: replyMap.get(r.id) || false,
      });
    });

    // MERGE COMMENTS + REPLIES
    const finalComments = commentEntities.map((c: any) => ({
      ...c,
      isLiked: commentMap.get(c.id) || false,
      replies: repliesByParent.get(c.id) || [],
    }));

    // RETURN
    return {
      ...post,
      isLiked: !!postRow?.post_isLiked,
      comments: finalComments,
    };
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
