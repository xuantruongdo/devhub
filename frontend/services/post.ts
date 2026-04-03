import instance from "@/lib/api";
import { BaseService } from "./base";

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
}

const postService = new PostService();
export default postService;
