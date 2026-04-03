import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
  Column,
  Index,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
@Unique(["userId", "postId"])
@Index(["postId"])
@Index(["userId"])
@Index(["postId", "userId"])
export class PostLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  postId!: number;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "postId" })
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;
}
