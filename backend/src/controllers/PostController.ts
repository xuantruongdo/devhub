import {
  JsonController,
  Body,
  Param,
  Put,
  Delete,
  Post,
  CurrentUser,
  Get,
} from "routing-controllers";
import { Service } from "typedi";
import { PostService } from "../services/PostService";
import {
  CreateCommentDto,
  CreatePostDto,
  UpdatePostDto,
} from "../dtos/PostDto";
import { UserProps } from "../types/auth";

@Service()
@JsonController("/posts")
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  async create(
    @Body({ validate: true }) body: CreatePostDto,
    @CurrentUser() user: UserProps,
  ) {
    return this.postService.create(body, user);
  }

  @Get("/me")
  async findMe(@CurrentUser() user: UserProps) {
    return this.postService.findMe(user.id);
  }

  @Get("/feed")
  async getFeed(@CurrentUser() user: UserProps) {
    return this.postService.getFeed(user);
  }

  @Get("/:id")
  async findOne(@Param("id") id: number, @CurrentUser() user: UserProps) {
    return this.postService.findOne(id, user);
  }

  @Put("/:id")
  async update(
    @Param("id") id: number,
    @Body({ validate: true }) body: UpdatePostDto,
    @CurrentUser() user: UserProps,
  ) {
    return this.postService.update(id, body, user);
  }

  @Delete("/:id")
  async remove(@Param("id") id: number, @CurrentUser() user: UserProps) {
    return this.postService.remove(id, user);
  }

  @Post("/:id/like")
  async toggleLike(@Param("id") id: number, @CurrentUser() user: UserProps) {
    return this.postService.toggleLike(id, user);
  }

  @Post("/:commentId/comment/like")
  async likeComment(
    @Param("commentId") commentId: number,
    @CurrentUser() user: UserProps,
  ) {
    return this.postService.toggleLikeComment(commentId, user);
  }

  @Post("/:id/comment")
  async createComment(
    @Param("id") id: number,
    @Body({ validate: true }) body: CreateCommentDto,
    @CurrentUser() user: UserProps,
  ) {
    return this.postService.createComment(id, body, user);
  }

  @Delete("/:commentId/comment")
  async removeComment(
    @Param("commentId") commentId: number,
    @CurrentUser() user: UserProps,
  ) {
    return this.postService.removeComment(commentId, user);
  }
}
