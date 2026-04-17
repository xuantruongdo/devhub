import { Service } from "typedi";
import { redis } from "../libs/redis";

@Service()
export class CacheService {
  async clearProfile(username: string) {
    await redis.del(`user:username:${username}`);
  }
}
