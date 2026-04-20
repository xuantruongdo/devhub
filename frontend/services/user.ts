import instance from "@/lib/api";
import { BaseService } from "./base";
import { UpdateMediaInput } from "@/types/user";
import { FollowType } from "@/constants";

class UserService extends BaseService {
  constructor() {
    super("/users");
  }

  async findByUsername(username: string) {
    return await instance.get(`/users/${username}`);
  }

  async findMetadata(username: string) {
    return await instance.get(`/users/metadata/${username}`);
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

  async getListFollow(id: number, followType: FollowType) {
    return await instance.get(`/users/${id}/follow/${followType}`);
  }

  async search(params: {
    q: string;
    from?: number;
    size?: number;
    verified?: boolean;
  }) {
    return await instance.get("/users/search", { params });
  }

  async suggest() {
    return await instance.get(`/users/suggest`);
  }
}

const userService = new UserService();
export default userService;
