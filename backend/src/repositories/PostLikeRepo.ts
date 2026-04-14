import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { PostLike } from "../entities/PostLike";
import { BaseRepo } from "./BaseRepo";

@Service()
export class PostLikeRepo extends BaseRepo<PostLike> {
  constructor() {
    super(PostLike, AppDataSource);
  }
}
