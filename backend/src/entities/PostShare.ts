import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
@Index(["postId"])
@Index(["userId"])
export class PostShare {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  postId!: number;

  @ManyToOne(() => User, (user) => user.shares, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Post, (post) => post.shares, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "postId" })
  post!: Post;

  @Column({ type: "text", nullable: true })
  content?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
