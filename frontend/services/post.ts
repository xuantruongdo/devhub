import instance from "@/lib/api";
import { BaseService } from "./base";

class PostService extends BaseService {
  constructor() {
    super("/posts");
  }

  async getFeed() {
    return await instance.get(`/posts/feed`);
  }
}

const postService = new PostService();
export default postService;
