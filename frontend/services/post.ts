import instance from "@/lib/api";
import { BaseService } from "./base";
import { CommentInput, GetFeedParams } from "@/types/post";

class PostService extends BaseService {
  constructor() {
    super("/posts");
  }

  async getFeed({ cursor }: GetFeedParams = {}) {
    return await instance.get(`/posts/feed`, {
      params: {
        cursor,
      },
    });
  }

  async like(id: number) {
    return await instance.post(`/posts/${id}/like`);
  }

  async comment(id: number, data: CommentInput) {
    return await instance.post(`/posts/${id}/comment`, data);
  }

  async removeComment(commentId: number) {
    return await instance.delete(`/posts/${commentId}/comment`);
  }

  async likeComment(commentId: number) {
    return await instance.post(`/posts/${commentId}/comment/like`);
  }
}

const postService = new PostService();
export default postService;
