import { Service } from "typedi";
import { PostRepo } from "../repositories/PostRepo";
import { CreatePostDto, UpdatePostDto } from "../dtos/PostDto";
import { UserProps } from "../types/auth";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import { AuthCodeError, PostCodeError } from "../constants/code";
import { UserRepo } from "../repositories/UserRepo";

@Service()
export class PostService {
  constructor(
    private readonly postRepo: PostRepo,
    private readonly userRepo: UserRepo,
  ) {}

  async findOne(id: number) {
    try {
      return this.postRepo.findById(id);
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

  async create(data: CreatePostDto, user: { id: number }) {
    try {
      return this.postRepo.create({
        ...data,
        authorId: user.id,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async update(id: number, data: UpdatePostDto, user: UserProps) {
    try {
      const post = await this.postRepo.findById(id);

      if (!post) throw new BadRequestError(PostCodeError.POST_NOT_FOUND);

      if (post.authorId !== user.id)
        throw new BadRequestError(PostCodeError.UNAUTHORIZED);

      const updatedPost = Object.assign(post, data);

      return this.postRepo.save(updatedPost);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async remove(id: number, user: UserProps) {
    try {
      const post = await this.postRepo.findById(id);

      if (!post) throw new BadRequestError(PostCodeError.POST_NOT_FOUND);

      if (post.authorId !== user.id)
        throw new BadRequestError(PostCodeError.UNAUTHORIZED);

      post.deletedAt = new Date();

      return this.postRepo.save(post);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }
}
