import instance from "@/lib/api";
import { BaseService } from "./base";
import { CommentInput } from "@/types/post";

class PostService extends BaseService {
  constructor() {
    super("/posts");
  }

  async getFeed() {
    return await instance.get(`/posts/feed`);
  }

  async like(id: number) {
    return await instance.post(`/posts/${id}/like`);
  }

  async comment(id: number, data: CommentInput) {
    return await instance.post(`/posts/${id}/comment`, data);
  }
}

const postService = new PostService();
export default postService;
