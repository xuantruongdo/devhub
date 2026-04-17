import { Service } from "typedi";
import { PostRepo } from "../repositories/PostRepo";
import {
  CreateCommentDto,
  CreatePostDto,
  UpdatePostDto,
} from "../dtos/PostDto";
import { UserProps } from "../types/auth";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import {
  AuthCodeError,
  CommentCodeError,
  PostCodeError,
} from "../constants/code";
import { UserRepo } from "../repositories/UserRepo";
import { AppDataSource } from "../config/data-source";
import { Post } from "../entities/Post";
import { PostLike } from "../entities/PostLike";
import { Comment } from "../entities/Comment";
import { CommentLike } from "../entities/CommentLike";
import { Notification, NotificationType } from "../entities/Notification";
import { NotificationService } from "./NotificationService";
import { notificationQueue } from "../queues";
import { NotificationJobName } from "../constants";
import { redis } from "../libs/redis";
import { CommentRepo } from "../repositories/CommentRepo";

@Service()
export class PostService {
  constructor(
    private readonly postRepo: PostRepo,
    private readonly userRepo: UserRepo,
    private readonly commentRepo: CommentRepo,
    private readonly notificationService: NotificationService,
  ) {}

  async findOne(id: number, user: UserProps) {
    try {
      const currentUserId = user.id;
      const cacheKey = `post:${id}`;

      let post: Post;

      // Cache hit
      const cached = await redis.get(cacheKey);

      if (cached) {
        post = JSON.parse(cached);
      } else {
        const dbPost = await this.postRepo.findPostById(id, currentUserId);

        if (!dbPost) return null;

        post = dbPost;

        await redis.set(cacheKey, JSON.stringify(post), "EX", 300);
      }

      // Get count stat
      const counts = await this.postRepo.getPostCounts(id);

      const comments = await this.commentRepo.getRootComments(
        id,
        currentUserId,
      );

      const replies = await this.commentRepo.getReplies(id, currentUserId);

      const commentIds = comments.map((c) => c.id);
      const replyIds = replies.map((r) => r.id);

      const [commentLikeMap, replyLikeMap, postIsLiked] = await Promise.all([
        this.commentRepo.getLikedMap(commentIds, currentUserId),
        this.commentRepo.getLikedMap(replyIds, currentUserId),
        this.postRepo.checkPostLiked(id, currentUserId),
      ]);

      // normalize replies
      const repliesByParent = new Map<number, Comment[]>();

      for (const r of replies) {
        const parentId = r.parentId!;

        const mappedReply = {
          ...r,
          isLiked: replyLikeMap.get(r.id) ?? false,
          replies: [],
        };

        if (!repliesByParent.has(parentId)) {
          repliesByParent.set(parentId, []);
        }

        repliesByParent.get(parentId)!.push(mappedReply);
      }

      // Merge comment
      const finalComments = comments.map((c) => ({
        ...c,
        isLiked: commentLikeMap.get(c.id) ?? false,
        replies: repliesByParent.get(c.id) ?? [],
      }));

      return {
        ...post,
        likeCount: counts.likeCount,
        commentCount: counts.commentCount,
        shareCount: counts.shareCount,
        isLiked: postIsLiked,
        comments: finalComments,
      };
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async findMe(userId: number) {
    try {
      return this.postRepo.findMe(userId);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async getFeed(user: UserProps) {
    try {
      const currentUser = await this.userRepo.findById(user.id);

      if (!currentUser) {
        throw new UnauthorizedError(AuthCodeError.INVALID_CREDENTIALS);
      }
      const followingIds = currentUser.followings.map((user) => user.id);
      return this.postRepo.findAllFeed(user.id, followingIds);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async create(data: CreatePostDto, user: UserProps) {
    const post = await this.postRepo.save({
      ...data,
      authorId: user.id,
    });

    return this.postRepo.findOne({
      where: { id: post.id },
      relations: {
        author: true,
      },
      select: {
        id: true,
        content: true,
        images: true,
        visibility: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          avatar: true,
          isVerified: true,
        },
      },
    });
  }

  async update(id: number, data: UpdatePostDto, user: UserProps) {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
      });

      if (!post) throw new BadRequestError(PostCodeError.POST_NOT_FOUND);

      if (post.authorId !== user.id)
        throw new BadRequestError(PostCodeError.UNAUTHORIZED);

      const updatedPost = Object.assign(post, data);

      await this.postRepo.save(updatedPost);
      return this.postRepo.findOne({
        where: { id: post.id },
        relations: {
          author: true,
        },
        select: {
          id: true,
          content: true,
          images: true,
          visibility: true,
          likeCount: true,
          commentCount: true,
          shareCount: true,
          createdAt: true,
          updatedAt: true,
          author: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatar: true,
            isVerified: true,
          },
        },
      });
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async remove(id: number, user: UserProps) {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
      });

      if (!post) throw new BadRequestError(PostCodeError.POST_NOT_FOUND);

      if (post.authorId !== user.id)
        throw new BadRequestError(PostCodeError.UNAUTHORIZED);

      post.deletedAt = new Date();

      return this.postRepo.save(post);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async toggleLike(postId: number, user: UserProps) {
    try {
      let notification = null;
      let recipientId: number | null = null;

      const result = await AppDataSource.transaction(async (manager) => {
        const post = await manager.findOne(Post, {
          where: { id: postId },
        });

        if (!post) {
          throw new BadRequestError(PostCodeError.POST_NOT_FOUND);
        }

        const existing = await manager.findOne(PostLike, {
          where: { userId: user.id, postId },
        });

        if (existing) {
          await manager.delete(PostLike, {
            userId: user.id,
            postId,
          });

          await manager.decrement(Post, { id: postId }, "likeCount", 1);

          return { liked: false };
        }

        await manager.insert(PostLike, {
          userId: user.id,
          postId,
        });

        await manager.increment(Post, { id: postId }, "likeCount", 1);

        notification = await this.notificationService.create({
          recipientId: post.authorId,
          senderId: user.id,
          type: NotificationType.LIKE_POST,
          postId: post.id,
        });

        recipientId = post.authorId;

        return { liked: true };
      });

      if (notification && recipientId) {
        await notificationQueue.add(
          NotificationJobName.LIKE_POST,
          {
            recipientId,
            notification: {
              ...(notification as Notification),
              sender: user,
            },
          },
          {
            removeOnComplete: true,
          },
        );
      }

      return result;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async comment(id: number, data: CreateCommentDto, user: UserProps) {
    try {
      const { content, parentId } = data;

      let notification = null;
      let recipientId: number | null = null;

      const normalizeComment = await AppDataSource.transaction(
        async (manager) => {
          const comment = await manager.save(Comment, {
            content,
            postId: id,
            parentId,
            authorId: user.id,
            likeCount: 0,
          });

          await manager.increment(Post, { id }, "commentCount", 1);

          const post = await manager.findOne(Post, { where: { id } });

          if (post && post.authorId !== user.id) {
            notification = await this.notificationService.create({
              recipientId: post.authorId,
              senderId: user.id,
              type: NotificationType.COMMENT,
              postId: id,
              commentId: comment.id,
            });

            recipientId = post.authorId;
          }

          const result = await manager
            .createQueryBuilder(Comment, "comment")
            .leftJoinAndSelect("comment.author", "author")
            .leftJoinAndSelect("comment.replies", "replies")
            .leftJoinAndSelect("replies.author", "replyAuthor")
            .select([
              "comment.id",
              "comment.content",
              "comment.postId",
              "comment.parentId",
              "comment.likeCount",
              "comment.createdAt",
              "author.id",
              "author.username",
              "author.fullName",
              "author.avatar",
              "author.isVerified",
              "replies.id",
              "replies.content",
              "replies.postId",
              "replies.parentId",
              "replies.likeCount",
              "replies.createdAt",
              "replyAuthor.id",
              "replyAuthor.username",
              "replyAuthor.fullName",
              "replyAuthor.avatar",
              "replyAuthor.isVerified",
            ])
            .where("comment.id = :id", { id: comment.id })
            .getOne();

          return result;
        },
      );

      if (notification && recipientId) {
        await notificationQueue.add(
          NotificationJobName.COMMENT,
          {
            recipientId,
            notification: {
              ...(notification as Notification),
              sender: user,
            },
          },
          {
            removeOnComplete: true,
          },
        );
      }

      return normalizeComment;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }
  async removeComment(commentId: number, user: UserProps) {
    try {
      return await AppDataSource.transaction(async (manager) => {
        const commentRepo = manager.getRepository(Comment);
        const postRepo = manager.getRepository(Post);

        const comment = await commentRepo.findOne({
          where: { id: commentId },
        });

        if (!comment) {
          throw new BadRequestError(CommentCodeError.COMMENT_NOT_FOUND);
        }

        if (comment.authorId !== user.id) {
          throw new BadRequestError(CommentCodeError.UNAUTHORIZED);
        }

        await commentRepo.remove(comment);
        await postRepo.decrement({ id: comment.postId }, "commentCount", 1);

        return { success: true };
      });
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async toggleLikeComment(commentId: number, user: UserProps) {
    try {
      let notification = null;
      let recipientId: number | null = null;

      const result = await AppDataSource.transaction(async (manager) => {
        const comment = await manager.findOne(Comment, {
          where: { id: commentId },
        });

        if (!comment) {
          throw new BadRequestError(CommentCodeError.COMMENT_NOT_FOUND);
        }

        const existing = await manager.findOne(CommentLike, {
          where: {
            commentId,
            userId: user.id,
          },
        });

        if (existing) {
          await manager.delete(CommentLike, {
            commentId,
            userId: user.id,
          });

          await manager.decrement(Comment, { id: commentId }, "likeCount", 1);

          return { liked: false };
        }

        await manager.insert(CommentLike, {
          commentId,
          userId: user.id,
        });

        await manager.increment(Comment, { id: commentId }, "likeCount", 1);

        if (comment.authorId !== user.id) {
          notification = await this.notificationService.create({
            recipientId: comment.authorId,
            senderId: user.id,
            type: NotificationType.LIKE_COMMENT,
            postId: comment.postId,
            commentId: comment.id,
          });

          recipientId = comment.authorId;
        }

        return { liked: true };
      });

      if (notification && recipientId) {
        await notificationQueue.add(
          NotificationJobName.LIKE_COMMENT,
          {
            recipientId,
            notification: {
              ...(notification as Notification),
              sender: user,
            },
          },
          {
            removeOnComplete: true,
          },
        );
      }

      return result;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }
}
