import { Service } from "typedi";
import { Comment } from "../entities/Comment";
import { AppDataSource } from "../config/data-source";
import { BaseRepo } from "./BaseRepo";

@Service()
export class CommentRepo extends BaseRepo<Comment> {
  constructor() {
    super(Comment, AppDataSource);
  }
}
