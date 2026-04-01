import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
@Unique(["user", "post"])
export class PostLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;
}
