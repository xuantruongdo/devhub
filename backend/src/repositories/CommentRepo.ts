import { Service } from "typedi";
import { Repository } from "typeorm";
import { Comment } from "../entities/Comment";
import { AppDataSource } from "../config/data-source";

@Service()
export class CommentRepo {
  private repo: Repository<Comment>;

  constructor() {
    this.repo = AppDataSource.getRepository(Comment);
  }

  async create(data: Partial<Comment>) {
    const comment = this.repo.create(data);
    return this.repo.save(comment);
  }

  async findByPost(postId: number) {
    return this.repo.find({
      where: { postId },
      relations: ["author", "replies"],
      order: { createdAt: "ASC" },
    });
  }
}
