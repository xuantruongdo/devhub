import instance from "@/lib/api";
import { BaseService } from "./base";
import { UpdateMediaInput } from "@/types/user";

class UserService extends BaseService {
  constructor() {
    super("/users");
  }

  async findByUsername(username: string) {
    return await instance.get(`/users/${username}`);
  }

  async findPostsByUsername(username: string) {
    return await instance.get(`/users/${username}/posts`);
  }

  async toggleFollow(targetUserId: number) {
    return await instance.post(`/users/follow/${targetUserId}`);
  }

  async updateMedia(id: number, data: UpdateMediaInput) {
    return await instance.put(`/users/${id}/media`, data);
  }
}

const userService = new UserService();
export default userService;
